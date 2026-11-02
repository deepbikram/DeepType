import AppKit
import SwiftUI

struct BrandMark: View {
    var size: CGFloat = 34
    @Environment(\.colorScheme) private var colorScheme

    var body: some View {
        let dark = colorScheme == .dark
        let tile = RoundedRectangle(cornerRadius: size * 0.225, style: .continuous)
        tile
            .fill(LinearGradient(
                colors: dark
                    ? [Color(red: 0.149, green: 0.149, blue: 0.165), Color(red: 0.055, green: 0.055, blue: 0.063)]
                    : [.white, Color(red: 0.945, green: 0.937, blue: 0.922)],
                startPoint: .top,
                endPoint: .bottom
            ))
            .overlay(tile.strokeBorder(Color.primary.opacity(0.1), lineWidth: 0.5))
            .overlay(
                DMark()
                    .foregroundStyle(dark ? Color(red: 0.957, green: 0.949, blue: 0.929) : Color(red: 0.078, green: 0.078, blue: 0.086))
                    .padding(size * 0.08)
            )
            .frame(width: size, height: size)
            .accessibilityHidden(true)
    }
}

// ponytail: new D-waveform mark; geometry from Resources/Branding/deeptype-mark-*.svg (viewBox 100).
struct DMark: View {
    var body: some View {
        GeometryReader { geo in
            let side = min(geo.size.width, geo.size.height)
            ZStack {
                DOutline().stroke(
                    style: StrokeStyle(lineWidth: side * 0.15, lineCap: .round, lineJoin: .round)
                )
                DBars().fill()
            }
            .frame(width: side, height: side)
            .position(x: geo.size.width / 2, y: geo.size.height / 2)
        }
        .aspectRatio(1, contentMode: .fit)
    }
}

struct DOutline: Shape {
    func path(in rect: CGRect) -> Path {
        let s = rect.width / 100
        func point(_ x: CGFloat, _ y: CGFloat) -> CGPoint {
            CGPoint(x: rect.minX + x * s, y: rect.minY + y * s)
        }
        var path = Path()
        path.move(to: point(29, 21))
        path.addLine(to: point(57, 21))
        path.addCurve(to: point(85, 50), control1: point(74, 21), control2: point(85, 33))
        path.addCurve(to: point(57, 79), control1: point(85, 67), control2: point(74, 79))
        path.addLine(to: point(29, 79))
        return path
    }
}

struct DBars: Shape {
    func path(in rect: CGRect) -> Path {
        let s = rect.width / 100
        func bar(_ x: CGFloat, _ y: CGFloat, _ w: CGFloat, _ h: CGFloat) -> CGRect {
            CGRect(x: rect.minX + x * s, y: rect.minY + y * s, width: w * s, height: h * s)
        }
        var path = Path()
        path.addRoundedRect(in: bar(43, 44, 7, 12), cornerSize: CGSize(width: 3.5 * s, height: 3.5 * s))
        path.addRoundedRect(in: bar(55, 35, 7, 30), cornerSize: CGSize(width: 3.5 * s, height: 3.5 * s))
        path.addRoundedRect(in: bar(67, 41, 7, 18), cornerSize: CGSize(width: 3.5 * s, height: 3.5 * s))
        return path
    }
}

struct BrandGlyph {
    // ponytail: menu bar template drawn from the same SVG-master geometry; monochrome via isTemplate.
    @MainActor static let menuBarImage: NSImage = {
        let dPath: CGPath = {
            let path = CGMutablePath()
            path.move(to: CGPoint(x: 29, y: 21))
            path.addLine(to: CGPoint(x: 57, y: 21))
            path.addCurve(to: CGPoint(x: 85, y: 50), control1: CGPoint(x: 74, y: 21), control2: CGPoint(x: 85, y: 33))
            path.addCurve(to: CGPoint(x: 57, y: 79), control1: CGPoint(x: 85, y: 67), control2: CGPoint(x: 74, y: 79))
            path.addLine(to: CGPoint(x: 29, y: 79))
            return path
        }()
        let bars = [
            CGRect(x: 43, y: 44, width: 7, height: 12),
            CGRect(x: 55, y: 35, width: 7, height: 30),
            CGRect(x: 67, y: 41, width: 7, height: 18),
        ]
        var bounds = dPath.boundingBoxOfPath
        for bar in bars { bounds = bounds.union(bar) }
        bounds = bounds.insetBy(dx: -9, dy: -9)
        let scale = 19 / bounds.height
        let size = NSSize(width: ceil(bounds.width * scale), height: ceil(bounds.height * scale))
        let image = NSImage(size: size, flipped: true) { _ in
            guard let context = NSGraphicsContext.current?.cgContext else { return false }
            context.translateBy(x: -bounds.minX * scale, y: -bounds.minY * scale)
            context.scaleBy(x: scale, y: scale)
            context.addPath(dPath)
            context.setLineWidth(15)
            context.setLineCap(.round)
            context.setLineJoin(.round)
            context.strokePath()
            for bar in bars {
                context.addPath(CGPath(roundedRect: bar, cornerWidth: 3.5, cornerHeight: 3.5, transform: nil))
            }
            context.fillPath()
            return true
        }
        image.isTemplate = true
        return image
    }()
}
