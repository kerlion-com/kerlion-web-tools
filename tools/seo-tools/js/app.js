(function(){
"use strict";
var root = document.getElementById('kerlionSeoTools');
if (!root) return;

/* ===== مصفوفة أنواع Sitemap (يمكن إضافة أي نوع جديد بسهولة) ===== */
var SITEMAP_PATTERNS = [
  'sitemap.xml',
  'sitemap.xml?page=1',
  'sitemap.xml?page=2',
  'sitemap.xml?page=3',
  'sitemap_index.xml',
  'sitemap-index.xml',
  'sitemap.php',
  'sitemap.txt',
  'sitemap.xml.gz',
  'atom.xml',
  'atom.xml?redirect=false&start-index=1&max-results=500',
  'atom.xml?redirect=false&start-index=501&max-results=500',
  'rss.xml',
  'feed.xml',
  'feeds/posts/default',
  'feeds/posts/default?alt=rss',
  'feeds/posts/default?alt=atom',
  'feeds/posts/default?start-index=1&max-results=500',
  'sitemap-pages.xml',
  'sitemap-posts.xml',
  'sitemap-categories.xml',
  'sitemap-tags.xml',
  'news-sitemap.xml',
  'image-sitemap.xml',
  'video-sitemap.xml'
];

var STORAGE_KEY = 'kerlion_seo_last_url';

/* ===== عناصر DOM ===== */
var urlInput = root.querySelector('#tool-url-input');
var errorEl = root.querySelector('#tool-error');
var cleanInfoEl = root.querySelector('#tool-clean-info');
var toastEl = root.querySelector('#tool-toast');
var toastTimer = null;

/* استرجاع آخر موقع */
try{
  var saved = localStorage.getItem(STORAGE_KEY);
  if(saved){ urlInput.value = saved; }
}catch(e){}

/* ===== أدوات مساعدة ===== */
function cleanUrl(input){
  if(!input || typeof input !== 'string') return '';
  var url = input.trim();
  url = url.replace(/^https?:\/\//i,'');
  url = url.replace(/^www\./i,'');
  url = url.replace(/\/+$/,'');
  url = url.replace(/\s+/g,'');
  return url;
}

function isValidDomain(input){
  var cleaned = cleanUrl(input);
  if(!cleaned) return false;
  var host = cleaned.split('/')[0].split('?')[0];
  var domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9.-]{0,253}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
  return domainRegex.test(host);
}

function showError(msg){ errorEl.textContent = msg; errorEl.classList.add('show'); }
function hideError(){ errorEl.classList.remove('show'); }

function showToast(msg){
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  if(toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(function(){ toastEl.classList.remove('show'); }, 2500);
}

function getBaseUrl(){
  var raw = urlInput.value.trim();
  if(!raw){ showError('الرجاء إدخال رابط الموقع أولاً'); urlInput.focus(); return null; }
  if(!isValidDomain(raw)){ showError('الرابط غير صالح. مثال صحيح: example.com'); urlInput.focus(); return null; }
  hideError();
  var cleaned = cleanUrl(raw);
  var baseUrl = 'https://' + cleaned;
  try{ localStorage.setItem(STORAGE_KEY, cleaned); }catch(e){}
  cleanInfoEl.innerHTML = 'الرابط بعد التنظيف: <b>' + baseUrl + '</b>';
  cleanInfoEl.classList.add('show');
  return baseUrl;
}

function copyToClipboard(text){
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(text).catch(function(){ fallbackCopy(text); });
  } else { fallbackCopy(text); }
}

function fallbackCopy(text){
  var ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.top = '-9999px';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); } catch(e){}
  document.body.removeChild(ta);
}

function downloadText(filename, content){
  var blob = new Blob([content], {type:'text/plain;charset=utf-8'});
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
}

function markCopied(btn){
  var original = btn.textContent;
  btn.classList.add('copied');
  btn.textContent = '✓ تم النسخ';
  setTimeout(function(){ btn.classList.remove('copied'); btn.textContent = original; }, 1500);
}

/* ===== التبويبات ===== */
function switchTab(tabName){
  var tabs = root.querySelectorAll('.tool-tab');
  var panels = root.querySelectorAll('.tool-panel');
  for(var i=0;i<tabs.length;i++){
    if(tabs[i].getAttribute('data-tab') === tabName) tabs[i].classList.add('active');
    else tabs[i].classList.remove('active');
  }
  for(var j=0;j<panels.length;j++){
    if(panels[j].id === 'tool-panel-' + tabName) panels[j].classList.add('active');
    else panels[j].classList.remove('active');
  }
}

root.querySelectorAll('.tool-tab').forEach ? root.querySelectorAll('.tool-tab').forEach(function(tab){
  tab.addEventListener('click', function(){
    switchTab(tab.getAttribute('data-tab'));
  });
}) : (function(){
  var tabs = root.querySelectorAll('.tool-tab');
  for(var i=0;i<tabs.length;i++){
    tabs[i].addEventListener('click', function(){
      switchTab(this.getAttribute('data-tab'));
    });
  }
})();

/* ===== تفعيل الأسئلة الشائعة (FAQ) ===== */
(function(){
  var faqItems = root.querySelectorAll('.tool-faq-item');
  for(var i=0;i<faqItems.length;i++){
    var q = faqItems[i].querySelector('.tool-faq-q');
    if(q){
      q.addEventListener('click', function(){
        var item = this.parentNode;
        var isOpen = item.classList.contains('open');
        /* إغلاق كل الأسئلة الأخرى في نفس القسم */
        var siblings = item.parentNode.querySelectorAll('.tool-faq-item.open');
        for(var j=0;j<siblings.length;j++){ siblings[j].classList.remove('open'); }
        /* فتح/إغلاق السؤال الحالي */
        if(!isOpen) item.classList.add('open');
      });
    }
  }
})();

/* ===== 1) توليد روابط Sitemap ===== */
var sitemapList = root.querySelector('#tool-sitemap-list');
var copyAllSitemapBtn = root.querySelector('#tool-copyall-sitemap');
var dlSitemapBtn = root.querySelector('#tool-dl-sitemap');
var sitemapUrls = [];

function generateSitemap(){
  var baseUrl = getBaseUrl();
  if(!baseUrl) return;

  sitemapUrls = [];
  var seen = {};
  for(var i=0;i<SITEMAP_PATTERNS.length;i++){
    var fullUrl = baseUrl + '/' + SITEMAP_PATTERNS[i];
    if(!seen[fullUrl]){ seen[fullUrl] = true; sitemapUrls.push(fullUrl); }
  }

  sitemapList.innerHTML = '';
  for(var j=0;j<sitemapUrls.length;j++){
    var item = document.createElement('div');
    item.className = 'tool-sitemap-item';

    var num = document.createElement('span');
    num.className = 'tool-sitemap-num';
    num.textContent = String(j+1);

    var url = document.createElement('div');
    url.className = 'tool-sitemap-url';
    url.textContent = sitemapUrls[j];

    var copyBtn = document.createElement('button');
    copyBtn.className = 'tool-sitemap-copy';
    copyBtn.setAttribute('type','button');
    copyBtn.textContent = 'نسخ';
    (function(u, b){
      b.addEventListener('click', function(){
        copyToClipboard(u);
        showToast('تم نسخ الرابط');
        var original = b.textContent;
        b.classList.add('copied');
        b.textContent = '✓';
        setTimeout(function(){ b.classList.remove('copied'); b.textContent = original; }, 1200);
      });
    })(sitemapUrls[j], copyBtn);

    item.appendChild(num);
    item.appendChild(url);
    item.appendChild(copyBtn);
    sitemapList.appendChild(item);
  }

  sitemapList.style.display = 'flex';
  copyAllSitemapBtn.style.display = 'inline-flex';
  dlSitemapBtn.style.display = 'inline-flex';
  showToast('تم توليد ' + sitemapUrls.length + ' رابط جاهز للنسخ');
}

root.querySelector('#tool-gen-sitemap').addEventListener('click', generateSitemap);
copyAllSitemapBtn.addEventListener('click', function(){
  if(sitemapUrls.length === 0){ showToast('لا توجد روابط'); return; }
  copyToClipboard(sitemapUrls.join('\n'));
  showToast('تم نسخ ' + sitemapUrls.length + ' رابط');
});
dlSitemapBtn.addEventListener('click', function(){
  if(sitemapUrls.length === 0){ showToast('لا توجد روابط'); return; }
  downloadText('sitemaps.txt', sitemapUrls.join('\n'));
  showToast('تم تنزيل الملف');
});

/* ===== 2) توليد ملف robots.txt ===== */
function generateRobots(){
  var baseUrl = getBaseUrl();
  if(!baseUrl) return;
  var content = '';
  content += 'User-agent: Mediapartners-Google\n';
  content += 'Disallow: \n\n';
  content += 'User-agent: *\n';
  content += 'Disallow: /search\n';
  content += 'Allow: /\n\n';
  content += 'Sitemap: ' + baseUrl + '/sitemap.xml\n';
  root.querySelector('#tool-box-robots').value = content;
  root.querySelector('#tool-result-robots').classList.add('show');
  showToast('تم توليد ملف robots.txt');
}
root.querySelector('#tool-gen-robots').addEventListener('click', generateRobots);
root.querySelector('#tool-copy-robots').addEventListener('click', function(){
  var v = root.querySelector('#tool-box-robots').value;
  if(!v){ showToast('لا يوجد محتوى'); return; }
  copyToClipboard(v);
  showToast('تم نسخ الملف');
  markCopied(this);
});
root.querySelector('#tool-dl-robots').addEventListener('click', function(){
  var v = root.querySelector('#tool-box-robots').value;
  if(!v){ showToast('لا يوجد محتوى'); return; }
  downloadText('robots.txt', v);
  showToast('تم تنزيل الملف');
});

/* ===== 3) توليد ملف ads.txt ===== */
function generateAds(){
  var baseUrl = getBaseUrl();
  if(!baseUrl) return;
  var pubId = root.querySelector('#tool-pub-id').value.trim();
  if(!pubId){
    pubId = 'pub-0000000000000000';
    showToast('لم تدخل معرّف الناشر — تم توليد قالب افتراضي');
  } else if(pubId.indexOf('pub-') !== 0){
    pubId = 'pub-' + pubId.replace(/^pub-/i,'');
  }
  var content = 'google.com, ' + pubId + ', DIRECT, f08c47fec0942fa0\n';
  root.querySelector('#tool-box-ads').value = content;
  root.querySelector('#tool-result-ads').classList.add('show');
  if(pubId !== 'pub-0000000000000000') showToast('تم توليد ملف ads.txt');
}
root.querySelector('#tool-gen-ads').addEventListener('click', generateAds);
root.querySelector('#tool-copy-ads').addEventListener('click', function(){
  var v = root.querySelector('#tool-box-ads').value;
  if(!v){ showToast('لا يوجد محتوى'); return; }
  copyToClipboard(v);
  showToast('تم نسخ الملف');
  markCopied(this);
});
root.querySelector('#tool-dl-ads').addEventListener('click', function(){
  var v = root.querySelector('#tool-box-ads').value;
  if(!v){ showToast('لا يوجد محتوى'); return; }
  downloadText('ads.txt', v);
  showToast('تم تنزيل الملف');
});

/* ===== 4) توليد ميتا تاج ===== */
function generateMeta(){
  var baseUrl = getBaseUrl();
  if(!baseUrl) return;
  var title = root.querySelector('#tool-meta-title').value.trim() || 'موقعي الإلكتروني';
  var desc = root.querySelector('#tool-meta-desc').value.trim() || 'وصف موقعك الإلكتروني يظهر هنا في محركات البحث وعلى منصات التواصل';
  var image = root.querySelector('#tool-meta-image').value.trim() || (baseUrl + '/favicon.ico');

  var c = '';
  c += '<!-- ===== Meta Tags SEO ===== -->\n';
  c += '<meta charset="UTF-8">\n';
  c += '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n';
  c += '<meta name="description" content="' + escapeAttr(desc) + '">\n';
  c += '<meta name="keywords" content="">\n';
  c += '<meta name="author" content="' + escapeAttr(title) + '">\n';
  c += '<meta name="robots" content="index, follow">\n';
  c += '<link rel="canonical" href="' + escapeAttr(baseUrl) + '/">\n';
  c += '\n<!-- ===== Open Graph / Facebook ===== -->\n';
  c += '<meta property="og:type" content="website">\n';
  c += '<meta property="og:url" content="' + escapeAttr(baseUrl) + '/">\n';
  c += '<meta property="og:title" content="' + escapeAttr(title) + '">\n';
  c += '<meta property="og:description" content="' + escapeAttr(desc) + '">\n';
  c += '<meta property="og:image" content="' + escapeAttr(image) + '">\n';
  c += '<meta property="og:site_name" content="' + escapeAttr(title) + '">\n';
  c += '<meta property="og:locale" content="ar_AR">\n';
  c += '\n<!-- ===== Twitter Card ===== -->\n';
  c += '<meta name="twitter:card" content="summary_large_image">\n';
  c += '<meta name="twitter:url" content="' + escapeAttr(baseUrl) + '/">\n';
  c += '<meta name="twitter:title" content="' + escapeAttr(title) + '">\n';
  c += '<meta name="twitter:description" content="' + escapeAttr(desc) + '">\n';
  c += '<meta name="twitter:image" content="' + escapeAttr(image) + '">\n';

  root.querySelector('#tool-box-meta').value = c;
  root.querySelector('#tool-result-meta').classList.add('show');
  showToast('تم توليد أكواد الميتا تاج');
}

function escapeAttr(s){
  return String(s).replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

root.querySelector('#tool-gen-meta').addEventListener('click', generateMeta);
root.querySelector('#tool-copy-meta').addEventListener('click', function(){
  var v = root.querySelector('#tool-box-meta').value;
  if(!v){ showToast('لا يوجد محتوى'); return; }
  copyToClipboard(v);
  showToast('تم نسخ الأكواد');
  markCopied(this);
});
root.querySelector('#tool-dl-meta').addEventListener('click', function(){
  var v = root.querySelector('#tool-box-meta').value;
  if(!v){ showToast('لا يوجد محتوى'); return; }
  downloadText('meta-tags.txt', v);
  showToast('تم تنزيل الملف');
});

})();