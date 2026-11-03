import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import type { MDXComponents } from "mdx/types";
import { ClosingCTA } from "@/components/download-cta";
import { articles, type Article as ArticleData, formatDate } from "@/lib/blog";
import { comparisons } from "@/lib/comparisons";

const components: MDXComponents = {
  h2: ({ children }) => (
    <h2 className="mt-12 font-serif text-2xl leading-tight tracking-tight text-balance">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-8 font-serif text-lg tracking-tight text-balance">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="mt-4 text-base leading-relaxed text-pretty text-ink/70">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-relaxed text-ink/70 marker:text-ink/30">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mt-4 list-decimal space-y-2 pl-5 text-base leading-relaxed text-ink/70 marker:text-ink/40">
      {children}
    </ol>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-ink">{children}</strong>
  ),
  code: ({ children }) => (
    <code className="rounded bg-ink/[0.06] px-1 py-0.5 font-mono text-sm text-ink">
      {children}
    </code>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      className="text-ink underline underline-offset-4 hover:text-ink/60"
    >
      {children}
    </a>
  ),
};

export default function Article({ article }: { article: ArticleData }) {
  return (
    <>
      <article className="page-shell py-16 sm:py-20">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-sm text-ink/65 hover:text-ink"
        >
          <ArrowLeftIcon /> All posts
        </Link>
        <p className="eyebrow mt-12">
          <time dateTime={article.date}>{formatDate(article.date)}</time>
        </p>
        <h1 className="mt-4 max-w-[880px] font-serif text-4xl leading-[1.02] tracking-tight text-balance sm:text-6xl">
          {article.title}
        </h1>
        <p className="mt-6 max-w-[680px] text-lg leading-relaxed text-pretty text-ink/65">
          {article.description}
        </p>
        <p className="mt-6 text-sm text-ink/50">
          By the DeepType team
          {article.dateModified ? (
            <>
              {" · Updated "}
              <time dateTime={article.dateModified}>
                {formatDate(article.dateModified)}
              </time>
            </>
          ) : null}
        </p>
        <div className="mt-12 max-w-[680px] border-t border-ink/10 pt-4">
          <article.Content components={components} />
        </div>
        <nav
          className="mt-16 max-w-[680px] border-t border-ink/10 pt-8"
          aria-label="Related posts"
        >
          <h2 className="font-serif text-lg tracking-tight">Keep reading</h2>
          <div className="mt-4 flex flex-col gap-4">
            {articles
              .filter((post) => post.slug !== article.slug)
              .slice(0, 2)
              .map((post) => (
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
            {comparisons.slice(0, 3).map((item) => (
              <Link
                key={item.slug}
                to="/blog/$slug"
                params={{ slug: item.slug }}
                className="inline-flex items-center gap-2 text-sm text-ink/65 hover:text-ink"
              >
                DeepType vs {item.name}
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
