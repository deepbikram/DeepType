import { ArrowUpRightIcon } from "@phosphor-icons/react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ClosingCTA } from "@/components/download-cta";
import { articles, formatDate } from "@/lib/blog";
import { comparisons, REVIEWED_ON } from "@/lib/comparisons";
import { blogCollectionJsonLd, ldJsonScript, pageHead } from "@/lib/seo";

export const Route = createFileRoute("/blog/")({
  component: Blog,
  head: () => ({
    ...pageHead(
      "Notes on local dictation | DeepType",
      "How local dictation works on a Mac, how DeepType compares with Superwhisper, Wispr Flow, Kivi, FluidVoice, MacWhisper, Aqua Voice and Apple Dictation, and where your voice goes.",
      "/blog",
    ),
    scripts: [
      ldJsonScript(
        blogCollectionJsonLd([
          ...articles.map((item) => ({
            title: item.title,
            path: `/blog/${item.slug}`,
          })),
          ...comparisons.map((item) => ({
            title: `DeepType vs ${item.name}`,
            path: `/blog/${item.slug}`,
          })),
        ]),
      ),
    ],
  }),
});

function Blog() {
  return (
    <>
      <section className="page-shell py-20 sm:py-24">
        <p className="eyebrow">Notes</p>
        <h1 className="mt-4 max-w-[680px] font-serif text-4xl leading-[1.05] tracking-tight text-balance sm:text-6xl">
          Notes on writing
          <br />
          by voice.
        </h1>
        <p className="mt-6 max-w-[680px] text-lg text-pretty text-ink/65">
          How local dictation works, how DeepType compares with other Mac
          dictation apps, and where your words go. Written by the people
          building it.
        </p>
        {articles.length > 0 && (
          <section id="writing" className="mt-16 scroll-mt-24" aria-labelledby="articles-title">
            <h2 id="articles-title" className="font-serif text-2xl tracking-tight">
              Writing
            </h2>
            <div className="mt-6 border-t border-ink/10">
              {articles.map((item) => (
                <Link
                  key={item.slug}
                  to="/blog/$slug"
                  params={{ slug: item.slug }}
                  className="comparison-link group lg:grid-cols-[auto_1fr_auto]"
                >
                  <time
                    dateTime={item.date}
                    className="hidden w-36 text-sm text-ink/40 sm:block"
                  >
                    {formatDate(item.date)}
                  </time>
                  <div>
                    <p className="text-xl font-medium text-balance">
                      {item.title}
                    </p>
                    <p className="mt-2 text-base text-pretty text-ink/65">
                      {item.description}
                    </p>
                  </div>
                  <ArrowUpRightIcon className="size-5 text-ink/50 transition-transform duration-700 ease-fluid group-hover:translate-x-1" />
                </Link>
              ))}
            </div>
          </section>
        )}
        <h2 id="comparisons-title" className="mt-16 scroll-mt-24 font-serif text-2xl tracking-tight">
          How it compares
        </h2>
        <div id="comparisons" className="mt-6 scroll-mt-24 border-t border-ink/10">
          {comparisons.map((item, index) => (
            <Link
              key={item.slug}
              to="/blog/$slug"
              params={{ slug: item.slug }}
              className="comparison-link group"
            >
              <span className="hidden font-mono text-sm text-ink/40 sm:block">
                0{index + 1}
              </span>
              <div>
                <p className="text-xl font-medium">
                  DeepType vs {item.name}
                </p>
                <p className="mt-2 text-base text-ink/65">{item.summary}</p>
              </div>
              <span className="hidden text-sm text-ink/50 lg:block">
                {item.category}
              </span>
              <ArrowUpRightIcon className="size-5 text-ink/50 transition-transform duration-700 ease-fluid group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
        <aside className="mt-12 max-w-[680px] text-sm text-ink/65">
          <h2 className="font-serif text-xl tracking-tight text-ink">
            How to read these
          </h2>
          <p className="mt-3">
            These compare features and workflows, not accuracy. We link to each
            provider’s own documentation, keep local recognition separate from
            optional cloud rewriting, and say when we could not confirm a
            detail. Official pages were reviewed {REVIEWED_ON}. Plans change.
          </p>
          <p className="mt-3">
            Try the same short passage in each app with your own microphone,
            language and everyday words. That tells you more than any score
            without a source.
          </p>
        </aside>
      </section>
      <ClosingCTA />
    </>
  );
}
