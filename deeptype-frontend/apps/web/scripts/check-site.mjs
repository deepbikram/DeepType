import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

const origin = "https://deeptype.com";
const vite = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
});
try {
  const { articles } = await vite.ssrLoadModule("/src/lib/blog.ts");
  const { comparisons } = await vite.ssrLoadModule("/src/lib/comparisons.ts");
  const sitemap = await readFile("dist/sitemap.xml", "utf8");
  const paths = [
    ...sitemap.matchAll(/<loc>https:\/\/deeptype.com([^<]*)<\/loc>/g),
  ].map((match) => match[1]);
  assert.deepEqual(
    [...paths].sort(),
    [
      "/",
      "/blog",
      ...articles.map((item) => `/blog/${item.slug}`),
      ...comparisons.map((item) => `/blog/${item.slug}`),
      "/privacy",
      "/terms",
    ].sort(),
    "Sitemap lists the homepage, blog index, every article and comparison, and the information pages",
  );
  assert.equal(new Set(paths).size, paths.length, "Every blog slug is unique");
  const titles = new Set();
  for (const path of paths) {
    const html = await readFile(
      path === "/" ? "dist/index.html" : `dist${path}.html`,
      "utf8",
    );
    const head = html.slice(0, html.indexOf("</head>"));
    const title = head.match(/<title>(.*?)<\/title>/)?.[1];
    assert.ok(title && !titles.has(title), `${path}: unique static title`);
    titles.add(title);
    assert.equal(
      (html.match(/<h1\b/g) ?? []).length,
      1,
      `${path}: one rendered heading`,
    );
    assert.ok(
      head.includes(`rel="canonical" href="${origin}${path}"`),
      `${path}: canonical URL`,
    );
    assert.ok(
      head.includes(
        'property="og:image" content="https://deeptype.com/og-image.png"',
      ),
      `${path}: static OG image`,
    );
    assert.ok(
      head.includes('name="twitter:card" content="summary_large_image"'),
      `${path}: large social card`,
    );
    assert.ok(
      /<button\b[^>]*aria-haspopup="menu"[^>]*class="download-cta\b/.test(html),
      `${path}: header download menu`,
    );
    for (const arch of ["arm64", "x86_64"]) {
      assert.ok(
        html.includes(`href="https://github.com/deepbikram/DeepType/releases/latest/download/DeepType-${arch}.dmg"`),
        `${path}: ${arch} download available`,
      );
    }
    for (const [, href] of html.matchAll(/href="(\/[^"#]*)/g)) {
      assert.ok(
        paths.includes(href) ||
          href.startsWith("/assets/") ||
          href === "/favicon.svg" ||
          href === "/favicon.png",
        `${path}: unknown internal link ${href}`,
      );
    }
    const article = articles.find((item) => path === `/blog/${item.slug}`);
    if (article) {
      assert.ok(
        html.toLowerCase().includes(`<time datetime="${article.date}"`) &&
          html.includes("By the DeepType team") &&
          /<h2\b/.test(html.slice(html.indexOf("By the DeepType team"))),
        `${path}: prerendered article content`,
      );
    }
    if (comparisons.some((item) => path === `/blog/${item.slug}`)) {
      assert.ok(
        html.includes("<table") && html.includes("Sources and scope"),
        `${path}: prerendered comparison content`,
      );
    }
  }
  assert.ok(
    (await readFile("dist/404.html", "utf8")).includes("Nothing was said here"),
    "Branded 404",
  );
  assert.match(
    await readFile("dist/_redirects", "utf8"),
    /^\/compare\/\* \/blog\/:splat 301$/m,
    "Old comparison URLs redirect to the blog",
  );
  const png = await readFile("dist/og-image.png");
  assert.equal(png.subarray(1, 4).toString(), "PNG");
  assert.equal(png.readUInt32BE(16), 1730);
  assert.equal(png.readUInt32BE(20), 909);

  const { countInstallerDownloads } = await vite.ssrLoadModule(
    "/src/components/download-count.tsx",
  );
  assert.equal(
    countInstallerDownloads([
      {
        assets: [
          { name: "appcast.xml", download_count: 500 },
          { name: "DeepType-arm64.dmg", download_count: 700 },
          { name: "DeepType-x86_64.dmg", download_count: 60 },
        ],
      },
      { assets: [{ name: "DeepType-arm64.dmg", download_count: 5 }] },
      { assets: [] },
    ]),
    765,
    "Download count sums DMGs across releases and skips update checks",
  );
  assert.throws(
    () =>
      countInstallerDownloads([
        { assets: [{ name: "DeepType-arm64.dmg", download_count: "9" }] },
      ]),
    "Download count rejects a malformed count",
  );

  const homepage = await readFile("dist/index.html", "utf8");
  const { default: Testimonials } = await vite.ssrLoadModule(
    "/src/components/ui/cards.tsx",
  );
  const testimonial = {
    name: "Test author",
    handle: "@test_author",
    quote: "An exact quote <preserved> & escaped.",
    postUrl: "https://x.com/test_author/status/123456789",
  };
  const renderTestimonials = (testimonials) => renderToStaticMarkup(
    createElement(Testimonials, { testimonials }),
  );
  const empty = renderTestimonials([]);
  assert.equal(empty, "", "An empty testimonial list renders nothing");
  const single = renderTestimonials([testimonial]);
  assert.ok(single.includes(`href="${testimonial.postUrl}"`));
  assert.ok(single.includes("An exact quote &lt;preserved&gt; &amp; escaped."));
  assert.equal((single.match(/<blockquote/g) ?? []).length, 1);
  assert.ok(!single.includes("testimonials-track"), "Small collections stay static");
  const hackerNews = renderTestimonials([{ name: "hn_user", quote: "Neat.", postUrl: "https://news.ycombinator.com/item?id=50046250" }]);
  assert.ok(hackerNews.includes('href="https://news.ycombinator.com/item?id=50046250"') && hackerNews.includes("Read on Hacker News"));
  for (const postUrl of ["javascript:alert(1)", "https://x.com.evil.test/a/status/1", "https://example.com/a/status/1", "https://news.ycombinator.com.evil.test/item?id=1", "https://news.ycombinator.com/item?id=1&goto=https://evil.test", ""]) {
    assert.ok(!renderTestimonials([{ ...testimonial, postUrl }]).includes("<a "), "Only X and Hacker News post URLs are linked");
  }
  const scrolling = renderTestimonials(Array.from({ length: 6 }, () => testimonial));
  assert.equal((scrolling.match(/<blockquote/g) ?? []).length, 12);
  assert.equal((scrolling.match(/aria-hidden="true" inert=""/g) ?? []).length, 2, "Marquee copies are hidden from assistive technology and keyboard navigation");
  const { default: TestimonialsDemo } = await vite.ssrLoadModule("/src/components/ui/demo.tsx");
  const demo = renderToStaticMarkup(createElement(TestimonialsDemo));
  assert.ok(demo.includes("not real endorsements") && !demo.includes("<a "));
  const closing = homepage.match(/<section\b[^>]*aria-labelledby="start-title"[^>]*>([\s\S]*?)<\/section>/)?.[1] ?? "";
  assert.ok(
    closing.includes("starts with your voice") &&
      closing.includes("DeepType-arm64.dmg") &&
      closing.includes("DeepType-x86_64.dmg"),
    "The closing CTA offers both downloads under its heading",
  );
  const menuButton = homepage.match(
    /<button\b[^>]*aria-controls="navigation-links"[^>]*>/,
  )?.[0];
  assert.ok(
    menuButton?.includes('aria-expanded="false"') &&
      menuButton.includes('aria-label="Open menu"'),
    "The mobile navigation starts collapsed with a named toggle",
  );
  const hero = homepage.match(
    /<section\b[^>]*aria-labelledby="hero-title"[^>]*>([\s\S]*?)<\/section>/,
  )?.[1];
  assert.ok(hero, "The homepage renders its hero");
  assert.deepEqual(
    [...hero.matchAll(/<a\b[^>]*href="([^"]+)"/g)].map((match) => match[1]),
    [
      "https://github.com/deepbikram/DeepType/releases/latest/download/DeepType-arm64.dmg",
      "https://github.com/deepbikram/DeepType/releases/latest/download/DeepType-x86_64.dmg",
      "#how-it-works",
    ],
    "The hero offers both downloads and a link to how it works",
  );
  console.log(
    `Passed: ${paths.length} static pages, metadata, internal links, CTAs, ${articles.length + comparisons.length} blog posts, redirects, 404, OG image, download count and testimonials.`,
  );
} finally {
  await vite.close();
}
