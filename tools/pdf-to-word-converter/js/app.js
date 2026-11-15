(function(){
"use strict";

/* ── Constants ── */
var MAX_SIZE=50*1024*1024;
var PDF_MIME="application/pdf";

/* ── DOM References ── */
var app=document.getElementById("kerlionPdfWordConverter");
if(!app)return;

var dropZone=app.querySelector(".krl-pdfword-drop-zone");
var fileInput=app.querySelector(".krl-pdfword-file-input");
var errorBox=app.querySelector(".krl-pdfword-error-msg");
var errorText=app.querySelector(".krl-pdfword-error-text");
var fileInfoBox=app.querySelector(".krl-pdfword-file-info");
var fileNameEl=app.querySelector(".krl-pdfword-filename");
var fileSizeEl=app.querySelector(".krl-pdfword-filesize");
var removeBtn=app.querySelector(".krl-pdfword-remove-btn");
var convertSection=app.querySelector(".krl-pdfword-convert-section");
var convertBtn=app.querySelector(".krl-pdfword-convert-btn");
var progressSection=app.querySelector(".krl-pdfword-progress-section");
var progressPct=app.querySelector(".krl-pdfword-progress-pct");
var progressFill=app.querySelector(".krl-pdfword-progress-fill");
var progressBar=app.querySelector(".krl-pdfword-progress-bar");
var progressMsg=app.querySelector(".krl-pdfword-progress-msg");
var successSection=app.querySelector(".krl-pdfword-success-section");
var downloadBtn=app.querySelector(".krl-pdfword-download-btn");
var againBtn=app.querySelector(".krl-pdfword-again-btn");
var outputNameEl=app.querySelector(".krl-pdfword-output-name");
var retrySection=app.querySelector(".krl-pdfword-retry-section");
var retryBtn=app.querySelector(".krl-pdfword-retry-btn");

/* ── State ── */
var selectedFile=null;
var downloadUrl=null;
var isConverting=false;

/* ── Helpers ── */
function fmtSize(b){
  if(b<1024)return b+" بايت";
  if(b<1048576)return(b/1024).toFixed(1)+" كيلوبايت";
  return(b/1048576).toFixed(2)+" ميجابايت";
}
function stripExt(n){var i=n.lastIndexOf(".");return i>0?n.substring(0,i):n;}
function show(el){el.classList.add("krl-pdfword-visible");}
function hide(el){el.classList.remove("krl-pdfword-visible");}
function setProgress(pct,msg){
  progressPct.textContent=pct+"%";
  progressFill.style.width=pct+"%";
  progressBar.setAttribute("aria-valuenow",pct);
  progressMsg.textContent=msg||"";
}
function showError(msg){errorText.textContent=msg;show(errorBox);}
function hideError(){hide(errorBox);errorText.textContent="";}
function downloadBlob(blob,name){
  var url=URL.createObjectURL(blob);
  var a=document.createElement("a");
  a.href=url;a.download=name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function(){URL.revokeObjectURL(url);},3000);
}
function loadScript(src){
  return new Promise(function(resolve,reject){
    var s=document.createElement("script");
    s.src=src;s.onload=resolve;s.onerror=reject;
    document.head.appendChild(s);
  });
}

/* ── Validation ── */
function validate(f){
  if(!f)return"لم يتم اختيار ملف.";
  if(f.type!==PDF_MIME&&!f.name.toLowerCase().endsWith(".pdf"))
    return"الملف المحدد ليس ملف PDF. يرجى اختيار ملف بصيغة PDF.";
  if(f.size===0)return"الملف المحدد فارغ.";
  if(f.size>MAX_SIZE)return"حجم الملف يتجاوز الحد المسموح ("+fmtSize(MAX_SIZE)+").";
  return null;
}

/* ── File Handling ── */
function pickFile(f){
  var err=validate(f);
  if(err){showError(err);resetFile();return;}
  hideError();
  selectedFile=f;
  fileNameEl.textContent=f.name;
  fileNameEl.title=f.name;
  fileSizeEl.textContent=fmtSize(f.size);
  show(fileInfoBox);
  show(convertSection);
  hide(successSection);hide(retrySection);hide(progressSection);
  cleanDownloadUrl();
}

function resetFile(){
  selectedFile=null;
  hide(fileInfoBox);hide(convertSection);hide(progressSection);
  hide(successSection);hide(retrySection);hideError();
  setProgress(0,"");
  cleanDownloadUrl();
  fileInput.value="";
}

function cleanDownloadUrl(){
  if(downloadUrl){URL.revokeObjectURL(downloadUrl);downloadUrl=null;}
}

/* ── UI State ── */
function setUiState(state){
  hide(errorBox);hide(fileInfoBox);hide(convertSection);
  hide(progressSection);hide(successSection);hide(retrySection);
  switch(state){
    case"idle":break;
    case"selected":show(fileInfoBox);show(convertSection);break;
    case"converting":show(fileInfoBox);show(progressSection);break;
    case"success":show(fileInfoBox);show(successSection);break;
    case"error":show(fileInfoBox);show(retrySection);break;
  }
}

/* ── Conversion ── */
async function doConvert(){
  if(!selectedFile||isConverting)return;
  isConverting=true;
  setUiState("converting");
  hideError();
  setProgress(0,"جاري تحميل مكتبة المعالجة...");

  try{
    /* Load pdf.js */
    await loadScript("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js");
    window.pdfjsLib.GlobalWorkerOptions.workerSrc=
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

    setProgress(5,"جاري قراءة ملف PDF...");
    var buf=await selectedFile.arrayBuffer();
    var pdf=await window.pdfjsLib.getDocument({data:new Uint8Array(buf)}).promise;
    var total=pdf.numPages;
    if(total===0)throw new Error("ملف PDF لا يحتوي على أي صفحات.");

    setProgress(10,"جاري استخراج النصوص... (0 من "+total+")");

    var pagesText=[];
    for(var i=1;i<=total;i++){
      var page=await pdf.getPage(i);
      var tc=await page.getTextContent();
      var items=[];
      for(var j=0;j<tc.items.length;j++){
        var it=tc.items[j];
        if(it.str&&it.str.trim().length>0){
          items.push({text:it.str,x:it.transform[4],y:it.transform[5],w:it.width});
        }
      }
      items.sort(function(a,b){
        var dy=b.y-a.y;
        if(Math.abs(dy)>3)return dy;
        return a.x-b.x;
      });
      var lines=[];var curLine=[];var lastY=undefined;
      for(var k=0;k<items.length;k++){
        var ci=items[k];
        if(lastY!==undefined&&Math.abs(ci.y-lastY)>3){
          if(curLine.length){lines.push(curLine.join(" "));curLine=[];}
        }
        curLine.push(ci.text);
        lastY=ci.y;
      }
      if(curLine.length)lines.push(curLine.join(" "));
      pagesText.push(lines.join("\n"));
      var pct=10+Math.floor((i/total)*65);
      setProgress(pct,"جاري استخراج النصوص... ("+i+" من "+total+")");
    }

    setProgress(80,"جاري إنشاء ملف Word...");

    /* Load docx */
    await loadScript("https://unpkg.com/docx@8.5.0/build/index.umd.js");

    var DX=window.docx;
    var children=[];
    for(var p=0;p<pagesText.length;p++){
      var pLines=pagesText[p].split("\n");
      for(var l=0;l<pLines.length;l++){
        if(pLines[l].trim()){
          children.push(new DX.Paragraph({
            alignment:DX.AlignmentType.RIGHT,
            bidirectional:true,
            spacing:{after:120},
            children:[new DX.TextRun({text:pLines[l],size:24,font:"Cairo"})]
          }));
        }else{
          children.push(new DX.Paragraph({spacing:{after:120},children:[]}));
        }
      }
      if(p<pagesText.length-1){
        children.push(new DX.Paragraph({children:[new DX.PageBreak()]}));
      }
    }
    if(children.length===0){
      children.push(new DX.Paragraph({
        alignment:DX.AlignmentType.CENTER,
        children:[new DX.TextRun({text:"لم يتم العثور على نص قابل للاستخراج في هذا الملف.",size:24})]
      }));
    }

    var doc=new DX.Document({
      sections:[{properties:{bidi:true},children:children}]
    });

    setProgress(92,"جاري تجهيز ملف التنزيل...");
    var blob=await DX.Packer.toBlob(doc);
    var outName=stripExt(selectedFile.name)+".docx";

    downloadUrl=URL.createObjectURL(blob);
    downloadBtn.setAttribute("aria-label","تنزيل "+outName);
    outputNameEl.textContent=outName;

    setProgress(100,"");
    setUiState("success");

  }catch(err){
    var msg="حدث خطأ غير متوقع أثناء التحويل. يرجى المحاولة مرة أخرى.";
    if(err&&err.message){
      var m=err.message.toLowerCase();
      if(m.indexOf("invalid pdf")>-1||m.indexOf("bad pdf")>-1)
        msg="ملف PDF تالف أو غير صالح. يرجى التأكد من الملف والمحاولة مرة أخرى.";
      else if(m.indexOf("password")>-1)
        msg="ملف PDF محمي بكلمة مرور ولا يمكن معالجته. يرجى إزالة الحماية أولاً.";
      else if(m.indexOf("empty")>-1||m.indexOf("no pages")>-1)
        msg="ملف PDF فارغ أو لا يحتوي على صفحات.";
      else if(m.indexOf("worker")>-1)
        msg="حدث خطأ في تحميل معالج PDF. يرجى تحديث المتصفح والمحاولة مرة أخرى.";
      else if(m.indexOf("failed to fetch")>-1||m.indexOf("networkError")>-1)
        msg="خطأ في الاتصال بالإنترنت أثناء تحميل مكتبة المعالجة. تأكد من اتصالك وحاول مرة أخرى.";
      else msg="حدث خطأ: "+err.message;
    }
    showError(msg);
    setUiState("error");
    setProgress(0,"");
  }finally{
    isConverting=false;
  }
}

/* ── Download Handler ── */
function doDownload(){
  if(!downloadUrl||!selectedFile)return;
  var name=stripExt(selectedFile.name)+".docx";
  var a=document.createElement("a");
  a.href=downloadUrl;a.download=name;
  document.body.appendChild(a);a.click();
  document.body.removeChild(a);
}

/* ── Event Listeners ── */

/* Click to upload */
dropZone.addEventListener("click",function(){
  if(!isConverting)fileInput.click();
});

/* Keyboard accessibility */
dropZone.addEventListener("keydown",function(e){
  if((e.key==="Enter"||e.key===" ")&&!isConverting){
    e.preventDefault();fileInput.click();
  }
});

/* File input change */
fileInput.addEventListener("change",function(){
  if(this.files&&this.files[0])pickFile(this.files[0]);
});

/* Drag & Drop */
dropZone.addEventListener("dragover",function(e){
  e.preventDefault();e.stopPropagation();
  if(!isConverting)dropZone.classList.add("krl-pdfword-dragover");
});
dropZone.addEventListener("dragleave",function(e){
  e.preventDefault();e.stopPropagation();
  dropZone.classList.remove("krl-pdfword-dragover");
});
dropZone.addEventListener("drop",function(e){
  e.preventDefault();e.stopPropagation();
  dropZone.classList.remove("krl-pdfword-dragover");
  if(!isConverting&&e.dataTransfer.files&&e.dataTransfer.files[0])
    pickFile(e.dataTransfer.files[0]);
});

/* Remove file */
removeBtn.addEventListener("click",function(e){
  e.stopPropagation();resetFile();
});

/* Convert */
convertBtn.addEventListener("click",doConvert);

/* Download */
downloadBtn.addEventListener("click",doDownload);

/* Convert another */
againBtn.addEventListener("click",resetFile);

/* Retry */
retryBtn.addEventListener("click",function(){
  hideError();
  setUiState(selectedFile?"selected":"idle");
});

/* Prevent default drag on body inside widget */
app.addEventListener("dragover",function(e){e.preventDefault();});
app.addEventListener("drop",function(ev){ev.preventDefault();});

/* ── FAQ Accordion ── */
var faqItems=app.querySelectorAll(".krl-pdfword-faq-item");
for(var fi=0;fi<faqItems.length;fi++){
  (function(item){
    var qEl=item.querySelector(".krl-pdfword-faq-q");
    function toggleFaq(){
      var wasOpen=item.classList.contains("krl-pdfword-faq-open");
      for(var j=0;j<faqItems.length;j++){
        faqItems[j].classList.remove("krl-pdfword-faq-open");
        faqItems[j].querySelector(".krl-pdfword-faq-q").setAttribute("aria-expanded","false");
      }
      if(!wasOpen){
        item.classList.add("krl-pdfword-faq-open");
        qEl.setAttribute("aria-expanded","true");
      }
    }
    qEl.addEventListener("click",toggleFaq);
    qEl.addEventListener("keydown",function(e){
      if(e.key==="Enter"||e.key===" "){e.preventDefault();toggleFaq();}
    });
  })(faqItems[fi]);
}

})();