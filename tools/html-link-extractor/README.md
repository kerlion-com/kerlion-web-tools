# KERLION HTML Link Extractor

A browser-based HTML link extractor developed by KERLION. Paste HTML source to
extract URLs, review their source element and attribute, optionally classify
links using a base URL, remove duplicates, and export results.

## Live Tool

[Open the HTML Link Extractor](https://www.kerlionvip.com/p/html-link-extractor.html)

## Arabic Developer Guide

[Read the Arabic developer guide](https://www.kerlionvip.com/2026/10/html-link-extractor.html)

## Features

- Extract links from `a[href]` and `area[href]`.
- Extract all `href` attributes.
- Optionally include resource `src` attributes.
- Optionally classify same-host links as internal and other HTTP(S) links as external when a valid base URL is supplied.
- Preserve or remove fragment-only links.
- Remove duplicate URLs from displayed results and report the duplicate count.
- Copy the displayed URL list.
- Export results as TXT or CSV.
- Load a sample HTML document and reset the form.
- Display counts for extracted links, shown links, duplicates, and internal links.

## Important Scope

The tool parses only the HTML text pasted into the editor. It does not visit
URLs, verify that links resolve, or execute page JavaScript to discover links
created after page load. Relative URLs are classified only when a valid
HTTP(S) base URL is provided.

CSV exports include a spreadsheet-formula safety prefix for values that could
otherwise be interpreted as formulas by spreadsheet software.

## Project Structure

```text
html-link-extractor/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── app.js
├── LICENSE
└── README.md
```

## Run Locally

No build step or package installation is required.

1. Download or clone the repository.
2. Open `index.html` in a modern browser.

The Cairo font is loaded from Google Fonts when internet access is available.
The tool remains usable with system-font fallbacks.

## Source and Attribution

Designed and developed by **KERLION**.

Official website: [https://www.kerlionvip.com](https://www.kerlionvip.com)

When using, embedding, modifying, or redistributing this tool, retain the
visible credit at the bottom of the application:

**Designed and developed by KERLION** — the KERLION name must link to
[https://www.kerlionvip.com](https://www.kerlionvip.com).

## License

This project uses an MIT-based license with an additional KERLION attribution
condition. See [LICENSE](LICENSE) for the exact terms.

**License compatibility note:** The attribution condition is an additional
restriction, so this is not the standard MIT License and is not OSI-approved
Open Source Software under the OSI Open Source Definition.
