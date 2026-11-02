import AppKit
import SwiftUI

let size = CGSize(width: 640, height: 420)
let leftSlot = CGPoint(x: 160, y: 170)
let rightSlot = CGPoint(x: 480, y: 170)
let slotSize = CGSize(width: 190, height: 210)

struct Arrow: Shape {
    func path(in rect: CGRect) -> Path {
        let y = rect.midY
        let tipX = rect.maxX
        let tailX = rect.minX
        return Path { path in
            path.move(to: CGPoint(x: tailX, y: y))
            path.addLine(to: CGPoint(x: tipX - 12, y: y))
            path.move(to: CGPoint(x: tipX, y: y))
            path.addLine(to: CGPoint(x: tipX - 16, y: y - 12))
            path.move(to: CGPoint(x: tipX, y: y))
            path.addLine(to: CGPoint(x: tipX - 16, y: y + 12))
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
                    .frame(width: slotSize.width, height: slotSize.height)
                    .position(center)
                RoundedRectangle(cornerRadius: 18)
                    .stroke(.white.opacity(0.22), lineWidth: 2)
                    .frame(width: slotSize.width, height: slotSize.height)
                    .position(center)
            }
            Arrow()
                .stroke(.white.opacity(0.6), style: StrokeStyle(lineWidth: 3, lineCap: .round, lineJoin: .round))
                .frame(width: 100, height: 26)
                .position(x: (leftSlot.x + rightSlot.x) / 2, y: leftSlot.y)
            Text("Drag DeepType into Applications")
                .font(.system(size: 12, weight: .medium))
                .tracking(1)
                .foregroundStyle(.white.opacity(0.55))
                .position(x: size.width / 2, y: 330)
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
