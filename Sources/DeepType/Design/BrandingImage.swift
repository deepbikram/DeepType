import AppKit
import SwiftUI

/// Loads a gathered branding PNG from the app bundle, with graceful fallback.
/// ponytail: plain NSImage lookup, no asset catalog needed for 6 files.
enum BrandingImage {
    static func nsImage(_ name: String) -> NSImage? {
        if let url = Bundle.main.url(forResource: name, withExtension: "png", subdirectory: "Branding") {
            return NSImage(contentsOf: url)
        }
        // Dev fallback: swift build without the .app wrapper.
        for base in [Bundle.main.resourcePath, Bundle.main.bundlePath] {
            guard let base else { continue }
            let url = URL(fileURLWithPath: base).appending(path: "Branding/\(name).png")
            if let image = NSImage(contentsOf: url) { return image }
        }
        return nil
    }

    static func view(_ name: String, size: CGFloat, cornerRadius: CGFloat = 0) -> AnyView {
        guard let image = nsImage(name) else { return AnyView(BrandMark(size: size)) }
        return AnyView(
            Image(nsImage: image)
                .resizable()
                .aspectRatio(contentMode: .fit)
                .frame(width: size, height: size)
                .clipShape(RoundedRectangle(cornerRadius: cornerRadius, style: .continuous))
                .accessibilityHidden(true)
        )
    }
}
