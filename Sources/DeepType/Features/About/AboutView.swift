import DeepTypeCore
import SwiftUI

struct AboutView: View {
    @Bindable var updater: AppUpdater
    let shortcut: DictationShortcut
    static let version = Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String ?? "Development"
    static let changelog = URL(string: "https://deeptype.com/changelog")!
    private let repository = URL(string: "https://github.com/deepbikram/DeepType")!

    var body: some View {
        Form {
            Section {
                VStack(spacing: 10) {
                    // ponytail: text-free mascot, falls back to the vector tile.
                    BrandingImage.view("mascot-clean", size: 120, cornerRadius: 20)
                    Text("DeepType").font(.title.weight(.semibold))
                    Text("Version \(Self.version)")
                        .foregroundStyle(.secondary)
                        .textSelection(.enabled)
                    Text("Dictation for your Mac. Press \(shortcut.displayName) in any app, speak, and your words appear where you’re typing. Speech runs on this Mac by default. Choosing an API connection or Codex subscription transcription sends audio to that provider.")
                        .multilineTextAlignment(.center)
                        .foregroundStyle(.secondary)
                        .frame(maxWidth: 480)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 12)
            }

            Section {
                Toggle(isOn: $updater.automaticallyChecksForUpdates) {
                    Text("Check for updates automatically")
                    Text("Looks for a new release on GitHub once a day.")
                }
                Toggle(isOn: $updater.automaticallyDownloadsUpdates) {
                    Text("Download and install automatically")
                    Text("New versions install the next time DeepType quits.")
                }
                .disabled(!updater.automaticallyChecksForUpdates)
                Button("Check for Updates…", action: updater.checkForUpdates)
                    .disabled(!updater.canCheckForUpdates)
                    .frame(maxWidth: .infinity, alignment: .trailing)
            } header: {
                Text("Updates")
            } footer: {
                Text("Update checks contact GitHub only. They never include your audio or text.")
                    .foregroundStyle(.secondary)
            }

            Section {
                LabeledContent {
                    Link("View on GitHub", destination: repository)
                } label: {
                    Text("Source code")
                    Text("Browse the code and every release.")
                }
                LabeledContent {
                    Link("Open an Issue", destination: repository.appending(path: "issues"))
                } label: {
                    Text("Feedback")
                    Text("Report a bug or suggest a feature.")
                }
                LabeledContent {
                    Link("What’s New", destination: Self.changelog)
                } label: {
                    Text("Changelog")
                    Text("See what changed in each release.")
                }
                LabeledContent {
                    Link("Buy Me a Coffee", destination: URL(string: "https://buymeacoffee.com/deepbikram")!)
                } label: {
                    Text("Support")
                    Text("Help fund DeepType’s development.")
                }
            } header: {
                Text("Open Source")
            } footer: {
                Text("DeepType is free and open source under the Apache 2.0 license. If it saves you some typing, a star on GitHub helps others find it.")
                    .foregroundStyle(.secondary)
            }

            Section("Credits") {
                LabeledContent("Created by", value: "Deep Bikram Thapa Chhetri")
            }
        }
        .formStyle(.grouped)
        .toggleStyle(.switch)
    }
}
