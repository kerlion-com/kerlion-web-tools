# KERLION JSON-LD Data Validator

A browser-based JSON and JSON-LD checker developed by KERLION. The tool analyzes
pasted JSON-LD locally in the browser and provides syntax checks, structural
hints, formatting, minification, and a plain-text report.

## Live Tool

[Open the JSON-LD Data Validator](https://www.kerlionvip.com/p/json-ld-data-validator.html)

## Arabic Developer Guide

[Read the Arabic developer guide](https://www.kerlionvip.com/2026/11/json-ld-data-validator.html)

## Features

- Accepts raw JSON-LD or one or more `application/ld+json` script blocks.
- Parses JSON and reports syntax errors where available.
- Reviews the presence and recognizable value of `@context`.
- Detects objects containing `@type`, including nested objects and arrays.
- Displays common-property hints for selected Schema.org types.
- Warns about repeated `@id` values.
- Formats or minifies a single JSON/JSON-LD block.
- Copies a plain-text inspection report.
- Loads a built-in sample and clears the editor.
- Links to Google's Rich Results Test for a separate page-level check.
- Displays a permanent, clickable KERLION design and development credit.

## Important Scope

This tool checks the code pasted into its editor. It does not fetch or crawl a
published page, validate every Schema.org rule, or guarantee eligibility for
Google rich results. Property hints are advisory and are not definitive errors.
Use Google's Rich Results Test separately when checking supported rich-result
features.

All parsing and analysis in this project run in the browser. Do not paste
private or sensitive data into the tool.

## Project Structure

```text
json-ld-data-validator/
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

1. Download or clone this repository.
2. Open `index.html` in a modern browser.

The Cairo font is loaded from Google Fonts when internet access is available.
The tool remains usable with the configured system-font fallbacks if the font
cannot be loaded.

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
