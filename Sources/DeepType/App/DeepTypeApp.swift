import AppKit
import DeepTypeCore
import SwiftUI

struct DeepTypeApp: App {
    @NSApplicationDelegateAdaptor(AppDelegate.self) private var delegate

    var body: some Scene {
        Window("DeepType", id: "dashboard") {
            ZStack {
                if delegate.model.needsOnboarding {
                    OnboardingView(model: delegate.model)
                        .windowChromeHidden()
                        .transition(.opacity)
                } else {
                    DashboardView(model: delegate.model)
                        .transition(.opacity)
                }
            }
            .onReceive(NotificationCenter.default.publisher(for: NSApplication.didBecomeActiveNotification)) { _ in
                delegate.model.refreshPermissions()
            }
            .frame(minWidth: 760, minHeight: 520)
            .environment(\.appTheme, delegate.model.settings.theme)
            .animation(.easeInOut(duration: 0.4), value: delegate.model.needsOnboarding)
        }
        .defaultSize(width: 920, height: 680)
        .commands {
            SidebarCommands()
            CommandGroup(after: .appInfo) {
                Button("Check for Updates…") { delegate.model.updater.checkForUpdates() }
                    .disabled(!delegate.model.updater.canCheckForUpdates)
            }
            CommandGroup(after: .saveItem) {
                Button("Export History…") { delegate.model.exportHistory() }
                    .disabled(delegate.model.history.isEmpty)
            }
            CommandGroup(after: .newItem) {
                Button(delegate.model.phase == .recording ? "Finish dictation" : "Start dictation") {
                    delegate.model.toggleRecording()
                }
                Button("Cancel dictation") { delegate.model.cancelRecording() }
                    .keyboardShortcut(.escape, modifiers: [])
                    .disabled(!delegate.model.isBusy)
            }
            CommandGroup(after: .help) {
                WelcomeGuideButton(model: delegate.model)
            }
        }
        MenuBarExtra(isInserted: Binding(
            get: { delegate.model.settings.showMenuBarIcon },
            // ponytail: SwiftUI re-pushes the value on every MenuBarExtra
            // reconfigure; writing it back unconditionally re-invalidates the
            // graph and spins the main thread forever in saveSettings IPC.
            set: {
                guard delegate.model.settings.showMenuBarIcon != $0 else { return }
                delegate.model.settings.showMenuBarIcon = $0
                delegate.model.saveSettings()
            }
        )) {
            MenuContents(model: delegate.model)
        } label: {
            Label {
                Text("DeepType")
            } icon: {
                if delegate.model.phase == .recording {
                    Image(systemName: "mic.fill")
                } else {
                    Image(nsImage: BrandGlyph.menuBarImage)
                }
            }
        }
    }
}

private struct WelcomeGuideButton: View {
    let model: AppModel
    @Environment(\.openWindow) private var openWindow

    var body: some View {
        Button("Show Welcome Guide") {
            model.showOnboarding()
            openWindow(id: "dashboard")
            NSApplication.shared.activate(ignoringOtherApps: true)
        }
        .disabled(model.needsOnboarding)
    }
}

private struct MenuContents: View {
    let model: AppModel
    @Environment(\.openWindow) private var openWindow

    var body: some View {
        Text(status)
        Button { model.toggleRecording() } label: {
            Text(model.phase == .recording ? "Finish Dictation" : "Start Dictation")
            Text(model.settings.shortcut.displayName)
        }
        .disabled(model.phase == .preparing || model.phase == .transcribing)
        if model.isBusy { Button("Cancel") { model.cancelRecording() } }
        Button(model.meetings.capturingID == nil ? "Start Meeting Notes" : "Stop Meeting") {
            guard model.meetings.capturingID == nil else { return model.meetings.stop() }
            model.startNotetaker()
        }
        Divider()
        Picker("Model", selection: Binding(
            get: { model.selectedModel.id },
            set: { id in
                if let speechModel = model.models.first(where: { $0.id == id }) { model.selectModel(speechModel) }
            }
        )) {
            ForEach(model.models.filter(model.isModelInstalled)) { speechModel in
                Text(speechModel.name).tag(speechModel.id)
            }
        }
        .disabled(model.isBusy)
        MicrophonePicker(model: model) { Text("Microphone") }
        Divider()
        Button("Open Dashboard", action: openDashboard)
        Button("Settings…") {
            model.selectedPage = .settings
            openDashboard()
        }
        .keyboardShortcut(",")
        if let version = model.updater.pendingVersion {
            Button("Install DeepType \(version)…") { model.updater.installUpdate() }
        } else {
            Button("Check for Updates…") { model.updater.checkForUpdates() }
                .disabled(!model.updater.canCheckForUpdates)
        }
        Divider()
        Button("Quit DeepType") { NSApplication.shared.terminate(nil) }.keyboardShortcut("q")
    }

    private var status: String {
        switch model.phase {
        case .recording: "Listening…"
        case .transcribing: "Transcribing…"
        case .preparing: "Preparing…"
        case .idle, .failed, .unpasted, .cancelled, .completed, .sending: "DeepType: Ready"
        }
    }

    private func openDashboard() {
        openWindow(id: "dashboard")
        NSApplication.shared.activate(ignoringOtherApps: true)
    }
}

@MainActor
final class AppDelegate: NSObject, NSApplicationDelegate {
    let model = AppModel()
    private var capsule: CapsuleController?
    private var notetaker: NotetakerController?
    private var started = false

    func applicationWillFinishLaunching(_ notification: Notification) {
        model.applyDockVisibility()
    }

    func applicationDidFinishLaunching(_ notification: Notification) {
        start()
        // ponytail: accessory apps never activate themselves; without this the
        // first-run onboarding window opens behind everything and looks dead.
        if model.settings.showInDock || model.needsOnboarding { NSApplication.shared.activate(ignoringOtherApps: true) }
    }

    func start() {
        guard !started else { return }
        started = true
        capsule = CapsuleController(model: model)
        model.onPresentationChange = { [weak self] in self?.capsule?.update() }
        notetaker = NotetakerController(model: model)
        model.onShowNotetaker = { [weak self] in self?.notetaker?.show($0) }
        model.registerShortcut()
        capsule?.update()
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool { false }

    // ponytail: with both Dock and menu bar off, reopening the app from Finder,
    // Spotlight or Launchpad is the only way back to the dashboard.
    func applicationShouldHandleReopen(_ sender: NSApplication, hasVisibleWindows flag: Bool) -> Bool {
        guard !flag else { return true }
        model.onShowDashboard?()
        NSApplication.shared.activate(ignoringOtherApps: true)
        NSApp.windows.first(where: { $0.canBecomeMain })?.makeKeyAndOrderFront(nil)
        return true
    }

    func applicationShouldTerminate(_ sender: NSApplication) -> NSApplication.TerminateReply {
        model.discardRecording()
        guard let pending = model.mediaPauser.pending else { return .terminateNow }
        Task {
            await pending.value
            sender.reply(toApplicationShouldTerminate: true)
        }
        return .terminateLater
    }

    func applicationWillTerminate(_ notification: Notification) {
        model.discardRecording()
        model.meetings.endForQuit()
        model.transcriptions.endForQuit()
        capsule?.close()
        notetaker?.close()
        LlamaEngine.shared.shutdown()
    }
}

private extension View {
    @ViewBuilder func windowChromeHidden() -> some View {
        if #available(macOS 15, *) {
            toolbar(removing: .title)
                .toolbarBackgroundVisibility(.hidden, for: .windowToolbar)
        } else {
            self
        }
    }
}
