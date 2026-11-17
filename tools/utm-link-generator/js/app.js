(function(){
"use strict";

/* ===== DOM References ===== */
var urlInput = document.getElementById('krl-utm-url');
var sourceInput = document.getElementById('krl-utm-source');
var mediumInput = document.getElementById('krl-utm-medium');
var campaignInput = document.getElementById('krl-utm-campaign');
var termInput = document.getElementById('krl-utm-term');
var contentInput = document.getElementById('krl-utm-content');
var generateBtn = document.getElementById('krl-utm-generate');
var clearBtn = document.getElementById('krl-utm-clear');
var statusEl = document.getElementById('krl-utm-status');
var resultEl = document.getElementById('krl-utm-result');
var resultUrlBox = document.getElementById('krl-utm-result-url-text');
var resultParams = document.getElementById('krl-utm-result-params');
var copyBtn = document.getElementById('krl-utm-copy');
var copyText = document.getElementById('krl-utm-copy-text');
var openBtn = document.getElementById('krl-utm-open');

var allInputs = [urlInput, sourceInput, mediumInput, campaignInput, termInput, contentInput];
var lastGeneratedUrl = '';
var hasGenerated = false;

/* ===== Event Listeners ===== */
generateBtn.addEventListener('click', function(){ doGenerate(true); });
clearBtn.addEventListener('click', doClear);
copyBtn.addEventListener('click', doCopy);
openBtn.addEventListener('click', doOpen);

for (var i = 0; i < allInputs.length; i++) {
  if (allInputs[i]) allInputs[i].addEventListener('input', onInputChange);
}

/* ===== Auto-generate on input change (silent, after first manual generate) ===== */
function onInputChange() {
  if (hasGenerated) doGenerate(false);
}

/* ===== Generate UTM Link ===== */
function doGenerate(showMessages) {
  var url = urlInput.value.trim();
  var source = sourceInput.value.trim();
  var medium = mediumInput.value.trim();
  var campaign = campaignInput.value.trim();
  var term = termInput.value.trim();
  var content = contentInput.value.trim();

  if (showMessages) hideStatus();

  /* Validate URL */
  if (!url) {
    if (showMessages) { showStatus('error', 'يرجى إدخال رابط الموقع.'); urlInput.focus(); }
    return;
  }

  /* Auto-add protocol */
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
    urlInput.value = url;
  }

  /* Validate URL format */
  var parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch (e) {
    if (showMessages) { showStatus('error', 'رابط الموقع غير صالح. يرجى التأكد من صحة الرابط والمثال: https://example.com'); urlInput.focus(); }
    return;
  }

  /* Validate required fields */
  if (!source) {
    if (showMessages) { showStatus('error', 'يرجى إدخال قيمة utm_source (مصدر الزيارة).'); sourceInput.focus(); }
    return;
  }
  if (!medium) {
    if (showMessages) { showStatus('error', 'يرجى إدخال قيمة utm_medium (نوع القناة).'); mediumInput.focus(); }
    return;
  }
  if (!campaign) {
    if (showMessages) { showStatus('error', 'يرجى إدخال قيمة utm_campaign (اسم الحملة).'); campaignInput.focus(); }
    return;
  }

  /* Build UTM URL using URL API */
  parsedUrl.searchParams.set('utm_source', source);
  parsedUrl.searchParams.set('utm_medium', medium);
  parsedUrl.searchParams.set('utm_campaign', campaign);
  if (term) parsedUrl.searchParams.set('utm_term', term);
  if (content) parsedUrl.searchParams.set('utm_content', content);

  var finalUrl = parsedUrl.toString();
  lastGeneratedUrl = finalUrl;
  hasGenerated = true;

  /* Display result */
  resultUrlBox.textContent = finalUrl;

  /* Display params as badges */
 var ph = '';
  ph += '<span class="krl-utm-result-param">utm_source=<span class="krl-utm-result-param-val">' + esc(source) + '</span></span>';
  ph += '<span class="krl-utm-result-param">utm_medium=<span class="krl-utm-result-param-val">' + esc(medium) + '</span></span>';
  ph += '<span class="krl-utm-result-param">utm_campaign=<span class="krl-utm-result-param-val">' + esc(campaign) + '</span></span>';
  if (term) ph += '<span class="krl-utm-result-param">utm_term=<span class="krl-utm-result-param-val">' + esc(term) + '</span></span>';
  if (content) ph += '<span class="krl-utm-result-param">utm_content=<span class="krl-utm-result-param-val">' + esc(content) + '</span></span>';
  resultParams.innerHTML = ph;

  resultEl.classList.add('krl-utm-result-visible');

  if (showMessages) {
    showStatus('success', 'تم إنشاء رابط UTM بنجاح. يمكنك نسخه أو فتحه مباشرة.');
  }

  /* Reset copy button text */
  copyBtn.classList.remove('copied');
  copyText.textContent = 'نسخ الرابط';
}

/* ===== Copy to Clipboard ===== */
function doCopy() {
  if (!lastGeneratedUrl) return;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(lastGeneratedUrl).then(function() {
      onCopySuccess();
    }).catch(function() {
      fallbackCopy();
    });
  } else {
    fallbackCopy();
  }
}

function fallbackCopy() {
  var ta = document.createElement('textarea');
  ta.value = lastGeneratedUrl;
  ta.style.cssText = 'position:fixed;opacity:0;left:-9999px';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    onCopySuccess();
  } catch (e) {
    showStatus('error', 'فشل نسخ الرابط. يرجى نسخه يدوياً من مربع الرابط أعلاه.');
  }
  document.body.removeChild(ta);
}

function onCopySuccess() {
  copyBtn.classList.add('copied');
  copyText.textContent = 'تم النسخ!';
  showStatus('success', 'تم نسخ الرابط بنجاح.');
  setTimeout(function() {
    copyBtn.classList.remove('copied');
    copyText.textContent = 'نسخ الرابط';
  }, 2500);
}

/* ===== Open Link ===== */
function doOpen() {
  if (lastGeneratedUrl) {
    window.open(lastGeneratedUrl, '_blank', 'noopener,noreferrer');
  }
}

/* ===== Clear All ===== */
function doClear() {
  for (var i = 0; i < allInputs.length; i++) {
    if (allInputs[i]) allInputs[i].value = '';
  }
  lastGeneratedUrl = '';
  hasGenerated = false;
  resultEl.classList.remove('krl-utm-result-visible');
  copyBtn.classList.remove('copied');
  copyText.textContent = 'نسخ الرابط';
  hideStatus();
  urlInput.focus();
}

/* ===== Status Messages ===== */
function showStatus(type, msg) {
  var icon = '';
  if (type === 'error') {
    icon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
  } else {
    icon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
  }
  statusEl.className = 'krl-utm-status krl-utm-status-visible krl-utm-status-' + type;
  statusEl.innerHTML = icon + '<span>' + msg + '</span>';
}

function hideStatus() {
  statusEl.className = 'krl-utm-status';
  statusEl.innerHTML = '';
}

/* ===== HTML Escape ===== */
function esc(str) {
  var d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

/* ===== FAQ Accordion ===== */
function initFaq() {
  var items = document.querySelectorAll('.krl-utm-faq-item');
  for (var i = 0; i < items.length; i++) {
    (function(item) {
      var q = item.querySelector('.krl-utm-faq-q');
      q.addEventListener('click', function() {
        var isOpen = item.classList.contains('krl-utm-faq-open');
        for (var j = 0; j < items.length; j++) {
          items[j].classList.remove('krl-utm-faq-open');
          items[j].querySelector('.krl-utm-faq-q').setAttribute('aria-expanded', 'false');
        }
        if (!isOpen) {
          item.classList.add('krl-utm-faq-open');
          q.setAttribute('aria-expanded', 'true');
        }
      });
      q.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); q.click(); }
      });
    })(items[i]);
  }
}

/* ===== Examples Toggle ===== */
function initExamples() {
  var toggle = document.getElementById('krl-utm-examples-toggle');
  var container = document.getElementById('krl-utm-examples');
  if (!toggle || !container) return;
  toggle.addEventListener('click', function() {
    var isOpen = container.classList.contains('krl-utm-examples-open');
    container.classList.toggle('krl-utm-examples-open');
    toggle.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
  });
  toggle.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle.click(); }
  });
}

/* ===== Init ===== */
function init() {
  initFaq();
  initExamples();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

})();