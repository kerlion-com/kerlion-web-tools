# KERLION UTM Link Generator

A browser-based campaign URL builder that adds UTM parameters to a destination URL.

## Live Tool

[Open KERLION UTM Link Generator](https://www.kerlionvip.com/p/utm-link-generator.html)

## Arabic Developer Guide

[Read the Arabic developer guide](https://www.kerlionvip.com/2026/08/utm-link-generator.html)

## Features

- Accept a destination URL and add HTTPS when omitted.
- Require `utm_source`, `utm_medium`, and `utm_campaign`.
- Support optional `utm_term` and `utm_content`.
- Preserve existing URL query parameters and set or update UTM values with the URL API.
- Show the final tagged URL and a summary of its UTM parameters.
- Copy the generated URL, open it in a new tab, or clear all fields.
- Automatically regenerate the preview after input changes once a URL has been generated.
- Expandable usage examples and FAQ.
- Arabic RTL responsive interface.

## Project Structure

```text
utm-link-generator/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── app.js
├── LICENSE
└── README.md
```

## Run Locally

No package installation or build step is required. Open `index.html` in a modern browser.
The Cairo font is loaded from Google Fonts when internet access is available.

## Privacy and Scope

The generator builds URLs in the browser using the built-in URL API. It does
not send the entered URL or UTM values to a KERLION backend, nor does it
evaluate campaign performance or validate analytics reports.

## Source and Attribution

You may use, modify, adapt, publish, redistribute, and commercially use this
tool, provided that the visible KERLION attribution remains in the user-facing
interface.

Required attribution:

**جميع الحقوق محفوظة لمنصة KERLION**  
**تم التصميم والتطوير بواسطة [منصة KERLION](https://www.kerlionvip.com)**

The KERLION website link must remain clickable. Do not remove, hide, obscure,
or disable this attribution.

## License

This project uses the custom **KERLION Attribution License**. See [LICENSE](LICENSE)
for the full terms. It permits use, modification, redistribution, and
commercial use subject to the attribution requirement. It is not the standard
MIT License and is not OSI-approved.
