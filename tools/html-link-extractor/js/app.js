/* KERLION HTML Link Extractor | source separated from the Blogger embed */
(function () {
    'use strict';

    var root = document.getElementById('kLinkExtractor');
    if (!root || root.dataset.kleReady === '1') return;
    root.dataset.kleReady = '1';

    function byId(id) { return document.getElementById(id); }

    var source = byId('kleHtmlSource');
    var modeInput = byId('kleMode');
    var baseInput = byId('kleBaseUrl');
    var uniqueInput = byId('kleUnique');
    var fragmentsInput = byId('kleKeepFragments');
    var results = byId('kleResults');
    var status = byId('kleStatus');
    var extractedAll = [];
    var displayedResults = [];

    function setStatus(message, isError) {
      status.textContent = message;
      status.style.color = isError ? '#a52222' : '#11685f';
    }

    function addText(parent, tag, className, text) {
      var node = document.createElement(tag);
      if (className) node.className = className;
      node.textContent = text;
      parent.appendChild(node);
      return node;
    }

    function normalizeBase() {
      var value = baseInput.value.trim();
      if (!value) return null;
      try {
        var parsed = new URL(value);
        if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null;
        return parsed;
      } catch (error) {
        return null;
      }
    }

    function classifyUrl(rawUrl, baseUrl) {
      var value = rawUrl.trim();
      if (/^(mailto:|tel:|sms:|javascript:|data:|blob:)/i.test(value)) {
        var scheme = (value.match(/^([a-z][a-z0-9+.-]*):/i) || [,''])[1].toLowerCase();
        return { kind: 'خاص', resolved: value, key: value, scheme: scheme };
      }

      var parsed;
      try {
        if (baseUrl) {
          parsed = new URL(value, baseUrl.href);
        } else if (/^https?:\/\//i.test(value) || /^\/\//.test(value)) {
          parsed = new URL(value.indexOf('//') === 0 ? 'https:' + value : value);
        } else {
          return { kind: 'نسبي', resolved: value, key: value, scheme: '' };
        }
      } catch (error) {
        return { kind: 'غير محدد', resolved: value, key: value, scheme: '' };
      }

      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return { kind: 'خاص', resolved: value, key: parsed.href, scheme: parsed.protocol.replace(':','') };
      }

      if (baseUrl) {
        return {
          kind: parsed.hostname.toLowerCase() === baseUrl.hostname.toLowerCase() ? 'داخلي' : 'خارجي',
          resolved: parsed.href,
          key: parsed.href,
          scheme: parsed.protocol.replace(':','')
        };
      }

      return { kind: 'رابط كامل', resolved: parsed.href, key: parsed.href, scheme: parsed.protocol.replace(':','') };
    }

    function parseLinks() {
      var rawHtml = source.value;
      if (!rawHtml.trim()) {
        setStatus('الصق كود HTML أولا.', true);
        source.focus();
        return;
      }

      var parser = new DOMParser();
      var parsedDocument = parser.parseFromString(rawHtml, 'text/html');
      var candidates = [];
      var mode = modeInput.value;
      var selector = mode === 'anchors'
        ? 'a[href], area[href]'
        : mode === 'hrefsrc'
          ? '[href], [src]'
          : '[href]';

      parsedDocument.querySelectorAll(selector).forEach(function (element) {
        var attrs = [];
        if (element.hasAttribute('href')) attrs.push('href');
        if (mode === 'hrefsrc' && element.hasAttribute('src')) attrs.push('src');

        attrs.forEach(function (attribute) {
          var value = (element.getAttribute(attribute) || '').trim();
          if (!value) return;
          if (!fragmentsInput.checked && value.charAt(0) === '#') return;

          var classified = classifyUrl(value, normalizeBase());
          candidates.push({
            url: value,
            tag: element.tagName.toLowerCase(),
            attribute: attribute,
            kind: classified.kind,
            key: classified.key,
            resolved: classified.resolved,
            scheme: classified.scheme
          });
        });
      });

      extractedAll = candidates;
      displayedResults = [];
      var duplicateCount = 0;
      var seen = Object.create(null);
      candidates.forEach(function (item) {
        if (uniqueInput.checked && Object.prototype.hasOwnProperty.call(seen, item.key)) {
          duplicateCount += 1;
          return;
        }
        seen[item.key] = true;
        displayedResults.push(item);
      });

      updateSummary(candidates.length, displayedResults.length, duplicateCount, displayedResults);
      renderResults(displayedResults);

      if (!candidates.length) {
        setStatus('لم يتم العثور على روابط مطابقة للخيارات الحالية. جرب نوع استخراج آخر.', false);
      } else {
        setStatus('تم العثور على ' + candidates.length + ' رابطا وعرض ' + displayedResults.length + ' نتيجة بعد تطبيق الخيارات.');
      }
    }

    function updateSummary(total, shown, duplicates, links) {
      byId('kleTotal').textContent = String(total);
      byId('kleShown').textContent = String(shown);
      byId('kleDuplicates').textContent = String(duplicates);
      byId('kleInternal').textContent = String(links.filter(function (item) { return item.kind === 'داخلي'; }).length);
    }

    function renderResults(links) {
      results.textContent = '';
      if (!links.length) {
        addText(results, 'div', 'kle-empty', 'لا توجد نتائج لعرضها. تحقق من كود HTML وخيارات الاستخراج.');
        return;
      }

      var tableWrap = document.createElement('div');
      tableWrap.className = 'kle-table-wrap';
      var table = document.createElement('table');
      table.className = 'kle-table';
      var thead = document.createElement('thead');
      var headerRow = document.createElement('tr');
      ['#', 'الرابط المستخرج', 'عنصر HTML', 'نوع الرابط'].forEach(function (label) {
        addText(headerRow, 'th', '', label);
      });
      thead.appendChild(headerRow);
      table.appendChild(thead);

      var tbody = document.createElement('tbody');
      links.forEach(function (item, index) {
        var row = document.createElement('tr');
        addText(row, 'td', '', String(index + 1));
        var urlCell = document.createElement('td');
        addText(urlCell, 'span', 'kle-url', item.url);
        row.appendChild(urlCell);

        var sourceCell = document.createElement('td');
        addText(sourceCell, 'span', 'kle-tag', '<' + item.tag + '>');
        var attr = document.createElement('div');
        attr.style.marginTop = '6px';
        addText(attr, 'span', 'kle-tag', item.attribute);
        sourceCell.appendChild(attr);
        row.appendChild(sourceCell);

        var kindCell = document.createElement('td');
        var kindClass = item.kind === 'داخلي' ? 'internal' : item.kind === 'خارجي' ? 'external' : '';
        addText(kindCell, 'span', 'kle-kind ' + kindClass, item.kind);
        row.appendChild(kindCell);

        tbody.appendChild(row);
      });

      table.appendChild(tbody);
      tableWrap.appendChild(table);
      results.appendChild(tableWrap);
    }

    function linkLines() {
      return displayedResults.map(function (item) { return item.url; }).join('\n');
    }

    function csvEscape(value) {
      var text = String(value == null ? '' : value);
      // Prevent spreadsheet formula execution when opening exported CSV files.
      if (/^[\s\u0000-\u001f]*[=+\-@]/.test(text)) {
        text = "'" + text;
      }
      return '"' + text.replace(/"/g, '""') + '"';
    }

    function csvData() {
      var rows = [['URL', 'HTML tag', 'Attribute', 'Classification']];
      displayedResults.forEach(function (item) {
        rows.push([item.url, item.tag, item.attribute, item.kind]);
      });
      return '\uFEFF' + rows.map(function (row) {
        return row.map(csvEscape).join(',');
      }).join('\r\n');
    }

    function copyText(text, emptyMessage, successMessage) {
      if (!text) {
        setStatus(emptyMessage, true);
        return;
      }
      function fallback() {
        var helper = document.createElement('textarea');
        helper.value = text;
        helper.setAttribute('readonly', '');
        helper.style.position = 'fixed';
        helper.style.opacity = '0';
        document.body.appendChild(helper);
        helper.select();
        var ok = false;
        try { ok = document.execCommand('copy'); } catch (error) { ok = false; }
        helper.remove();
        setStatus(ok ? successMessage : 'تم تحديد النص. انسخه يدويا إذا لم يتم النسخ تلقائيا.', !ok);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          setStatus(successMessage, false);
        }).catch(fallback);
      } else {
        fallback();
      }
    }

    function downloadFile(content, fileName, mimeType) {
      if (!displayedResults.length) {
        setStatus('استخرج الروابط أولا قبل تنزيل النتائج.', true);
        return;
      }
      var blob = new Blob([content], { type: mimeType });
      var url = URL.createObjectURL(blob);
      var link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1200);
      setStatus('تم تجهيز الملف للتنزيل.');
    }

    byId('kleExtract').addEventListener('click', parseLinks);

    byId('kleCopyLinks').addEventListener('click', function () {
      copyText(linkLines(), 'لا توجد روابط لنسخها. استخرج الروابط أولا.', 'تم نسخ قائمة الروابط.');
    });

    byId('kleDownloadTxt').addEventListener('click', function () {
      downloadFile(linkLines(), 'kerlion-extracted-links.txt', 'text/plain;charset=utf-8');
    });

    byId('kleDownloadCsv').addEventListener('click', function () {
      downloadFile(csvData(), 'kerlion-extracted-links.csv', 'text/csv;charset=utf-8');
    });

    byId('kleExample').addEventListener('click', function () {
      source.value = '<!doctype html>\n<html lang="ar">\n<head>\n  <link rel="canonical" href="https://www.kerlionvip.com/tools.html">\n</head>\n<body>\n  <a href="https://www.kerlionvip.com/">الرئيسية</a>\n  <a href="/p/kerlion-academy.html">KERLION Academy</a>\n  <a href="https://example.com/article">رابط خارجي</a>\n  <a href="#contact">انتقل إلى التواصل</a>\n  <a href="mailto:hello@example.com">البريد</a>\n  <img src="/images/logo.png" alt="KERLION">\n</body>\n</html>';
      baseInput.value = 'https://www.kerlionvip.com/';
      modeInput.value = 'hrefsrc';
      uniqueInput.checked = true;
      fragmentsInput.checked = true;
      setStatus('تم تحميل مثال توضيحي. اضغط استخراج الروابط لعرض النتائج.');
      source.focus();
    });

    byId('kleClear').addEventListener('click', function () {
      source.value = '';
      baseInput.value = '';
      modeInput.value = 'href';
      uniqueInput.checked = true;
      fragmentsInput.checked = true;
      extractedAll = [];
      displayedResults = [];
      updateSummary(0, 0, 0, []);
      results.textContent = '';
      addText(results, 'div', 'kle-empty', 'ستظهر الروابط هنا بعد فحص كود HTML.');
      setStatus('تم مسح الحقول.');
      source.focus();
    });

    modeInput.addEventListener('change', function () {
      setStatus('تم تغيير نوع الاستخراج. اضغط استخراج الروابط لتحديث النتائج.');
    });
    baseInput.addEventListener('change', function () {
      setStatus('تم تغيير رابط الموقع الأساسي. أعد استخراج الروابط لتحديث التصنيف.');
    });

    updateSummary(0, 0, 0, []);
  })();
