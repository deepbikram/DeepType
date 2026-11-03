export const REVIEWED_ON = "October 8, 2026";
export const REVIEWED_ON_ISO = "2026-10-08";

export const DEEPTYPE_FACTS = [
  ["Platform", "macOS 14 or later; Apple Silicon recommended"],
  ["Speech processing", "On your Mac, with no cloud transcription fallback"],
  ["Offline use", "After explicitly installing a compatible local model"],
  ["Account", "No account or API key required in the app"],
  ["Price model", "Free; no dictation subscription"],
  [
    "Text cleanup",
    "Local cleanup levels, per app styles, vocabulary and learned corrections",
  ],
] as const;

export interface Comparison {
  slug: string;
  name: string;
  category: string;
  summary: string;
  intro: string;
  facts: [string, string, string, string, string, string];
  betterFor: string;
  alternativeFor: string;
  takeaway: string;
  sources: { label: string; url: string }[];
}

export const comparisons: Comparison[] = [
  {
    slug: "superwhisper",
    name: "Superwhisper",
    category: "Local + cloud",
    summary: "Local models, cloud options, and writing modes you configure.",
    intro:
      "Both apps can transcribe on your Mac. The difference is how much you want to tune models and writing workflows.",
    facts: [
      "Mac, Windows, iOS and Android; features vary by platform",
      "Local and cloud models, depending on what you pick",
      "Available with local models on supported hardware",
      "No account needed for the free offline workflow",
      "Free tier; subscription and lifetime Pro options",
      "Custom prompts, writing modes, and local or cloud AI models",
    ],
    betterFor:
      "You want Mac dictation that stays local, with simple cleanup and no cloud provider to set up.",
    alternativeFor:
      "You want configurable writing modes, optional cloud models, or support beyond the Mac. Superwhisper has a free tier and paid Pro plans.",
    takeaway:
      "Offline use is not unique to DeepType here. Compare the workflow, the models you can use, and how much you want your text rewritten.",
    sources: [
      {
        label: "Superwhisper features and plans",
        url: "https://superwhisper.com/",
      },
      {
        label: "Superwhisper local models and changelog",
        url: "https://superwhisper.com/changelog",
      },
      {
        label: "Superwhisper offline and account requirements",
        url: "https://ai.superwhisper.com/offline-transcription",
      },
    ],
  },
  {
    slug: "wispr-flow",
    name: "Wispr Flow",
    category: "Cloud dictation",
    summary: "Dictation across devices, with cloud processing.",
    intro:
      "DeepType keeps speech recognition on your Mac. Wispr Flow aims at dictation across computers and phones, and needs a connection.",
    facts: [
      "Mac, Windows, iOS and Android",
      "Cloud transcription",
      "An internet connection is needed to start dictation",
      "Account required; free and paid plans",
      "Free tier with usage limits; paid subscriptions",
      "Automatic editing, contextual formatting and a custom dictionary",
    ],
    betterFor:
      "You want to dictate without sending recordings to a speech service, including when your Mac is offline after model setup.",
    alternativeFor:
      "You want one dictation service across computers and phones, automatic polish, or team administration. Check the free plan limits and paid plans.",
    takeaway:
      "Start with where you work and whether you are online. Cloud processing and data retention are separate questions; read Flow’s current privacy settings as well.",
    sources: [
      { label: "Wispr Flow features", url: "https://wisprflow.ai/" },
      {
        label: "Starting a dictation and connectivity",
        url: "https://docs.wisprflow.ai/articles/6409258247-starting-your-first-dictation",
      },
      { label: "Wispr Flow plans", url: "https://wisprflow.ai/pricing" },
    ],
  },
  {
    slug: "kivi",
    name: "Kivi by Sarvam",
    category: "Indian language workflows",
    summary:
      "Many languages, remembered corrections, and editing by voice.",
    intro:
      "Kivi is Sarvam’s Mac voice app, sometimes searched for as Kiwi. It leans on Indian languages and editing by voice. DeepType leans on local speech recognition.",
    facts: [
      "Mac; macOS 14 or later advertised",
      "The reviewed product pages do not show a fully local audio path",
      "Not confirmed by the reviewed official documentation",
      "Required, according to Kivi’s privacy policy",
      "Free during alpha; future pricing may change",
      "Remembered corrections, app personas, drafting and voice editing",
    ],
    betterFor:
      "You want a documented local transcription path with no account. Pick a model that covers your language and try it with your own speech.",
    alternativeFor:
      "You mix English and Indian languages, or want to draft and edit by voice. Kivi advertises 22+ Indian languages and is free during alpha.",
    takeaway:
      "Kivi’s language focus may suit multilingual Indian workflows better. Its public pages do not confirm offline use, so check that directly before choosing.",
    sources: [
      {
        label: "Kivi product and alpha availability",
        url: "https://heykivi.ai/",
      },
      { label: "Kivi languages and modes", url: "https://heykivi.ai/faq.html" },
      {
        label: "Kivi account and privacy policy",
        url: "https://heykivi.ai/privacy.html",
      },
    ],
  },
  {
    slug: "fluidvoice",
    name: "FluidVoice",
    category: "Local + optional cloud AI",
    summary: "Local speech recognition with optional AI rewriting.",
    intro:
      "Both apps dictate locally on a Mac. FluidVoice adds a wider writing toolkit, including its Fluid Intelligence model.",
    facts: [
      "macOS 15 or later; Apple Silicon and Intel paths",
      "Local speech models; optional local or cloud text enhancement",
      "Available with local speech and enhancement models installed",
      "Free; optional external AI services have their own requirements",
      "Free; optional external services may charge",
      "Fluid Intelligence, app prompts, Write Mode and Command Mode",
    ],
    betterFor:
      "You use macOS 14, or want a smaller dictation setup built around vocabulary, explicit replacements and local transcript history.",
    alternativeFor:
      "You want richer writing modes and local AI rewriting, and your Mac meets FluidVoice’s requirements. FluidVoice is also free, so price alone does not separate them.",
    takeaway:
      "Both process speech locally. With FluidVoice, check which enhancement provider you turn on; optional cloud text processing changes where your transcript goes.",
    sources: [
      {
        label: "FluidVoice official product page",
        url: "https://altic.dev/fluid",
      },
      {
        label: "FluidVoice source and requirements",
        url: "https://github.com/altic-dev/FluidVoice",
      },
      {
        label: "FluidVoice privacy and optional providers",
        url: "https://altic.dev/fluid/privacy-policy",
      },
    ],
  },
  {
    slug: "macwhisper",
    name: "MacWhisper",
    category: "Dictation + transcription",
    summary: "A transcription tool for files, subtitles and dictation.",
    intro:
      "MacWhisper adds tools for working through recorded media. DeepType keeps its dictation flow on speaking into the app you already have open.",
    facts: [
      "Mac; a separate iOS and iPad app is also available",
      "Local models, with optional external AI integrations",
      "Local transcription is available with downloaded models",
      "Free edition and a paid Pro license; optional services have separate terms",
      "Free edition; Pro sold as a one time license",
      "AI prompts, grammar improvement and local or external AI integrations",
    ],
    betterFor:
      "You mostly dictate messages, notes and prompts into apps you already use, with local recognition and vocabulary you control.",
    alternativeFor:
      "You need batch file transcription, subtitle exports, speaker recognition or a place to review recordings. Features differ between Free and Pro.",
    takeaway:
      "Compare the job you do most. A media transcription tool and a shortcut you use all day overlap, but they solve different needs.",
    sources: [
      {
        label: "MacWhisper features, platforms and plans",
        url: "https://www.macwhisper.com/",
      },
      {
        label: "MacWhisper documentation",
        url: "https://docs.macwhisper.com/",
      },
    ],
  },
  {
    slug: "aqua-voice",
    name: "Aqua Voice",
    category: "Contextual dictation",
    summary: "Dictation that reads context, with custom vocabulary.",
    intro:
      "Aqua Voice is built around contextual dictation on Mac and Windows. DeepType is a Mac workflow with a local speech path it can document.",
    facts: [
      "Mac and Windows",
      "Cloud dictation is offered; check the selected mode",
      "Official FAQ says availability varies by platform, version and mode",
      "Starter allowance and paid plans",
      "Starter word allowance; paid plans",
      "Contextual dictation and custom vocabulary",
    ],
    betterFor:
      "You need local transcription as a fixed rule, without a service connection or a cloud account to set up.",
    alternativeFor:
      "You want contextual dictation on Mac and Windows, and you will check the processing and plan details for your setup.",
    takeaway:
      "Do not assume every Aqua mode works offline. Its own FAQ says to check support for your platform, app version and mode.",
    sources: [
      { label: "Aqua Voice product and plans", url: "https://aquavoice.com/" },
      {
        label: "Aqua Voice connectivity and free allowance",
        url: "https://aquavoice.com/info/faq",
      },
    ],
  },
  {
    slug: "apple-dictation",
    name: "Apple Dictation",
    category: "Built into macOS",
    summary: "The built in option. Nothing extra to install.",
    intro:
      "Apple Dictation is a fine start for occasional voice typing. DeepType adds selectable speech models, vocabulary replacements and local transcript history.",
    facts: [
      "Built into macOS",
      "On device or server dependent; check Keyboard settings",
      "Depends on your Mac, language and settings",
      "No separate dictation subscription",
      "Included with macOS",
      "Punctuation and formatting commands; features vary by language",
    ],
    betterFor:
      "You want to choose between Apple speech, Parakeet and Whisper, keep raw and corrected transcripts, or set phrase replacements you can repeat.",
    alternativeFor:
      "You dictate now and then and the built in option works for your language. Start in System Settings → Keyboard → Dictation.",
    takeaway:
      "Try the built in option first if it meets your needs. Apple’s Keyboard settings tell you whether your setup needs the internet or runs general dictation on the device.",
    sources: [
      {
        label: "Apple’s Mac Dictation guide",
        url: "https://support.apple.com/guide/mac-help/mh40584/mac",
      },
    ],
  },
];
