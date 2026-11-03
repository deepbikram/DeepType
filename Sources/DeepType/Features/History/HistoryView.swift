import DeepTypeCore
import SwiftUI

struct HistoryView: View {
    @Bindable var model: AppModel
    @State private var query = ""
    @State private var transcriptToDelete: Transcript?
    @State private var sortAscending = false

    private var filteredHistory: [Transcript] {
        query.isEmpty ? model.history : model.history.filter { $0.text.localizedStandardContains(query) }
    }

    private var orderedHistory: [Transcript] {
        filteredHistory.sorted { sortAscending ? $0.createdAt < $1.createdAt : $0.createdAt > $1.createdAt }
    }

    private var dayGroups: [(day: Date, items: [Transcript])] {
        var order: [Date] = []
        var groups: [Date: [Transcript]] = [:]
        for transcript in orderedHistory {
            let day = Calendar.current.startOfDay(for: transcript.createdAt)
            if groups[day] == nil { order.append(day) }
            groups[day, default: []].append(transcript)
        }
        return order.map { ($0, groups[$0] ?? []) }
    }

    var body: some View {
        Form {
            if !orderedHistory.isEmpty {
                ForEach(Array(dayGroups.enumerated()), id: \.element.day) { index, group in
                    Section {
                        ForEach(group.items) { transcript in
                            TranscriptRow(
                                transcript: transcript,
                                onCopy: { model.copyTranscript(transcript) },
                                onDelete: { transcriptToDelete = transcript },
                                onEdit: { model.updateTranscript(transcript, text: $0) },
                                onRestore: { model.restoreOriginal(transcript) },
                                expanded: true
                            )
                        }
                    } header: {
                        HStack {
                            Text(group.day, format: .dateTime.weekday(.wide).month(.abbreviated).day().year())
                            Spacer()
                            SectionBadge(text: group.items.count == 1 ? "1 dictation" : "\(group.items.count) dictations")
                        }
                    } footer: {
                        if index == 0 && model.settings.learnCorrections {
                            Text("Fix a misheard word with the pencil and DeepType adds it to Vocabulary, so it is spelled right next time.")
                        }
                    }
                }
            }
        }
        .formStyle(.grouped)
        .overlay {
            if filteredHistory.isEmpty {
                if query.isEmpty {
                    ContentUnavailableView(
                        "No Dictations",
                        systemImage: "clock",
                        description: Text("Your saved dictations will appear here. Start speaking with \(model.settings.shortcut.displayName).")
                    )
                } else {
                    ContentUnavailableView.search(text: query)
                }
            }
        }
        .toolbar {
            ToolbarItem {
                Menu {
                    Picker("Order", selection: $sortAscending) {
                        Text("Newest first").tag(false)
                        Text("Oldest first").tag(true)
                    }
                    .pickerStyle(.inline)
                } label: {
                    Image(systemName: "arrow.up.arrow.down")
                }
                .menuStyle(.borderlessButton)
                .menuIndicator(.hidden)
                .help("Sort dictations")
                .accessibilityLabel("Sort dictations")
            }
        }
        .searchable(text: $query, prompt: "Search dictations")
        .alert("Delete this dictation?", isPresented: Binding(
            get: { transcriptToDelete != nil },
            set: { if !$0 { transcriptToDelete = nil } }
        )) {
            Button("Cancel", role: .cancel) { transcriptToDelete = nil }
            Button("Delete", role: .destructive) {
                if let transcriptToDelete { model.deleteTranscript(transcriptToDelete) }
                transcriptToDelete = nil
            }
        } message: {
            Text("This removes the saved text from this Mac. It cannot be undone.")
        }
    }
}

struct TranscriptRow: View {
    let transcript: Transcript
    let onCopy: () -> Void
    var onDelete: (() -> Void)?
    var onEdit: ((String) -> Void)?
    var onRestore: (() -> Void)?
    var expanded = false
    @State private var draft: String?

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack(spacing: 6) {
                Text(transcript.createdAt, format: .dateTime.month(.abbreviated).day().hour().minute())
                Text("·")
                Text(durationLabel(transcript.duration)).monospacedDigit()
                if expanded {
                    Text("·")
                    Text(transcript.modelName)
                    Text("·")
                    Text(transcript.language == "auto" ? "Auto language" : transcript.language.uppercased())
                }
                Spacer()
                Button(action: onCopy) { Image(systemName: "doc.on.doc") }
                    .help("Copy dictation")
                    .accessibilityLabel("Copy dictation")
                if onEdit != nil, draft == nil {
                    Button { draft = transcript.text } label: { Image(systemName: "pencil") }
                        .help("Fix dictation")
                        .accessibilityLabel("Fix dictation")
                }
                if let onDelete {
                    Button(action: onDelete) { Image(systemName: "trash") }
                        .help("Delete dictation")
                        .accessibilityLabel("Delete dictation")
                }
            }
            .font(.caption)
            .foregroundStyle(.secondary)
            .buttonStyle(.borderless)
            if let text = Binding($draft), let onEdit {
                TextEditor(text: text)
                    .font(.body)
                    .scrollContentBackground(.visible)
                    .frame(minHeight: 60)
                    .accessibilityLabel("Dictation text")
                HStack {
                    Spacer()
                    Button("Cancel") { draft = nil }
                        .keyboardShortcut(.cancelAction)
                    Button("Save") {
                        onEdit(text.wrappedValue)
                        draft = nil
                    }
                    .keyboardShortcut(.defaultAction)
                    .disabled(text.wrappedValue.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                }
                .controlSize(.small)
            } else {
                Text(transcript.text)
                    .lineLimit(expanded ? nil : 3)
                    .textSelection(.enabled)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
            if expanded && transcript.text != transcript.rawText {
                DisclosureGroup("Original transcription") {
                    Text(transcript.rawText)
                        .textSelection(.enabled)
                        .frame(maxWidth: .infinity, alignment: .leading)
                    if let onRestore, transcript.text != transcript.rawText.trimmingCharacters(in: .whitespacesAndNewlines) {
                        Button("Use Original", action: onRestore)
                            .help("Replace the cleaned-up text with exactly what was transcribed")
                    }
                }
                .font(.caption)
                .foregroundStyle(.secondary)
            }
        }
        .padding(.vertical, 4)
    }
}
