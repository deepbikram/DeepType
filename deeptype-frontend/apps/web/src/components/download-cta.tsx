import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLinkItem,
  DropdownMenuTrigger,
} from "@deeptype-frontend/ui/components/dropdown-menu";
import { track } from "@databuddy/sdk";
import {
  CaretDownIcon,
  DownloadSimpleIcon,
} from "@phosphor-icons/react";

import AppleLogo from "@/components/apple-logo";
import DownloadCount, {
  COUNT_FORMAT,
  useDownloadCount,
} from "@/components/download-count";
import { DOWNLOAD_URL, INTEL_DOWNLOAD_URL } from "@/lib/links";

const DOWNLOADS = [
  { href: DOWNLOAD_URL, chip: "Apple Silicon", macs: "M1 or newer" },
  { href: INTEL_DOWNLOAD_URL, chip: "Intel", macs: "Intel-based Macs" },
];

export default function DownloadCTA({
  compact = false,
}: {
  compact?: boolean;
}) {
  const downloads = useDownloadCount();
  if (compact) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger className="download-cta group cursor-pointer text-sm">
          <AppleLogo className="size-4" />
          Download
          <CaretDownIcon
            weight="bold"
            className="size-3.5 transition-transform duration-300 ease-fluid group-data-popup-open:rotate-180"
            aria-hidden="true"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="w-60 rounded-xl bg-paper p-1 text-ink shadow-lg ring-ink/10"
        >
          {DOWNLOADS.map(({ href, chip, macs }) => (
            <DropdownMenuLinkItem
              key={href}
              href={href}
              closeOnClick
              onClick={() => track("download_started")}
              className="cursor-pointer gap-3 rounded-lg px-3 py-2 text-sm focus:bg-ink/5 focus:text-ink"
            >
              <span className="flex-1">
                <span className="block font-semibold">{chip}</span>
                <span className="block text-xs text-ink/60">{macs}</span>
              </span>
              <DownloadSimpleIcon className="text-ink/45" />
            </DropdownMenuLinkItem>
          ))}
          {downloads !== undefined && (
            <p className="mt-1 border-t border-ink/10 px-3 pt-2 pb-1.5 text-xs text-ink/45 tabular-nums">
              {COUNT_FORMAT.format(downloads)} downloads so far
            </p>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  return (
    <div className="inline-flex flex-col items-center gap-3">
      <a
        href={DOWNLOAD_URL}
        onClick={() => track("download_started")}
        className="download-cta text-base"
      >
        <AppleLogo className="size-5" />
        Download for Mac
      </a>
      <a
        href={INTEL_DOWNLOAD_URL}
        onClick={() => track("download_started")}
        className="download-secondary text-sm text-ink/65 underline underline-offset-4 hover:text-ink"
      >
        Download the Intel build
      </a>
    </div>
  );
}

export function ClosingCTA() {
  return (
    <section className="scroll-mt-24 border-t border-ink/10 bg-paper px-6 py-24 text-center" aria-labelledby="start-title">
      <p className="eyebrow">A quieter way to write</p>
      <h2
        id="start-title"
        className="mx-auto mt-5 max-w-[680px] font-serif text-4xl leading-[1.05] tracking-tight sm:text-6xl"
      >
        Your next sentence
        <br />
        starts with your voice.
      </h2>
      <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ink/65">
        Local models. The apps you already use. Nothing to sign up for.
      </p>
      <div className="mt-10">
        <DownloadCTA />
      </div>
      <p className="mt-4 text-sm text-ink/50">
        <DownloadCount className="font-semibold text-ink" />
        macOS 14+ · Apple Silicon recommended · No account in the app
      </p>
    </section>
  );
}
