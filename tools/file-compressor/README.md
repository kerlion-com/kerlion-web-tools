# KERLION File Compressor v3.0

A browser-based file packaging and image compression tool from KERLION. The interface is Arabic and RTL.

## Live Tool

https://www.kerlionvip.com/p/file-compressor-v30.html

## Arabic Developer Guide

https://www.kerlionvip.com/2026/07/image-compressor.html

## Features

- Compress supported image files in the browser using Canvas.
- Choose output quality (default: 70%).
- Choose automatic output format, WEBP, JPG, or PNG.
- Add up to 50 files, with a 200 MB per-file limit.
- Add non-image files to the generated ZIP archive without re-encoding them.
- Drag and drop files or select them through the file picker.
- Display original size, generated archive size, and estimated savings.
- Download the result as `kerlion-compressed.zip`.
- Arabic RTL responsive interface.
- Files are processed locally in the browser; the application does not upload selected files to a KERLION server.

## Project Structure

```text
file-compressor/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── app.js
├── LICENSE
└── README.md
```

## Run Locally

Open `index.html` in a modern browser. An internet connection is required to load the JSZip library and Google Fonts from their configured CDNs.

## Dependencies

- [JSZip 3.10.1](https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js) — generates the downloadable ZIP archive.
- Google Fonts (Cairo) — interface typography.

No build step or package installation is required.

## Notes and Limitations

- Image conversion relies on browser Canvas support. Results may differ between browsers and source formats.
- Non-image files are included in the ZIP without compression by the image-processing stage; ZIP generation applies DEFLATE level 6.
- Maximum selection is 50 files and the per-file limit is 200 MB.
- The tool's resource usage depends on the browser and available device memory.
- The browser must be able to load the external JSZip CDN dependency.

## License

This project is distributed under the KERLION Attribution License in `LICENSE`. Reuse, modification, redistribution, and commercial use are permitted provided that the required KERLION attribution and clickable official website link remain visible.

## Credits

Designed and developed by [KERLION](https://www.kerlionvip.com).
