import AppKit
import SwiftUI

let size = CGSize(width: 642, height: 406)
let leftSlot = CGPoint(x: 164, y: 165)
let rightSlot = CGPoint(x: 478, y: 165)

struct Arrow: Shape {
    func path(in rect: CGRect) -> Path {
        let tip = CGPoint(x: 362, y: 150)
        return Path { path in
            path.move(to: CGPoint(x: 280, y: 150))
            path.addLine(to: CGPoint(x: tip.x - 10, y: tip.y))
            path.move(to: tip)
            path.addLine(to: CGPoint(x: tip.x - 14, y: tip.y - 11))
            path.move(to: tip)
            path.addLine(to: CGPoint(x: tip.x - 14, y: tip.y + 11))
        }
    }
}

struct Background: View {
    var body: some View {
        ZStack {
            LinearGradient(colors: [Color(red: 0.27, green: 0.27, blue: 0.31), Color(red: 0.14, green: 0.14, blue: 0.17)],
                           startPoint: .top, endPoint: .bottom)
            // ponytail: diagonal pinstripe texture, same trick as the linen original.
            Canvas { context, canvas in
                context.translateBy(x: canvas.width / 2, y: canvas.height / 2)
                context.rotate(by: .degrees(-45))
                let diag = (canvas.width + canvas.height) / 2
                for x in stride(from: -diag, through: diag, by: 5) {
                    context.stroke(
                        Path { $0.move(to: CGPoint(x: x, y: -diag)); $0.addLine(to: CGPoint(x: x, y: diag)) },
                        with: .color(.white.opacity(0.022)),
                        lineWidth: 1)
                }
            }
            ForEach([leftSlot, rightSlot], id: \.x) { center in
                RoundedRectangle(cornerRadius: 18)
                    .fill(.white.opacity(0.05))
                    .frame(width: 200, height: 220)
                    .position(center)
                RoundedRectangle(cornerRadius: 18)
                    .stroke(.white.opacity(0.22), lineWidth: 2)
                    .frame(width: 200, height: 220)
                    .position(center)
            }
            Arrow()
                .stroke(.white.opacity(0.6), style: StrokeStyle(lineWidth: 3, lineCap: .round, lineJoin: .round))
            Text("SIMPLY DRAG")
                .font(.system(size: 13, weight: .semibold))
                .tracking(3)
                .foregroundStyle(.white.opacity(0.55))
                .position(x: 321, y: 190)
        }
        .frame(width: size.width, height: size.height)
        .environment(\.colorScheme, .dark)
    }
}

guard CommandLine.arguments.count == 2 else {
    fatalError("Usage: swift dmg-background.swift output.tiff")
}
let tiff = MainActor.assumeIsolated {
    let image = NSImage(size: size)
    for scale in [1.0, 2.0] {
        let renderer = ImageRenderer(content: Background())
        renderer.scale = scale
        guard let cgImage = renderer.cgImage else { fatalError("Could not render the background at \(scale)x") }
        let bitmap = NSBitmapImageRep(cgImage: cgImage)
        bitmap.size = size
        image.addRepresentation(bitmap)
    }
    return image.tiffRepresentation(using: .lzw, factor: 1)!
}
try tiff.write(to: URL(fileURLWithPath: CommandLine.arguments[1]), options: .atomic)
