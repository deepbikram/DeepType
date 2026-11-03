import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react";
import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import Article from "@/components/article";
import DownloadCTA, { ClosingCTA } from "@/components/download-cta";
import { articles } from "@/lib/blog";
import {
  DEEPTYPE_FACTS,
  type Comparison,
  comparisons,
  REVIEWED_ON,
  REVIEWED_ON_ISO,
} from "@/lib/comparisons";
import { blogPostingJsonLd, comparisonJsonLd, ldJsonScript, pageHead } from "@/lib/seo";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const article = articles.find((item) => item.slug === params.slug);
    if (article) return { article };
    const comparison = comparisons.find((item) => item.slug === params.slug);
    if (!comparison) throw notFound();
    return { comparison };
  },
  head: ({ loaderData }) => {
    const base = loaderData?.article
      ? pageHead(
          `${loaderData.article.title} | DeepType`,
          loaderData.article.description,
          `/blog/${loaderData.article.slug}`,
        )
      : loaderData?.comparison
        ? pageHead(
            `DeepType vs ${loaderData.comparison.name} | Mac dictation compared`,
            loaderData.comparison.intro,
            `/blog/${loaderData.comparison.slug}`,
          )
        : {
            meta: [
              { title: "Post not found | DeepType" },
              { name: "robots", content: "noindex" },
            ],
          };
    if (loaderData?.article)
      return {
        ...base,
        scripts: [
          ldJsonScript(
            blogPostingJsonLd({
              title: loaderData.article.title,
              description: loaderData.article.description,
              path: `/blog/${loaderData.article.slug}`,
              date: loaderData.article.date,
              dateModified: loaderData.article.dateModified,
            }),
          ),
        ],
      };
    if (loaderData?.comparison)
      return {
        ...base,
        scripts: [
          ldJsonScript(
            comparisonJsonLd({
              title: `DeepType vs ${loaderData.comparison.name} | Mac dictation compared`,
              description: loaderData.comparison.intro,
              path: `/blog/${loaderData.comparison.slug}`,
              date: REVIEWED_ON_ISO,
              competitor: loaderData.comparison.name,
            }),
          ),
        ],
      };
    return base;
  },
  component: BlogPost,
});

function BlogPost() {
  const post = Route.useLoaderData();
  return post.article ? (
    <Article article={post.article} />
  ) : (
    <ComparisonPage item={post.comparison} />
  );
}

function ComparisonPage({ item }: { item: Comparison }) {
  return (
    <>
      <article className="page-shell py-16 sm:py-20">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-sm text-ink/65 hover:text-ink"
        >
          <ArrowLeftIcon /> All posts
        </Link>
        <p className="eyebrow mt-12">{item.category}</p>
        <h1 className="mt-4 max-w-[880px] font-serif text-4xl leading-[1.02] tracking-tight sm:text-6xl">
          DeepType
          <br />
          <span className="text-ink/50">vs {item.name}</span>
        </h1>
        <p className="mt-6 max-w-[680px] text-lg text-pretty text-ink/65">
          {item.intro}
        </p>
        <div className="mt-8">
          <DownloadCTA />
        </div>
        <p className="mt-6 text-sm text-ink/50">
          Reviewed {REVIEWED_ON} · By the DeepType team
        </p>

        <section className="mt-16" aria-labelledby="comparison-title">
          <h2 id="comparison-title" className="font-serif text-2xl tracking-tight">
            Side by side
          </h2>
          <div
            className="mt-6 overflow-x-auto rounded-xl border border-ink/10"
            role="region"
            aria-label={`Feature comparison with ${item.name}`}
            tabIndex={0}
          >
            <table className="w-full min-w-[620px] border-collapse text-left text-sm">
              <caption className="sr-only">
                DeepType and {item.name}: platform, processing, offline use,
                account, price model and cleanup
              </caption>
              <thead>
                <tr className="bg-ink/[0.03]">
                  <th scope="col" className="p-6 font-medium text-ink/50">
                    What matters
                  </th>
                  <th
                    scope="col"
                    className="w-[36%] bg-paper p-6 text-base font-semibold"
                  >
                    DeepType
                  </th>
                  <th
                    scope="col"
                    className="w-[36%] p-6 text-base font-semibold"
                  >
                    {item.name}
                  </th>
                </tr>
              </thead>
              <tbody>
                {DEEPTYPE_FACTS.map(([label, value], index) => (
                  <tr key={label} className="border-t border-ink/10">
                    <th scope="row" className="p-6 align-top font-medium">
                      {label}
                    </th>
                    <td className="bg-paper/40 p-6 align-top text-ink/70">
                      {value}
                    </td>
                    <td className="p-6 align-top text-ink/65">
                      {item.facts[index]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-ink/50 sm:hidden">
            Swipe the table to see both apps.
          </p>
        </section>

        <section
          className="my-16 grid gap-12 sm:grid-cols-2"
          aria-label="Which app fits your workflow"
        >
          <div>
            <p className="eyebrow">Pick DeepType if</p>
            <h2 className="mt-4 font-serif text-2xl tracking-tight">
              You want your voice to stay on your Mac.
            </h2>
            <p className="mt-4 text-base text-ink/65">{item.betterFor}</p>
          </div>
          <div>
            <p className="eyebrow">Pick {item.name} if</p>
            <h2 className="mt-4 font-serif text-2xl tracking-tight">
              Its workflow fits you better.
            </h2>
            <p className="mt-4 text-base text-ink/65">
              {item.alternativeFor}
            </p>
          </div>
        </section>
        <aside className="rounded-xl bg-paper p-8">
          <h2 className="font-serif text-lg tracking-tight">Our take</h2>
          <p className="mt-3 max-w-[680px] text-base text-ink/70">
            {item.takeaway}
          </p>
        </aside>
        <section className="mt-12" aria-labelledby="sources-title">
          <h2 id="sources-title" className="font-serif text-lg tracking-tight">
            Sources and scope
          </h2>
          <p className="mt-3 max-w-[680px] text-sm text-ink/65">
            Based on the official pages below, reviewed {REVIEWED_ON}. DeepType
            publishes this comparison, so it is not an independent benchmark. We
            have not measured relative accuracy or speed. Check each provider
            for current plans and availability.
          </p>
          <ul className="mt-4 space-y-3">
            {item.sources.map((source) => (
              <li key={source.url}>
                <a
                  className="text-sm underline underline-offset-4 hover:text-ink/65"
                  href={source.url}
                >
                  {source.label} ↗
                </a>
              </li>
            ))}
          </ul>
        </section>
        <nav
          className="mt-16 border-t border-ink/10 pt-8"
          aria-label="Related reading"
        >
          <h2 className="font-serif text-lg tracking-tight">Related reading</h2>
          <div className="mt-4 flex flex-col gap-4">
            {articles.slice(0, 3).map((post) => (
              <Link
                key={post.slug}
                to="/blog/$slug"
                params={{ slug: post.slug }}
                className="inline-flex items-center gap-2 text-sm text-ink/65 hover:text-ink"
              >
                {post.title}
                <ArrowRightIcon />
              </Link>
            ))}
          </div>
        </nav>
        <nav
          className="mt-8 border-t border-ink/10 pt-8"
          aria-label="Other comparisons"
        >
          <h2 className="font-serif text-lg tracking-tight">More comparisons</h2>
          <div className="mt-4 flex flex-wrap gap-x-8 gap-y-4">
            {comparisons
              .filter((other) => other.slug !== item.slug)
              .map((other) => (
                <Link
                  key={other.slug}
                  to="/blog/$slug"
                  params={{ slug: other.slug }}
                  className="inline-flex items-center gap-2 text-sm text-ink/65 hover:text-ink"
                >
                  {other.name}
                  <ArrowRightIcon />
                </Link>
              ))}
          </div>
        </nav>
      </article>
      <ClosingCTA />
    </>
  );
}
