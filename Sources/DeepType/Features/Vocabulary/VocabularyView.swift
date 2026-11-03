import DeepTypeCore
import SwiftUI

struct VocabularyView: View {
    private enum Sort: CaseIterable { case added, alphabetical, learnedFirst }
    private enum Filter: CaseIterable { case all, learned, manual }

    @Bindable var model: AppModel
    @State private var phrase = ""
    @State private var replacement = ""
    @State private var query = ""
    @State private var sort = Sort.added
    @State private var filter = Filter.all

    private var canAdd: Bool { !phrase.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty }

    private var visibleVocabulary: [VocabularyEntry] {
        let matching = model.vocabulary.filter { entry in
            let matchesQuery = query.isEmpty
                || entry.phrase.localizedStandardContains(query)
                || entry.replacement.localizedStandardContains(query)
            let matchesFilter = switch filter {
            case .all: true
            case .learned: entry.learned
            case .manual: !entry.learned
            }
            return matchesQuery && matchesFilter
        }
        switch sort {
        case .added: return matching
        case .alphabetical: return matching.sorted { $0.phrase.localizedStandardCompare($1.phrase) == .orderedAscending }
        case .learnedFirst: return matching.sorted { $0.learned != $1.learned ? $0.learned : $0.phrase.localizedStandardCompare($1.phrase) == .orderedAscending }
        }
    }

    var body: some View {
        Form {
            Section {
                TextField("Spoken phrase", text: $phrase, prompt: Text("better whisper"))
                TextField("Write as", text: $replacement, prompt: Text("Optional, e.g. DeepType"))
            } header: {
                Text("Add a Word")
            } footer: {
                HStack(alignment: .top) {
                    Text("Leave “Write as” empty to add a spelling hint. To fix a misheard command, write the command, such as “Kocia mark” as “question mark”. Replacements apply to whole phrases, so unrelated words stay intact.")
                        .foregroundStyle(.secondary)
                    Spacer(minLength: 20)
                    Button("Add Word", action: addEntry)
                        .disabled(!canAdd)
                }
            }
            .onSubmit { if canAdd { addEntry() } }

            if model.selectedModel.engine == .parakeet {
                phraseBoosterSection
            }

            Section {
                if model.vocabulary.isEmpty {
                    Text("Add a name that often gets misspelled, a technical term or a phrase you use every day.")
                        .foregroundStyle(.secondary)
                } else if visibleVocabulary.isEmpty {
                    Text("No entries match this search or filter.")
                        .foregroundStyle(.secondary)
                }
                ForEach(visibleVocabulary) { entry in
                    LabeledContent {
                        HStack(spacing: 10) {
                            Text(entry.replacement.isEmpty ? entry.phrase : entry.replacement)
                                .foregroundStyle(.primary)
                            Button { model.deleteVocabulary(entry) } label: {
                                Image(systemName: "minus.circle.fill")
                            }
                            .buttonStyle(.borderless)
                            .foregroundStyle(.secondary)
                            .help("Remove \(entry.phrase)")
                            .accessibilityLabel("Remove \(entry.phrase)")
                        }
                    } label: {
                        HStack(spacing: 6) {
                            Text(entry.phrase)
                            if entry.learned {
                                Text("Learned")
                                    .font(.caption2.weight(.medium))
                                    .padding(.horizontal, 6)
                                    .padding(.vertical, 1)
                                    .background(.tint.opacity(0.15), in: Capsule())
                                    .foregroundStyle(.tint)
                                    .help("Added from a correction you made")
                            }
                        }
                    }
                }
            } header: {
                HStack {
                    if model.vocabulary.isEmpty {
                        Text("Your Vocabulary")
                    } else {
                        Text("^[\(visibleVocabulary.count) entry](inflect: true)")
                    }
                    Spacer()
                    if !model.vocabulary.isEmpty {
                        SectionOptionsMenu("Vocabulary options") {
                            Picker("Order", selection: $sort) {
                                Text("Added order").tag(Sort.added)
                                Text("Alphabetical").tag(Sort.alphabetical)
                                Text("Learned first").tag(Sort.learnedFirst)
                            }
                            .pickerStyle(.inline)
                            Divider()
                            Picker("Show", selection: $filter) {
                                Text("All entries").tag(Filter.all)
                                Text("Learned only").tag(Filter.learned)
                                Text("Added by me").tag(Filter.manual)
                            }
                            .pickerStyle(.inline)
                        }
                    }
                }
            } footer: {
                if model.settings.learnCorrections {
                    Text("Entries marked Learned come from fixes you made to a dictation, in History or right after DeepType pasted it. Remove any you don’t want.")
                        .foregroundStyle(.secondary)
                }
            }
        }
        .formStyle(.grouped)
        .searchable(text: $query, prompt: "Search vocabulary")
    }

    private var phraseBoosterSection: some View {
        Section {
            if model.phraseBoosterInstalled {
                Label("Phrase booster is on. When you speak English, it listens for these words and fixes the spelling where your voice matches one. It runs on this Mac.", systemImage: "checkmark.circle")
                    .foregroundStyle(.secondary)
            } else {
                let installation = model.installation?.id == AppModel.phraseBoosterID ? model.installation : nil
                let installing = installation != nil && installation?.failure == nil
                LabeledContent {
                    if installing {
                        Button("Cancel", action: model.cancelInstallation)
                    } else {
                        Button(installation == nil ? "Download" : "Retry") { model.installPhraseBooster() }
                            .disabled(model.isInstalling)
                    }
                } label: {
                    Text("Phrase booster")
                    Text("Helps Parakeet spell the words in this list. About 100 MB. New Parakeet downloads include it.")
                }
                if let installation {
                    if installing { ProgressView(value: installation.progress) }
                    Text(installation.failure.map { "Download stopped: \($0)" } ?? installation.progressLabel)
                        .font(.caption)
                        .foregroundStyle(installing ? AnyShapeStyle(.secondary) : AnyShapeStyle(.red))
                }
            }
        }
    }

    private func addEntry() {
        guard canAdd else { return }
        model.addVocabulary(phrase: phrase, replacement: replacement)
        phrase = ""
        replacement = ""
    }
}
