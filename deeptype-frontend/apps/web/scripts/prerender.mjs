import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "vite";

const template = await readFile("dist/index.html", "utf8");
const assets =
  template
    .match(
      /<(?:script\b[^>]*src=[^>]*><\/script|link\b[^>]*rel="stylesheet"[^>]*)>/g,
    )
    ?.join("") ?? "";
if (!assets.includes("script")) throw new Error("Missing built client entry");
const vite = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
});
try {
  const { render, paths } = await vite.ssrLoadModule("/src/prerender.tsx");
  const { articles } = await vite.ssrLoadModule("/src/lib/blog.ts");
  const { comparisons, REVIEWED_ON_ISO } = await vite.ssrLoadModule(
    "/src/lib/comparisons.ts",
  );
  const escapeXml = (value) =>
    value.replace(/[<>&'"]/g, (char) =>
      ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[char],
    );
  for (const path of [...paths, "/404"]) {
    const html = (await render(path)).replace(
      "</head>",
      `${assets}${path === "/404" ? '<meta name="robots" content="noindex" />' : ""}</head>`,
    );
    const file =
      path === "/"
        ? "dist/index.html"
        : path === "/404"
          ? "dist/404.html"
          : `dist${path}.html`;
    await writeFile(file, html).catch(async (error) => {
      if (error.code !== "ENOENT") throw error;
      await mkdir(file.slice(0, file.lastIndexOf("/")), { recursive: true });
      await writeFile(file, html);
    });
  }
  await writeFile(
    "dist/sitemap.xml",
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map((path) => `<url><loc>https://deeptype.com${path}</loc></url>`).join("")}</urlset>`,
  );
  const feedItems = [
    ...articles.map((item) => ({
      title: item.title,
      description: item.description,
      path: `/blog/${item.slug}`,
      date: item.dateModified ?? item.date,
    })),
    ...comparisons.map((item) => ({
      title: `DeepType vs ${item.name}`,
      description: item.intro,
      path: `/blog/${item.slug}`,
      date: REVIEWED_ON_ISO,
    })),
  ];
  await writeFile(
    "dist/feed.xml",
    `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>DeepType — Notes on local dictation</title><link>https://deeptype.com/blog</link><description>How local dictation works on a Mac, how DeepType compares with other Mac dictation apps, and where your words go.</description>${feedItems.map((item) => `<item><title>${escapeXml(item.title)}</title><link>https://deeptype.com${item.path}</link><guid>https://deeptype.com${item.path}</guid><description>${escapeXml(item.description)}</description><pubDate>${new Date(`${item.date}T00:00:00Z`).toUTCString()}</pubDate></item>`).join("")}</channel></rss>`,
  );
  console.log(`Prerendered ${paths.length} pages and the 404 page.`);
} finally {
  await vite.close();
}
