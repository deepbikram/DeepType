import { ArrowRightIcon, CoffeeIcon } from "@phosphor-icons/react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import DownloadCTA, { ClosingCTA } from "@/components/download-cta";
import DownloadCount from "@/components/download-count";
import HeroDemo from "@/components/hero-demo";
import FeatureBento from "@/components/feature-bento";
import { comparisons } from "@/lib/comparisons";
import { BUY_ME_A_COFFEE_URL } from "@/lib/links";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/")({
  component: HomeComponent,
  head: () =>
    pageHead(
      "DeepType — dictation that stays on your Mac",
      "Speak into any Mac app and watch clean text appear. DeepType runs its speech models on your Mac, with no account and no subscription. Free.",
      "/",
    ),
});

const FAQS = [
  [
    "Is DeepType free?",
    "Yes. DeepType is free. There is no subscription, no account and no API key requirement. Model files use storage on your Mac.",
  ],
  [
    "Which Macs does it support?",
    "macOS 14 or later. Apple Silicon is recommended for local inference. Speed and available languages depend on your hardware and the model you choose.",
  ],
  [
    "Does it work without internet?",
    "Yes, once a local model is installed. Models download only when you ask them to. There is no cloud transcription fallback.",
  ],
  [
    "How do I dictate?",
    "Put the cursor in a text field, hold F5, and speak. Release to transcribe. You can switch to press-to-toggle or choose another shortcut in Settings.",
  ],
  [
    "Why does it need permissions?",
    "Microphone lets DeepType hear you. Accessibility lets it insert text into another app. Apple speech also needs Speech Recognition. You control all of them in System Settings.",
  ],
  [
    "What if automatic paste does not work?",
    "DeepType checks the target app before inserting text. If it cannot paste safely, the transcript is waiting in the dashboard and on your clipboard. Secure fields may block insertion.",
  ],
  [
    "Which languages are supported?",
    "It depends on the model. Parakeet TDT v3 covers 25 European languages, Parakeet Japanese covers Japanese, and Whisper covers more. Apple speech follows your locale and installed assets. Cleanup, styles and voice commands are English.",
  ],
  [
    "Does it rewrite everything I say?",
    "Only as much as you choose. Light, the default, removes English filler and false starts. None keeps every word. Medium also edits for clarity with the notes model you choose. Apple Intelligence and Ollama run on your Mac. Claude Code, Codex and API connections send the text to that provider, and only if you select one.",
  ],
  [
    "Can it take meeting notes?",
    "Yes. Notetaker transcribes your microphone as Me and, on macOS 14.2 or later, other apps as Them, beside your own notes. Afterwards Apple Intelligence or a local Ollama model can write the summary, decisions and action items on your Mac. Optional CLI and API notes models send the transcript to that provider.",
  ],
  [
    "Does it learn my words?",
    "Yes. Add names and terms in Vocabulary, or fix a word in History or just after a paste. DeepType remembers the correction. You can turn learning off in Settings.",
  ],
];

const STEPS = [
  [
    "Install",
    "Download DeepType, grant microphone access, and choose a local model. One time.",
  ],
  [
    "Speak",
    "Put your cursor where you want the words. Hold F5 and talk.",
  ],
  [
    "Let go",
    "The text appears in the app you were using, cleaned up and in your style.",
  ],
];

function HomeComponent() {
  return (
    <>
      <section
        className="relative isolate overflow-hidden border-b border-ink/10"
        aria-labelledby="hero-title"
      >
        <img
          src="/assets/hero-meadow.jpg"
          alt=""
          width={1671}
          height={941}
          fetchPriority="high"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-[70%_center]"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,var(--color-paper)_0%,rgba(244,241,233,0.96)_32%,rgba(244,241,233,0.7)_54%,rgba(244,241,233,0.16)_76%,rgba(244,241,233,0)_100%)] max-lg:bg-[linear-gradient(90deg,rgba(244,241,233,0.98)_0%,rgba(244,241,233,0.94)_55%,rgba(244,241,233,0.82)_100%)]"
        />
        <div className="page-shell relative z-10 py-20 sm:py-24 lg:flex lg:min-h-[640px] lg:items-center lg:py-28">
          <div className="max-w-xl">
            <p className="eyebrow">Local dictation for macOS</p>
            <h1
              id="hero-title"
              className="mt-6 font-serif text-[clamp(2.75rem,8vw,5.25rem)] leading-[0.98] tracking-[-0.03em]"
            >
              Say it.
              <br />
              It’s written.
            </h1>
            <p className="mt-8 max-w-lg text-lg leading-relaxed text-ink/65">
              DeepType turns speech into clean text in any Mac app. The models
              run on your Mac, so your voice doesn’t leave it.
            </p>
            <div className="mt-10 flex flex-wrap items-start gap-x-6 gap-y-4">
              <DownloadCTA />
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 pt-2.5 text-sm font-medium text-ink/65 hover:text-ink"
              >
                How it works
                <ArrowRightIcon className="size-4" aria-hidden="true" />
              </a>
            </div>
            <p className="mt-8 text-sm text-ink/50">
              <DownloadCount className="font-semibold text-ink" />
              Free · No account · macOS 14+
            </p>
          </div>
        </div>
      </section>

      <section className="page-shell py-16 sm:py-20" aria-labelledby="difference-title">
        <div className="mx-auto max-w-[880px] text-center">
          <p className="eyebrow">The difference</p>
          <h2
            id="difference-title"
            className="mt-4 font-serif text-3xl tracking-tight sm:text-4xl"
          >
            The same sentence, twice.
          </h2>
        </div>
        <div className="mt-10">
          <HeroDemo />
        </div>
      </section>

      <section
        aria-labelledby="features"
        className="page-shell scroll-mt-24 border-t border-ink/10 py-20"
      >
        <div className="max-w-[680px]">
          <p className="eyebrow">What it does</p>
          <h2
            id="features"
            className="mt-4 font-serif text-3xl tracking-tight sm:text-4xl"
          >
            A small set of well-made tools.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink/65">
            Enough to get your words down and out of the way. No workspace, no
            pipeline, no account.
          </p>
        </div>
        <FeatureBento />
      </section>

      <section
        id="how-it-works"
        className="scroll-mt-24 border-t border-ink/10 py-20"
        aria-labelledby="how-title"
      >
        <div className="page-shell grid gap-12 md:grid-cols-[1fr_1.6fr]">
          <div>
            <p className="eyebrow">How it works</p>
            <h2
              id="how-title"
              className="mt-4 font-serif text-3xl leading-tight tracking-tight sm:text-4xl"
            >
              Three quiet steps.
            </h2>
          </div>
          <ol className="grid gap-10 sm:grid-cols-3">
            {STEPS.map(([title, body], index) => (
              <li key={title} className="border-t border-ink/15 pt-4">
                <span className="font-mono text-xs text-ink/40">
                  0{index + 1}
                </span>
                <h3 className="mt-4 font-serif text-xl">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink/65">
                  {body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        className="page-shell border-t border-ink/10 py-20"
        aria-labelledby="local-title"
      >
        <div className="grid items-start gap-12 md:grid-cols-2">
          <div>
            <p className="eyebrow">Local by design</p>
            <Tagline />
          </div>
          <div>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-ink/65">
              Models run on your Mac. Downloads happen only when you choose
              them. Your speech never takes a round trip to a transcription
              server.
            </p>
            <Link
              to="/privacy"
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-ink/65 hover:text-ink"
            >
              How your data is handled
              <ArrowRightIcon className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section
        className="border-t border-ink/10 py-20"
        aria-labelledby="blog-title"
      >
        <div className="page-shell">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow">Notes</p>
              <h2
                id="blog-title"
                className="mt-4 font-serif text-3xl tracking-tight sm:text-4xl"
              >
                Notes on writing by voice.
              </h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-ink/65">
                Comparisons, notes on local processing, and occasional thoughts
                on speaking instead of typing.
              </p>
            </div>
            <Link
              to="/blog"
              className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-ink/65 hover:text-ink"
            >
              All posts
              <ArrowRightIcon className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-10 border-t border-ink/10">
            {comparisons.slice(0, 4).map((item) => (
              <Link
                key={item.slug}
                to="/blog/$slug"
                params={{ slug: item.slug }}
                className="group flex items-center justify-between gap-4 border-b border-ink/10 py-6 transition-colors duration-700 ease-fluid hover:bg-ink/[0.03]"
              >
                <div>
                  <h3 className="text-lg font-medium">
                    DeepType vs {item.name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/60">
                    {item.summary}
                  </p>
                </div>
                <ArrowRightIcon className="size-5 shrink-0 transition-transform duration-700 ease-fluid group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section
        className="page-shell border-t border-ink/10 py-20"
        aria-labelledby="faq-title"
      >
        <div className="grid gap-12 md:grid-cols-[1fr_2fr]">
          <div>
            <p className="eyebrow">Before you download</p>
            <h2
              id="faq-title"
              className="mt-4 font-serif text-3xl leading-tight tracking-tight sm:text-4xl"
            >
              Questions,
              <br />
              answered plainly.
            </h2>
          </div>
          <div className="border-t border-ink/10">
            {FAQS.map(([question, answer]) => (
              <details
                key={question}
                className="group border-b border-ink/10 py-6"
              >
                <summary className="cursor-pointer text-base font-medium marker:text-ink/30 hover:text-ink/65">
                  {question}
                </summary>
                <p className="mt-4 text-base leading-relaxed text-ink/65">
                  {answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section
        id="support"
        className="scroll-mt-24 border-t border-ink/10 py-20"
        aria-labelledby="support-title"
      >
        <div className="page-shell grid gap-12 md:grid-cols-[1fr_1.6fr]">
          <div>
            <p className="eyebrow">Support</p>
            <h2
              id="support-title"
              className="mt-4 font-serif text-3xl leading-tight tracking-tight sm:text-4xl"
            >
              No subscription.
              <br />
              A tip jar.
            </h2>
          </div>
          <div>
            <p className="max-w-lg text-base leading-relaxed text-ink/65">
              DeepType is free. If it saves you some typing, you can leave a
              tip. It goes toward development.
            </p>
            <a
              href={BUY_ME_A_COFFEE_URL}
              className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#ffdd00] px-3 py-2 text-base font-semibold text-ink transition-all duration-700 ease-fluid hover:bg-[#ffe54d] active:scale-[0.98]"
            >
              <CoffeeIcon weight="fill" className="size-5" aria-hidden="true" />
              Leave a tip
            </a>
          </div>
        </div>
      </section>
      <ClosingCTA />
    </>
  );
}

function Tagline() {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const words = ref.current?.querySelectorAll("span");
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        words?.forEach((word, index) => {
          word.style.transitionDelay = `${index * 90}ms`;
          word.style.opacity = "1";
        });
        observer.disconnect();
      },
      { threshold: 0.6 },
    );
    words?.forEach((word) => {
      word.style.opacity = "0.3";
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return (
    <h2
      id="local-title"
      ref={ref}
      className="mt-6 max-w-[680px] font-serif text-4xl leading-[1.05] tracking-tight sm:text-5xl"
    >
      {"Your words stay ".split(" ").map((word, index) => (
        <span
          key={index}
          className="transition-opacity duration-700 ease-fluid"
        >
          {word}{" "}
        </span>
      ))}
      <br />
      {"on your Mac.".split(" ").map((word, index) => (
        <span
          key={index}
          className="transition-opacity duration-700 ease-fluid"
        >
          {word}{" "}
        </span>
      ))}
    </h2>
  );
}
