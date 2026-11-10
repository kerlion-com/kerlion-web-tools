# KERLION SEO Tools

A browser-based collection of SEO utility generators by KERLION.

## Live Tool

[Open KERLION SEO Tools](https://www.kerlionvip.com/p/blog-page_15.html)

## Arabic Developer Guide

[Read the Arabic developer guide](https://www.kerlionvip.com/2026/11/kerlion-seo-tools.html)

## Included Tools

- Sitemap URL generator
- `robots.txt` generator
- `ads.txt` generator
- Meta Tags generator

## Features

- Generate sitemap endpoint suggestions for a supplied website URL.
- Generate `robots.txt` content.
- Generate an `ads.txt` line using the publisher ID supplied by the user.
- Generate SEO, Open Graph, and Twitter Card meta tags.
- Copy generated content and download generated text files.
- Four-tab Arabic RTL interface.
- Remembers the last entered website address in browser local storage.

## Run Locally

No build step or package installation is required. Open `index.html` in a modern browser.
The Cairo font is loaded from Google Fonts when internet access is available.

## Important Scope

The Sitemap tab generates a list of common sitemap/feed URL patterns; it does
not crawl a site or verify that the generated endpoints exist.
The robots.txt generator creates a text template and does not inspect existing
robots rules. The ads.txt generator uses the publisher ID supplied by the user;
the default publisher ID is only a placeholder and must be replaced before use.
The Meta Tags generator produces a snippet based on user-provided fields and
does not verify page content or guarantee search ranking.

## Project Structure

```text
seo-tools/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── app.js
├── LICENSE
└── README.md
```

## Source and Attribution

Designed and developed by **KERLION**.

Official website: [https://www.kerlionvip.com](https://www.kerlionvip.com)

The visible KERLION credit at the bottom of the interface must remain readable
and clickable, linking to the official website.

## License

MIT-based license with KERLION attribution condition. See [LICENSE](LICENSE).
