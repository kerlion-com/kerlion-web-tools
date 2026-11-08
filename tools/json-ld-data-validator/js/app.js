(function () {
  'use strict';

  var root = document.getElementById('kJsonLdChecker');
  if (!root || root.dataset.kjcReady === '1') return;
  root.dataset.kjcReady = '1';

  function byId(id) { return document.getElementById(id); }
  var source = byId('kjcSource');
  var results = byId('kjcResults');
  var status = byId('kjcStatus');
  var lastReport = '';

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

  function extractJsonLd(text) {
    var scriptPattern = /<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script\s*>/gi;
    var scripts = [];
    var match;
    while ((match = scriptPattern.exec(text)) !== null) {
      scripts.push(match[1].trim());
    }
    if (scripts.length) return scripts;
    return [text.trim()];
  }

  function parsePosition(message, sourceText) {
    var posMatch = String(message).match(/position\s+(\d+)/i);
    var lineColMatch = String(message).match(/line\s+(\d+)\s+column\s+(\d+)/i);
    var position = null;
    if (posMatch) {
      position = Math.max(0, Math.min(sourceText.length, Number(posMatch[1])));
    } else if (lineColMatch) {
      var targetLine = Number(lineColMatch[1]);
      var targetCol = Number(lineColMatch[2]);
      var lines = sourceText.split(/\r\n|\r|\n/);
      position = 0;
      for (var i = 0; i < targetLine - 1 && i < lines.length; i++) {
        position += lines[i].length + 1;
      }
      position += Math.max(0, targetCol - 1);
    }
    if (position === null) return null;
    var before = sourceText.slice(0, position);
    var line = before.split(/\r\n|\r|\n/).length;
    var lastBreak = Math.max(before.lastIndexOf('\n'), before.lastIndexOf('\r'));
    var column = position - lastBreak;
    return { position: position, line: line, column: column };
  }

  function collectNodes(value, nodes, visited) {
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value)) {
      value.forEach(function (item) { collectNodes(item, nodes, visited); });
      return;
    }
    if (visited.indexOf(value) !== -1) return;
    visited.push(value);
    if (Object.prototype.hasOwnProperty.call(value, '@type')) {
      nodes.push(value);
    }
    Object.keys(value).forEach(function (key) {
      if (key !== '@context') collectNodes(value[key], nodes, visited);
    });
  }

  function getTypeNames(node) {
    var type = node && node['@type'];
    if (Array.isArray(type)) return type.map(String);
    return type ? [String(type)] : [];
  }

  function hasValue(obj, key) {
    if (!obj || !Object.prototype.hasOwnProperty.call(obj, key)) return false;
    var value = obj[key];
    if (value === null || value === undefined || value === '') return false;
    if (Array.isArray(value) && value.length === 0) return false;
    if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) return false;
    return true;
  }

  function addCheck(report, level, title, detail) {
    report.checks.push({ level: level, title: title, detail: detail });
  }

  function inspectNode(report, node, nodeIndex) {
    var types = getTypeNames(node);
    var typeName = types.join(', ') || 'نوع غير محدد';
    report.types.push.apply(report.types, types);

    var advice = {
      article: { props: ['headline', 'author', 'datePublished', 'image'], label: 'المقال' },
      blogposting: { props: ['headline', 'author', 'datePublished', 'image'], label: 'التدوينة' },
      newsarticle: { props: ['headline', 'author', 'datePublished', 'image'], label: 'المقال الإخباري' },
      product: { props: ['name', 'image', 'offers'], label: 'المنتج' },
      event: { props: ['name', 'startDate', 'location'], label: 'الفعالية' },
      organization: { props: ['name', 'url', 'logo'], label: 'المؤسسة' },
      localbusiness: { props: ['name', 'address', 'telephone'], label: 'النشاط التجاري المحلي' },
      website: { props: ['name', 'url'], label: 'الموقع' },
      breadcrumblist: { props: ['itemListElement'], label: 'مسار التنقل' },
      faqpage: { props: ['mainEntity'], label: 'الأسئلة الشائعة' },
      person: { props: ['name'], label: 'الشخص' },
      webpage: { props: ['name', 'url'], label: 'صفحة الويب' },
      softwareapplication: { props: ['name', 'offers'], label: 'التطبيق' }
    };

    types.forEach(function (type) {
      var shortType = type.split(/[\/#]/).pop().toLowerCase();
      var adviceItem = advice[shortType];
      if (!adviceItem) return;
      var missing = adviceItem.props.filter(function (property) { return !hasValue(node, property); });
      if (missing.length) {
        addCheck(report, 'warn', 'راجع خصائص ' + adviceItem.label, 'النوع ' + type + ' لا يحتوي على بعض الخصائص الشائعة التالية: ' + missing.join(', ') + '. هذه ملاحظة إرشادية وليست حكما نهائيا على أهلية النتائج المنسقة.');
      } else {
        addCheck(report, 'good', 'خصائص شائعة متوفرة: ' + adviceItem.label, 'تم العثور على الخصائص التالية في هذا الكائن: ' + adviceItem.props.join(', ') + '.');
      }
    });

    report.nodes.push({ type: typeName, index: nodeIndex + 1, id: hasValue(node, '@id') ? String(node['@id']) : '' });
  }

  function inspectDocument(documentValue, report, sourceIndex) {
    var rootObjects = Array.isArray(documentValue) ? documentValue : [documentValue];
    rootObjects.forEach(function (rootObject, rootIndex) {
      if (!rootObject || typeof rootObject !== 'object') {
        addCheck(report, 'error', 'الجذر ليس كائنا أو مصفوفة', 'يجب أن تكون بيانات JSON-LD كائنا أو مصفوفة من الكائنات.');
        return;
      }
      var contextFound = false;
      var contexts = [];
      if (!Array.isArray(rootObject) && Object.prototype.hasOwnProperty.call(rootObject, '@context')) {
        contextFound = true;
        contexts = Array.isArray(rootObject['@context']) ? rootObject['@context'] : [rootObject['@context']];
      }
      if (Array.isArray(rootObject)) {
        rootObject.forEach(function (item) {
          if (item && typeof item === 'object' && Object.prototype.hasOwnProperty.call(item, '@context')) {
            contextFound = true;
            var contextValue = Array.isArray(item['@context']) ? item['@context'] : [item['@context']];
            contexts = contexts.concat(contextValue);
          }
        });
      }

      if (contextFound) {
        var schemaContext = contexts.some(function (context) {
          return typeof context === 'string' && /schema\.org\/?$/i.test(context);
        });
        if (schemaContext) addCheck(report, 'good', 'تم العثور على @context', 'تحتوي البيانات على سياق يشير إلى Schema.org.');
        else addCheck(report, 'warn', 'راجع قيمة @context', 'تم العثور على @context لكن الفاحص لم يتعرف على رابط Schema.org المعتاد. تأكد من صحة السياق أو التعريف المستخدم.');
      } else {
        addCheck(report, 'warn', 'لم يتم العثور على @context في الجذر', 'تأكد أن كائن JSON-LD يحدد السياق المناسب مثل https://schema.org أو أن كل عنصر مستقل يحدد سياقه.');
      }

      var nodes = [];
      collectNodes(rootObject, nodes, []);
      if (nodes.length) {
        addCheck(report, 'good', 'تم العثور على @type', 'اكتشف الفاحص ' + nodes.length + ' كائنات تحتوي على @type.');
      } else {
        addCheck(report, 'warn', 'لم يتم العثور على @type', 'لم يكتشف الفاحص نوع بيانات في هذا الجزء. راجع بنية الكائن وقيمة @type.');
      }
      nodes.forEach(function (node, index) {
        inspectNode(report, node, report.nodes.length);
      });
      report.parts += 1;
    });
  }

  function buildReport(text) {
    var sources = extractJsonLd(text);
    if (!text.trim()) return { empty: true, sources: [], parsed: [], errors: [], checks: [], nodes: [], types: [], parts: 0, sourceCount: 0 };

    var report = {
      empty: false, sources: sources, parsed: [], errors: [], checks: [], nodes: [], types: [], parts: 0, sourceCount: sources.length
    };

    sources.forEach(function (sourceText, index) {
      if (!sourceText) {
        report.errors.push({ index: index + 1, message: 'كتلة JSON-LD فارغة.', sourceText: sourceText });
        return;
      }
      try {
        var value = JSON.parse(sourceText);
        report.parsed.push(value);
        addCheck(report, 'good', 'صيغة JSON صحيحة في الجزء ' + (index + 1), 'تم تحليل هذا الجزء بنجاح دون خطأ في بناء JSON.');
        inspectDocument(value, report, index);
      } catch (error) {
        report.errors.push({ index: index + 1, message: error.message || 'خطأ غير معروف في صيغة JSON.', sourceText: sourceText });
      }
    });

    if (report.errors.length) {
      report.errors.forEach(function (error) {
        var position = parsePosition(error.message, error.sourceText);
        var detail = error.message;
        if (position) detail += ' (السطر ' + position.line + ' العمود ' + position.column + ')';
        addCheck(report, 'error', 'خطأ في صيغة JSON - الجزء ' + error.index, detail);
      });
    }

    if (report.parsed.length && !report.nodes.length) {
      addCheck(report, 'warn', 'لم يتم اكتشاف كائنات بيانات منظمة واضحة', 'قد تكون البيانات JSON عادية وليست JSON-LD منظما أو قد تحتاج إلى مراجعة مواضع @type.');
    }

    var seenIds = Object.create(null);
    report.nodes.forEach(function (node) {
      if (!node.id) return;
      if (seenIds[node.id]) {
        addCheck(report, 'warn', 'قيمة @id مكررة', 'تكرر المعرف ' + node.id + ' في أكثر من كائن. تحقق مما إذا كان التكرار مقصودا.');
      }
      seenIds[node.id] = true;
    });

    if (report.parsed.length && !report.errors.length) {
      addCheck(report, 'good', 'اكتمل تحليل الصيغة', 'تم تحليل كل الأجزاء التي أمكن استخراجها دون أخطاء JSON. لا يعني ذلك وحده أن كل خاصية متوافقة مع Schema.org أو أن Google سيعرض نتيجة منسقة.');
    }

    return report;
  }

  function renderReport(report) {
    results.textContent = '';
    if (report.empty) {
      addText(results, 'div', 'kjc-empty', 'الصق بيانات JSON-LD أولا لعرض تقرير الفحص.');
      return;
    }

    var validCount = report.parsed.length;
    var errorCount = report.errors.length;
    var warningCount = report.checks.filter(function (item) { return item.level === 'warn'; }).length;

    var summary = document.createElement('div');
    summary.className = 'kjc-summary';
    [
      { label: 'أجزاء تم تحليلها', value: validCount + ' / ' + report.sourceCount },
      { label: 'أخطاء صيغة JSON', value: errorCount },
      { label: 'ملاحظات للمراجعة', value: warningCount }
    ].forEach(function (item) {
      var card = document.createElement('div');
      card.className = 'kjc-summary-card';
      addText(card, 'span', 'kjc-summary-label', item.label);
      addText(card, 'span', 'kjc-summary-value', String(item.value));
      summary.appendChild(card);
    });
    results.appendChild(summary);

    addText(results, 'h3', 'kjc-section-label', 'نتيجة الفحص');
    var checkList = document.createElement('div');
    checkList.className = 'kjc-check-list';
    report.checks.forEach(function (item) {
      var card = document.createElement('article');
      card.className = 'kjc-check-item';
      var icon = addText(card, 'span', 'kjc-check-icon ' + item.level, '');
      icon.setAttribute('aria-hidden', 'true');
      var copy = document.createElement('div');
      addText(copy, 'strong', 'kjc-check-title', item.title);
      addText(copy, 'span', 'kjc-check-detail', item.detail);
      card.appendChild(copy);
      checkList.appendChild(card);
    });
    results.appendChild(checkList);

    if (report.nodes.length) {
      addText(results, 'h3', 'kjc-section-label', 'الأنواع المكتشفة');
      report.nodes.forEach(function (node) {
        var card = document.createElement('div');
        card.className = 'kjc-node-card';
        var head = document.createElement('div');
        head.className = 'kjc-node-head';
        addText(head, 'span', 'kjc-type-badge', node.type);
        addText(head, 'span', 'kjc-check-detail', 'الكائن ' + node.index);
        card.appendChild(head);
        if (node.id) addText(card, 'p', '', '@id: ' + node.id);
        else addText(card, 'p', '', 'لم يتم تحديد @id لهذا الكائن. هذا ليس خطأ بالضرورة.');
        results.appendChild(card);
      });
    }

    lastReport = createPlainReport(report);
  }

  function createPlainReport(report) {
    var lines = ['تقرير فاحص JSON-LD من KERLION', '================================'];
    if (report.empty) return lines.join('\n') + '\nلا توجد بيانات للفحص.';
    lines.push('أجزاء تم تحليلها: ' + report.parsed.length + ' / ' + report.sourceCount);
    lines.push('أخطاء صيغة JSON: ' + report.errors.length);
    lines.push('');
    report.checks.forEach(function (item) {
      var prefix = item.level === 'good' ? '[سليم]' : item.level === 'warn' ? '[ملاحظة]' : '[خطأ]';
      lines.push(prefix + ' ' + item.title);
      lines.push(item.detail);
      lines.push('');
    });
    lines.push('ملاحظة: هذا الفحص لا يمثل اختبار Google الرسمي للنتائج المنسقة.');
    return lines.join('\n');
  }

  function parseForTransform() {
    var text = source.value.trim();
    if (!text) throw new Error('الصق بيانات JSON أولا.');
    var extracted = extractJsonLd(text);
    if (extracted.length !== 1) throw new Error('تنسيق الكود بعدة وسوم script غير مدعوم في عملية التنسيق الجماعي. افحص الأجزاء أو أدخل كتلة واحدة.');
    return JSON.parse(extracted[0]);
  }

  function setSourceText(text) {
    source.value = text;
    setStatus('تم تحديث الكود. اضغط فحص البيانات لإعادة التحقق.');
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
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      helper.remove();
      setStatus(ok ? successMessage : 'تم تحديد النص لنسخه يدويا.', !ok);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        setStatus(successMessage);
      }).catch(fallback);
    } else fallback();
  }

  byId('kjcCheck').addEventListener('click', function () {
    var report = buildReport(source.value);
    renderReport(report);
    if (report.empty) {
      setStatus('أدخل بيانات JSON-LD أولا.', true);
    } else if (report.errors.length) {
      setStatus('تم الفحص لكن توجد أخطاء في صيغة JSON تحتاج إلى إصلاح.', true);
    } else {
      setStatus('اكتمل الفحص. راجع الملاحظات ثم اختبر الصفحة المنشورة بأداة Google الرسمية عند الحاجة.');
    }
  });

  byId('kjcFormat').addEventListener('click', function () {
    try {
      var parsed = parseForTransform();
      setSourceText(JSON.stringify(parsed, null, 2));
      setStatus('تم تنسيق JSON بنجاح.');
    } catch (error) {
      setStatus(error.message || 'تعذر تنسيق JSON. افحص الصيغة أولا.', true);
    }
  });

  byId('kjcMinify').addEventListener('click', function () {
    try {
      var parsed = parseForTransform();
      setSourceText(JSON.stringify(parsed));
      setStatus('تم ضغط JSON بنجاح.');
    } catch (error) {
      setStatus(error.message || 'تعذر ضغط JSON. افحص الصيغة أولا.', true);
    }
  });

  byId('kjcCopyReport').addEventListener('click', function () {
    if (!lastReport) {
      setStatus('افحص البيانات أولا لإنشاء تقرير يمكن نسخه.', true);
      return;
    }
    copyText(lastReport, 'لا يوجد تقرير لنسخه بعد.', 'تم نسخ تقرير الفحص.');
  });

  byId('kjcExample').addEventListener('click', function () {
    source.value = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "عنوان المقال",
      "description": "وصف مختصر يطابق محتوى المقال",
      "author": {
        "@type": "Person",
        "name": "اسم الكاتب"
      },
      "datePublished": "2026-10-10"
    }, null, 2);
    setStatus('تم تحميل مثال. اضغط فحص البيانات لعرض التقرير.');
    source.focus();
  });

  byId('kjcClear').addEventListener('click', function () {
    source.value = '';
    results.textContent = '';
    addText(results, 'div', 'kjc-empty', 'سيظهر تقرير الفحص هنا بعد تحليل البيانات.');
    lastReport = '';
    setStatus('تم مسح الحقول.');
    source.focus();
  });
})();
