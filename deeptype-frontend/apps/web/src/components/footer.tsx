import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import BrandMark from "@/components/brand-mark";
import { comparisons } from "@/lib/comparisons";
import { DOWNLOAD_URL, INTEL_DOWNLOAD_URL } from "@/lib/links";

const LINK =
  "text-sm text-ink/65 transition-colors duration-700 ease-fluid hover:text-ink";

export default function Footer() {
  return (
    <footer className="border-t border-ink/10">
      <div className="page-shell grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1.5fr_1fr]">
        <div className="max-w-xs">
          <Link
            to="/"
            className="flex w-max items-center gap-2 rounded-lg text-sm font-semibold"
          >
            <BrandMark className="size-8" />
            DeepType
          </Link>
          <p className="mt-4 text-sm text-ink/65">
            A quieter way to get your thoughts down. Local dictation for macOS.
          </p>
          <p className="mt-6 text-xs text-ink/45">
            © {new Date().getFullYear()} DeepType.
            <br />
            Built by{" "}
            <a
              href="https://deepbikram.com.np"
              className="underline underline-offset-2 hover:text-ink"
            >
              Deep Bikram Thapa Chhetri
            </a>
            .
          </p>
        </div>
        <FooterColumn title="Product">
          <a href={DOWNLOAD_URL} className={LINK}>
            Download for Apple Silicon
          </a>
          <a href={INTEL_DOWNLOAD_URL} className={LINK}>
            Download for Intel
          </a>
          <Link to="/" hash="how-it-works" className={LINK}>
            How it works
          </Link>
        </FooterColumn>
        <FooterColumn title="Blog">
          {comparisons.map((item) => (
            <Link
              to="/blog/$slug"
              params={{ slug: item.slug }}
              key={item.slug}
              className={LINK}
            >
              vs {item.name}
            </Link>
          ))}
          <Link to="/blog" className={LINK}>
            All posts
          </Link>
        </FooterColumn>
        <FooterColumn title="About">
          <Link to="/privacy" className={LINK}>
            Privacy
          </Link>
          <Link to="/terms" className={LINK}>
            Software terms
          </Link>
        </FooterColumn>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="eyebrow mb-1">{title}</p>
      {children}
    </div>
  );
}
