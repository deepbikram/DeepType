import {
  ArrowCounterClockwiseIcon,
  ArrowRightIcon,
  CheckSquareIcon,
  ClipboardTextIcon,
  CloudSlashIcon,
  CpuIcon,
  CursorTextIcon,
  FlameIcon,
  MicrophoneIcon,
  SealCheckIcon,
  SquareIcon,
  type Icon,
} from "@phosphor-icons/react";
import type { ReactNode } from "react";

import BrandMark from "@/components/brand-mark";

type Tile = { title: string; body: string; span: string; visual: ReactNode };

const MODELS = [
  { name: "Apple speech", detail: "Built in" },
  { name: "Parakeet TDT v3", detail: "25 languages", selected: true },
  { name: "Parakeet Japanese", detail: "Japanese" },
  { name: "Whisper Large v3 Turbo", detail: "WhisperKit" },
  { name: "Sarvam AI", detail: "Your API key" },
];

const REPLACEMENTS = [
  { heard: "better whisper", written: "DeepType" },
  { heard: "post gress", written: "Postgres", learned: true },
  { heard: "type script", written: "TypeScript" },
];

const MEETING = [
  { speaker: "Me", line: "Can we ship the export on Friday?" },
  { speaker: "Them", line: "Friday works if QA signs off Thursday." },
  { speaker: "Me", line: "Great, I'll tell support today." },
];

const ACTIONS = [
  { task: "QA sign off by Thursday", done: true },
  { task: "Ship the export Friday" },
  { task: "Tell support today" },
];

const STYLE_TABS = ["Personal", "Work", "Email", "Other"];

const COMMANDS = [
  { said: "question mark", typed: "?" },
  { said: "new paragraph", typed: "¶" },
  { said: "scratch that", typed: "⌫" },
];

const STATS = [
  { value: "4,218", label: "words" },
  { value: "137", label: "wpm" },
  { value: "312", label: "words cleaned" },
];

const HEATMAP_DAYS = 7 * 21;
const STREAK_DAYS = 6;
const HEATMAP = Array.from({ length: HEATMAP_DAYS }, (_, day) => {
  if (day >= HEATMAP_DAYS - STREAK_DAYS) return 3 + (day % 2);
  if (day === HEATMAP_DAYS - STREAK_DAYS - 1) return 0;
  return ((day * 1103515245 + 12345) >>> 16) % 5;
});
const HEAT_SHADES = ["bg-zinc-200", "bg-zinc-300", "bg-zinc-400", "bg-zinc-600", "bg-ink"];

const PANEL = "rounded-lg bg-white ring-1 ring-zinc-200";

const TILES: Tile[] = [
  {
    title: "Local by default",
    body: "Speech is transcribed on your Mac by models you install. No account, no cloud fallback. Once downloaded, they work offline.",
    span: "sm:col-span-2 lg:col-span-4",
    visual: (
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2">
          <FlowStep icon={MicrophoneIcon} label="Your voice" />
          <ArrowRightIcon className="size-4 text-zinc-400" />
          <FlowStep icon={CpuIcon} label="Model on your Mac" />
          <ArrowRightIcon className="size-4 text-zinc-400" />
          <FlowStep icon={CursorTextIcon} label="Text" />
        </div>
        <span className="flex items-center gap-2 text-xs text-zinc-500">
          <CloudSlashIcon className="size-4" />
          Nothing is uploaded
        </span>
      </div>
    ),
  },
  {
    title: "Hold to talk",
    body: "Hold F5 while you speak, release to finish. Prefer a toggle? Change it in Settings, or record your own shortcut.",
    span: "lg:col-span-2",
    visual: (
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-3 font-mono text-sm text-ink">
          <kbd className="animate-[keypress_2.4s_var(--ease-fluid)_infinite] rounded-lg border border-ink/15 bg-white px-5 py-2 motion-reduce:animate-none">
            F5
          </kbd>
          <span className="text-xs text-ink/45">dictation key</span>
        </div>
        <div className={`flex p-1 text-xs ${PANEL}`}>
          <span className="rounded-md bg-ink px-2 py-1 text-white">Hold to talk</span>
          <span className="px-2 py-1 text-zinc-500">Press to toggle</span>
        </div>
      </div>
    ),
  },
  {
    title: "Your choice of model",
    body: "Nine built-in models from Apple, Parakeet and Whisper. Or connect your own API if you prefer.",
    span: "lg:col-span-2",
    visual: (
      <ul className="w-full max-w-64 space-y-1 text-xs">
        {MODELS.map(({ name, detail, selected }) => (
          <li
            key={name}
            className={`flex items-center justify-between gap-2 rounded-md px-2 py-1 ${selected ? "bg-white text-zinc-900 ring-1 ring-zinc-200" : "text-zinc-500"}`}
          >
            {name}
            <span className="text-zinc-400">{detail}</span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    title: "Meetings",
    body: "Notetaker writes down your side of the call and, on macOS 14.2 or later, the other side, beside your own notes. Apple Intelligence or Ollama can then draft the summary, decisions and action items on your Mac.",
    span: "sm:col-span-2 lg:col-span-4",
    visual: (
      <div className="flex w-full max-w-lg items-center gap-3">
        <ul className="flex-1 space-y-2 text-xs">
          {MEETING.map(({ speaker, line }) => (
            <li key={line} className="flex gap-2">
              <span className={`w-10 shrink-0 font-medium ${speaker === "Me" ? "text-zinc-900" : "text-zinc-500"}`}>{speaker}</span>
              <span className="text-zinc-600">{line}</span>
            </li>
          ))}
        </ul>
        <div className={`hidden w-48 shrink-0 p-3 text-xs sm:block ${PANEL}`}>
          <p className="font-medium text-zinc-900">Action items</p>
          <ul className="mt-2 space-y-1 text-zinc-600">
            {ACTIONS.map(({ task, done }) => (
              <li key={task} className="flex items-center gap-1">
                {done ? <CheckSquareIcon weight="fill" className="size-4 text-zinc-900" /> : <SquareIcon className="size-4 text-zinc-400" />}
                {task}
              </li>
            ))}
          </ul>
        </div>
      </div>
    ),
  },
  {
    title: "A tone for each app",
    body: "Personal chats, work, email, everything else. Each can have its own tone. Casual drops the final period, very casual drops capitals, formal leaves your words alone. Styles apply to English.",
    span: "lg:col-span-3",
    visual: (
      <div className="flex w-full max-w-72 flex-col gap-3">
        <div className={`flex p-1 text-xs ${PANEL}`}>
          {STYLE_TABS.map((tab, index) => (
            <span key={tab} className={`flex-1 rounded-md px-2 py-1 text-center ${index === 0 ? "bg-ink text-white" : "text-zinc-500"}`}>
              {tab}
            </span>
          ))}
        </div>
        <p className={`p-3 text-sm text-zinc-900 ${PANEL}`}>
          hey are you around for dinner tonight? let's do 7 if that works for you
        </p>
        <span className="text-xs text-zinc-500">Very casual in Messages</span>
      </div>
    ),
  },
  {
    title: "Cleanup you choose",
    body: "Light removes English filler, repeats and false starts. Medium also edits for clarity with a local notes model. None keeps every word.",
    span: "lg:col-span-3",
    visual: (
      <div className="flex flex-col items-center gap-4">
        <div className={`flex p-1 text-xs ${PANEL}`}>
          {["None", "Light", "Medium"].map((level) => (
            <span key={level} className={`rounded-md px-2 py-1 ${level === "Light" ? "bg-ink text-white" : "text-zinc-500"}`}>
              {level}
            </span>
          ))}
        </div>
        <div className="space-y-2 text-sm text-zinc-900">
          <p>
            and <Removed>uh uh</Removed> we can build <Removed>um</Removed> the export
          </p>
          <p>
            Then we can <Removed>we can</Removed> deploy the app
          </p>
        </div>
      </div>
    ),
  },
  {
    title: "Spoken commands",
    body: "Say comma, question mark or new paragraph as you speak. Say scratch that to remove the last sentence. English only.",
    span: "lg:col-span-2",
    visual: (
      <ul className="space-y-2 text-xs">
        {COMMANDS.map(({ said, typed }) => (
          <li key={said} className="flex items-center gap-2">
            <span className="w-28 rounded-md px-2 py-1 text-zinc-500 ring-1 ring-zinc-200 ring-inset">{said}</span>
            <ArrowRightIcon className="size-4 text-zinc-400" />
            <span className={`w-8 py-1 text-center font-mono font-medium text-zinc-900 ${PANEL}`}>{typed}</span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    title: "Your vocabulary",
    body: "Add names and terms, or fix a word in History or just after a paste. DeepType remembers the correction next time.",
    span: "lg:col-span-2",
    visual: (
      <ul className="space-y-2 text-xs">
        {REPLACEMENTS.map(({ heard, written, learned }) => (
          <li key={heard} className="flex items-center gap-2">
            <span className="w-28 rounded-md px-2 py-1 text-zinc-500 ring-1 ring-zinc-200 ring-inset">{heard}</span>
            <ArrowRightIcon className="size-4 text-zinc-400" />
            <span className={`px-2 py-1 font-medium text-zinc-900 ${PANEL}`}>{written}</span>
            {learned && <span className="rounded-full bg-ink px-2 py-0.5 text-white">Learned</span>}
          </li>
        ))}
      </ul>
    ),
  },
  {
    title: "Where you were typing",
    body: "Text lands in the app you were already using. If a field blocks paste, it is copied so nothing is lost.",
    span: "lg:col-span-2",
    visual: (
      <div className="flex w-full max-w-64 flex-col items-start gap-2">
        <p className={`w-full p-3 text-xs text-zinc-900 ${PANEL}`}>
          Shipping the export on Friday.
          <span className="ml-0.5 inline-block h-3 w-0.5 translate-y-0.5 bg-ink" />
        </p>
        <span className="flex items-center gap-1 text-xs text-zinc-500">
          <ClipboardTextIcon className="size-4" />
          Copied if paste is blocked
        </span>
      </div>
    ),
  },
  {
    title: "History",
    body: "Raw and corrected text stay on your Mac. Use Original brings back exactly what you said. History can be turned off whenever you like.",
    span: "lg:col-span-2",
    visual: (
      <div className={`w-full max-w-72 p-3 text-xs ${PANEL}`}>
        <div className="flex justify-between gap-2 text-zinc-400">
          <span>Today, 9:41</span>
          <span>Parakeet TDT v3</span>
        </div>
        <p className="mt-2 text-sm text-zinc-900">Then we can deploy the app</p>
        <p className="mt-1 text-zinc-400">Raw: Then we can we can deploy the app</p>
        <span className="mt-3 inline-flex items-center gap-1 rounded-md px-2 py-1 text-zinc-900 ring-1 ring-zinc-200 ring-inset">
          <ArrowCounterClockwiseIcon className="size-4" />
          Use Original
        </span>
      </div>
    ),
  },
  {
    title: "Insights",
    body: "Words spoken, pace, cleanup saved, the apps you dictate into, and your streak. Counted from history on your Mac.",
    span: "sm:col-span-2 lg:col-span-4",
    visual: (
      <div className="flex w-full max-w-lg flex-col gap-4">
        <div className="flex items-end justify-between gap-4">
          {STATS.map(({ value, label }) => (
            <p key={label} className="text-xs text-zinc-500">
              <span className="block font-mono text-xl text-zinc-900">{value}</span>
              {label}
            </p>
          ))}
          <p className="flex items-center gap-1 text-xs text-zinc-900">
            <FlameIcon weight="fill" className="size-4 text-orange-500" />
            {STREAK_DAYS} day streak
          </p>
        </div>
        <div className="grid grid-flow-col grid-rows-7 gap-0.5 self-start">
          {HEATMAP.map((level, day) => (
            <span key={day} className={`size-2 rounded-sm ${HEAT_SHADES[level]}`} />
          ))}
        </div>
      </div>
    ),
  },
  {
    title: "Updates you can trust",
    body: "Updates install only after their signature checks out.",
    span: "lg:col-span-3",
    visual: (
      <div className={`flex w-full max-w-64 items-center gap-3 p-3 text-xs ${PANEL}`}>
        <BrandMark className="size-8" />
        <div>
          <p className="font-medium text-zinc-900">Update available</p>
          <p className="mt-1 flex items-center gap-1 text-zinc-500">
            <SealCheckIcon weight="fill" className="size-4 text-emerald-600" />
            Signature verified
          </p>
        </div>
      </div>
    ),
  },
  {
    title: "Free",
    body: "No account, no subscription, no API key. Download it and dictate.",
    span: "lg:col-span-3",
    visual: (
      <div className="flex flex-col items-center gap-2 text-zinc-900">
        <span className="font-serif text-4xl">Free</span>
        <span className="font-mono text-sm">No subscription</span>
      </div>
    ),
  },
];

/** Feature grid for the home page, one tile per shipped capability. */
export default function FeatureBento() {
  return (
    <div className="mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-6">
      {TILES.map(({ title, body, span, visual }) => (
        <article key={title} className={`flex flex-col border-t border-ink/15 pt-8 ${span}`}>
          <div aria-hidden className="flex h-44 items-center justify-center overflow-hidden rounded-sm bg-white/55 px-4 ring-1 ring-ink/10">
            {visual}
          </div>
          <div className="pt-5">
            <h3 className="font-serif text-xl text-ink">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-pretty text-ink/60">{body}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

function FlowStep({ icon: StepIcon, label }: { icon: Icon; label: string }) {
  return (
    <span className="flex items-center gap-2 rounded-full bg-white p-3 text-xs text-zinc-900 ring-1 ring-zinc-200 sm:px-3 sm:py-2">
      <StepIcon className="size-4" />
      <span className="hidden sm:inline">{label}</span>
    </span>
  );
}

function Removed({ children }: { children: ReactNode }) {
  return <del className="text-zinc-400 decoration-zinc-400">{children}</del>;
}
