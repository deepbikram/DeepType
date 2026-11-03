import Foundation

/// Points the hardware dictation (microphone) key at F5 with `hidutil`, so it can
/// start DeepType instead of Apple's dictation.
///
/// The mapping lives in the current login session and resets on restart, so
/// `AppModel` reapplies it at launch when the user turned it on.
///
/// ponytail: shell out to `/usr/bin/hidutil` rather than an IOKit helper. Move to
/// `IOHIDEventSystemClient` only if we need per-device mappings.
enum MicKeyRemap {
    /// Consumer-page "Voice Command", the usage Apple's dictation key reports.
    static let micUsage: UInt64 = 0xC000000CF
    /// Keyboard-page F5.
    static let f5Usage: UInt64 = 0x70000003E

    /// Whether the microphone key currently resolves to F5.
    static var isApplied: Bool {
        current().contains { $0.src == micUsage && $0.dst == f5Usage }
    }

    /// Points the microphone key at F5, keeping any other user key mappings.
    @discardableResult
    static func apply() -> Bool {
        var mappings = current().filter { $0.src != micUsage }
        mappings.append((micUsage, f5Usage))
        return set(mappings)
    }

    /// Removes our remap so the microphone key returns to its normal behavior.
    @discardableResult
    static func reset() -> Bool {
        set(current().filter { $0.src != micUsage })
    }

    static func current() -> [(src: UInt64, dst: UInt64)] {
        guard let output = run(["property", "--get", "UserKeyMapping"]) else { return [] }
        return parse(output)
    }

    /// Reads the `UserKeyMapping` table, which prints one block per keyboard.
    static func parse(_ output: String) -> [(src: UInt64, dst: UInt64)] {
        let blockPattern = #"\{[^}]*\}"#
        guard let blockRegex = try? NSRegularExpression(pattern: blockPattern) else { return [] }
        let blocks = blockRegex.matches(in: output, range: NSRange(output.startIndex..., in: output))
        var seen = Set<String>()
        return blocks.compactMap { match in
            guard let range = Range(match.range, in: output) else { return nil }
            let block = String(output[range])
            guard let src = number(after: "HIDKeyboardModifierMappingSrc = ", in: block),
                  let dst = number(after: "HIDKeyboardModifierMappingDst = ", in: block) else { return nil }
            let key = "\(src)-\(dst)"
            guard seen.insert(key).inserted else { return nil }
            return (src, dst)
        }
    }

    private static func number(after prefix: String, in block: String) -> UInt64? {
        guard let start = block.range(of: prefix)?.upperBound else { return nil }
        let digits = block[start...].prefix { $0.isNumber }
        return UInt64(digits)
    }

    private static func set(_ mappings: [(src: UInt64, dst: UInt64)]) -> Bool {
        let entries = mappings.map {
            #"{"HIDKeyboardModifierMappingSrc":\#($0.src),"HIDKeyboardModifierMappingDst":\#($0.dst)}"#
        }.joined(separator: ",")
        return run(["property", "--set", #"{"UserKeyMapping":[\#(entries)]}"#]) != nil
    }

    private static func run(_ arguments: [String]) -> String? {
        let process = Process()
        process.executableURL = URL(fileURLWithPath: "/usr/bin/hidutil")
        process.arguments = arguments
        let output = Pipe()
        process.standardOutput = output
        process.standardError = Pipe()
        do { try process.run() } catch { return nil }
        let data = output.fileHandleForReading.readDataToEndOfFile()
        process.waitUntilExit()
        guard process.terminationStatus == 0 else { return nil }
        return String(decoding: data, as: UTF8.self)
    }
}
