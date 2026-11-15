# KERLION PDF to Word Converter

A browser-based tool that extracts selectable text from PDF files and creates
an editable DOCX document.

## Live Tool

[Open KERLION PDF to Word Converter](https://www.kerlionvip.com/p/pdf-to-word-converter.html)

## Arabic Developer Guide

[Read the Arabic developer guide](https://www.kerlionvip.com/2026/08/pdf-to-word-converter.html)

## Features

- Select a PDF using the file picker or drag and drop.
- Validate PDF selection and reject empty files.
- Enforce a maximum input size of 50 MB.
- Extract text page by page using PDF.js.
- Generate an editable DOCX file using the docx library.
- Show conversion progress and readable error messages.
- Download the resulting Word document.
- Retry a failed conversion or select another PDF.
- Provide an Arabic RTL interface and FAQ section.

## Project Structure

```text
pdf-to-word-converter/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── app.js
├── LICENSE
└── README.md
```

## Run Locally

No package installation or build step is required. Serve the project from a
local web server or open `index.html` in a modern browser with internet access.

The tool loads these browser libraries at runtime:
- PDF.js 3.11.174 from cdnjs
- docx 8.5.0 from unpkg

The Cairo font is requested from Google Fonts, with a generic fallback.

## Privacy and Limitations

- PDF processing is performed in the browser; the application code does not
  upload the selected PDF to a KERLION server.
- The current version extracts selectable text and does not include OCR.
- Password-protected files are not supported by the current conversion flow.
- Complex layouts, tables, columns, and embedded images may not be reproduced
  exactly; the output primarily contains extracted text.
- The current file-size limit is 50 MB.
- The external browser libraries and font require internet access to load.

## Source and Attribution

You may use, modify, adapt, publish, redistribute, and commercially use this
tool, provided that the visible KERLION attribution remains in the user-facing
interface.

Required attribution:
**جميع الحقوق محفوظة لمنصة KERLION**  
**تم التصميم والتطوير بواسطة [منصة KERLION](https://www.kerlionvip.com)**

The KERLION website link must remain clickable. Do not remove, hide, obscure,
or disable the attribution.

## License

This project uses the custom **KERLION Attribution License**. See [LICENSE](LICENSE)
for the full terms. The license permits redistribution and commercial use
subject to the attribution requirement. It is not the standard MIT License
and is not OSI-approved.
