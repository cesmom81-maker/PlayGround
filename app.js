/* Mendsway Tech Inventory — offline-first PWA with Google backup */
(function(){
"use strict";
const BACKUP_EMAIL = "cesmom81@googlemail.com";
const DRIVE_FILENAME = "mendsway-tech-backup.json";
const DB_NAME = "mendsway-tech-db", STORE = "jobs", META = "meta";
const LS_KEYS = { clientId:"mt_g_client_id", auto:"mt_auto_drive", lastBackup:"mt_last_backup", driveFileId:"mt_drive_file_id" };

const $ = (s)=>document.querySelector(s);
const rowsEl=$("#rows"), cardsEl=$("#cards"), emptyEl=$("#emptyState");
const searchEl=$("#search"), statusFilter=$("#statusFilter"), sortBy=$("#sortBy");
const intakeModal=$("#intakeModal"), detailModal=$("#detailModal"), backupModal=$("#backupModal");
const form=$("#intakeForm");
let allJobs=[], draftPhotos=[], stream=null, deferredPrompt=null, tokenClient=null, gToken=null;

/* ---------- toast ---------- */
let toastT=null;
function toast(msg){ const t=$("#toast"); t.textContent=msg; t.classList.add("show"); clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove("show"),2800); }

/* ---------- IndexedDB ---------- */
function db(){ return new Promise((res,rej)=>{ const r=indexedDB.open(DB_NAME,1);
  r.onupgradeneeded=()=>{ const d=r.result; if(!d.objectStoreNames.contains(STORE)) d.createObjectStore(STORE,{keyPath:"id"}); if(!d.objectStoreNames.contains(META)) d.createObjectStore(META); };
  r.onsuccess=()=>res(r.result); r.onerror=()=>rej(r.error); }); }
async function tx(mode,fn){ const d=await db(); return new Promise((res,rej)=>{ const t=d.transaction([STORE],mode); const s=t.objectStore(STORE); const out=fn(s); t.oncomplete=()=>res(out&&out.result!==undefined?out.result:out); t.onerror=()=>rej(t.error); }); }
async function getAll(){ const d=await db(); return new Promise((res,rej)=>{ const t=d.transaction([STORE],"readonly"); const q=t.objectStore(STORE).getAll(); q.onsuccess=()=>res(q.result||[]); q.onerror=()=>rej(q.error); }); }
async function putJob(j){ const d=await db(); return new Promise((res,rej)=>{ const t=d.transaction([STORE],"readwrite"); t.objectStore(STORE).put(j); t.oncomplete=res; t.onerror=()=>rej(t.error); }); }
async function delJob(id){ const d=await db(); return new Promise((res,rej)=>{ const t=d.transaction([STORE],"readwrite"); t.objectStore(STORE).delete(id); t.oncomplete=res; t.onerror=()=>rej(t.error); }); }
async function clearAll(jobs){ const d=await db(); return new Promise((res,rej)=>{ const t=d.transaction([STORE],"readwrite"); const s=t.objectStore(STORE); s.clear(); jobs.forEach(j=>s.put(j)); t.oncomplete=res; t.onerror=()=>rej(t.error); }); }

/* ---------- helpers ---------- */
const uid=()=> "job_"+Date.now().toString(36)+"_"+Math.random().toString(36).slice(2,7);
const esc=(s)=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const gbp=(n)=>"£"+(Number(n||0).toFixed(2));
const todayISO=()=>new Date().toISOString().slice(0,10);
function fmtDate(d){ if(!d) return "—"; try{ return new Date(d+"T12:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"});}catch{ return d; } }

/* compress image file -> dataURL jpeg max 1024px */
function fileToPhoto(file){ return new Promise((res,rej)=>{
  const rd=new FileReader();
  rd.onload=()=>{ const img=new Image();
    img.onload=()=>{ const max=1024; let {width:w,height:h}=img; const sc=Math.min(1,max/Math.max(w,h)); w=Math.round(w*sc); h=Math.round(h*sc);
      const c=document.createElement("canvas"); c.width=w; c.height=h; c.getContext("2d").drawImage(img,0,0,w,h);
      res(c.toDataURL("image/jpeg",0.72)); };
    img.onerror=rej; img.src=rd.result; };
  rd.onerror=rej; rd.readAsDataURL(file); }); }

/* ---------- render ---------- */
function filtered(){
  const q=(searchEl.value||"").toLowerCase(), st=statusFilter.value, sort=sortBy.value;
  let list=allJobs.filter(j=>{
    const hay=[j.customerName,j.contactPhone,j.contactEmail,j.brand,j.model,j.imei,j.issue,j.status].join(" ").toLowerCase();
    return (!q||hay.includes(q))&&(!st||j.status===st); });
  list.sort((a,b)=> sort==="oldest"? (a.createdAt-b.createdAt) : sort==="name"? String(a.customerName).localeCompare(String(b.customerName)) : sort==="status"? String(a.status).localeCompare(String(b.status)) : (b.createdAt-a.createdAt));
  return list;
}
function render(){
  const list=filtered();
  emptyEl.hidden = allJobs.length!==0;
  // stats
  $("#stTotal").textContent=allJobs.length;
  $("#stInShop").textContent=allJobs.filter(j=>["Received","In Repair","Waiting Parts"].includes(j.status)).length;
  $("#stReady").textContent=allJobs.filter(j=>j.status==="Ready").length;
  $("#stCollected").textContent=allJobs.filter(j=>j.status==="Collected").length;
  $("#stRevenue").textContent=gbp(allJobs.filter(j=>j.status!=="Cancelled").reduce((s,j)=>s+Number(j.fee||0),0));
  // table
  rowsEl.innerHTML=list.map(j=>`<tr data-id="${j.id}">
    <td>${j.photos&&j.photos[0]?`<img class="thumb" src="${j.photos[0]}" alt="phone photo" loading="lazy"/>`:`<span class="thumb-ph">📱</span>`}</td>
    <td><strong>${esc(j.customerName||"—")}</strong></td>
    <td>${esc(j.contactPhone||"—")}<br/><span class="muted">${esc(j.contactEmail||"")}</span></td>
    <td>${esc([j.brand,j.model].filter(Boolean).join(" ")||"—")}<br/><span class="muted">${esc(j.imei||"")}</span></td>
    <td>${esc((j.issue||"").slice(0,60))}${(j.issue||"").length>60?"…":""}</td>
    <td><span class="pill ${esc(j.status)}">${esc(j.status)}</span></td>
    <td class="muted">In: ${esc(fmtDate(j.dateIn))}<br/>Out: ${esc(fmtDate(j.dateOut))}</td>
    <td><strong>${gbp(j.fee)}</strong></td>
    <td><div class="row-actions"><button class="btn small" data-act="view">Open</button><button class="btn small" data-act="edit">Edit</button></div></td>
  </tr>`).join("");
  // cards (mobile)
  cardsEl.innerHTML=list.map(j=>`<div class="card" data-id="${j.id}">
    ${j.photos&&j.photos[0]?`<img src="${j.photos[0]}" alt="phone"/>`:`<span class="thumb-ph">📱</span>`}
    <div class="c-main"><div class="c-name">${esc(j.customerName||"Unnamed")}</div>
    <div class="c-sub">${esc([j.brand,j.model].filter(Boolean).join(" ")||"No device")} • ${esc(j.contactPhone||"no contact")}</div>
    <div style="margin-top:6px"><span class="pill ${esc(j.status)}">${esc(j.status)}</span></div></div>
    <button class="btn small" data-act="view">Open</button></div>`).join("");
  updateBackupDot();
}
document.addEventListener("click",(e)=>{
  const tr=e.target.closest("[data-id]"); const act=e.target.closest("[data-act]");
  if(tr&&act){ e.stopPropagation(); const job=allJobs.find(j=>j.id===tr.dataset.id); if(!job) return;
    if(act.dataset.act==="edit") openForm(job); else openDetail(job); return; }
  if(tr&&!act){ const job=allJobs.find(j=>j.id===tr.dataset.id); if(job) openDetail(job); }
});

/* ---------- intake form ---------- */
function openForm(job){
  form.reset(); draftPhotos=[]; renderDraftPhotos(); stopCam();
  $("#formTitle").textContent=job?"Edit intake":"New intake";
  $("#fId").value=job?job.id:"";
  $("#fName").value=job?job.customerName||"":"";
  $("#fPhone").value=job?job.contactPhone||"":"";
  $("#fEmail").value=job?job.contactEmail||"":"";
  $("#fStatus").value=job?job.status||"Received":"Received";
  $("#fBrand").value=job?job.brand||"":"";
  $("#fModel").value=job?job.model||"":"";
  $("#fColor").value=job?job.color||"":"";
  $("#fImei").value=job?job.imei||"":"";
  $("#fPass").value=job?job.passcode||"":"";
  $("#fIssue").value=job?job.issue||"":"";
  $("#fDateIn").value=job?(job.dateIn||todayISO()):todayISO();
  $("#fDateOut").value=job?job.dateOut||"":"";
  $("#fFee").value=job?(job.fee??""):"";
  $("#fDeposit").value=job?(job.deposit??""):"";
  $("#fAcc").value=job?job.accessories||"":"";
  $("#fNotes").value=job?job.notes||"":"";
  if(job&&job.photos) draftPhotos=[...job.photos];
  renderDraftPhotos();
  show(intakeModal); $("#fName").focus();
}
function renderDraftPhotos(){
  const w=$("#photoPrev"); w.innerHTML="";
  draftPhotos.forEach((src,i)=>{ const f=document.createElement("figure");
    f.innerHTML=`<img src="${src}" alt="attached phone photo"/><button type="button" aria-label="remove photo">✕</button>`;
    f.querySelector("button").onclick=()=>{ draftPhotos.splice(i,1); renderDraftPhotos(); };
    w.appendChild(f); });
  if(!draftPhotos.length) w.innerHTML=`<p class="muted" style="grid-column:1/-1">No photos yet — take one with the camera or upload.</p>`;
}
async function addFiles(files){
  for(const f of [...files].slice(0,8-draftPhotos.length)){
    if(!f.type.startsWith("image/")) continue;
    try{ draftPhotos.push(await fileToPhoto(f)); }catch{ toast("Could not read one image"); }
  }
  renderDraftPhotos();
}
$("#fileCamera").addEventListener("change",e=>{ addFiles(e.target.files); e.target.value=""; });
$("#fileUpload").addEventListener("change",e=>{ addFiles(e.target.files); e.target.value=""; });

/* live camera */
$("#liveCamBtn").addEventListener("click",async()=>{
  try{
    stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"},audio:false});
    const v=$("#liveCam"); v.srcObject=stream; await v.play();
    $("#liveCamWrap").hidden=false; toast("Live camera on — capture a frame");
  }catch{ toast("Camera blocked — allow camera access or use Take photo instead."); }
});
function stopCam(){ try{ (stream||{}).getTracks&&stream.getTracks().forEach(t=>t.stop()); }catch{} stream=null; const w=$("#liveCamWrap"); if(w) w.hidden=true; const v=$("#liveCam"); if(v) v.srcObject=null; }
$("#stopCamBtn").addEventListener("click",stopCam);
$("#snapBtn").addEventListener("click",()=>{
  const v=$("#liveCam"); if(!v||!v.videoWidth) return toast("No camera frame yet");
  const c=document.createElement("canvas"); const sc=Math.min(1,1024/Math.max(v.videoWidth,v.videoHeight));
  c.width=v.videoWidth*sc; c.height=v.videoHeight*sc; c.getContext("2d").drawImage(v,0,0,c.width,c.height);
  draftPhotos.push(c.toDataURL("image/jpeg",0.72)); renderDraftPhotos(); toast("Photo captured");
});

form.addEventListener("submit",async(e)=>{
  e.preventDefault();
  const name=$("#fName").value.trim(), phone=$("#fPhone").value.trim(), issue=$("#fIssue").value.trim();
  if(!name||!phone||!issue) return toast("Name, contact and issue are required");
  const id=$("#fId").value||uid();
  const old=allJobs.find(j=>j.id===id);
  const job={ id, customerName:name, contactPhone:phone, contactEmail:$("#fEmail").value.trim(),
    status:$("#fStatus").value, brand:$("#fBrand").value.trim(), model:$("#fModel").value.trim(),
    color:$("#fColor").value.trim(), imei:$("#fImei").value.trim(), passcode:$("#fPass").value.trim(),
    issue, dateIn:$("#fDateIn").value||todayISO(), dateOut:$("#fDateOut").value||"", fee:Number($("#fFee").value||0),
    deposit:Number($("#fDeposit").value||0), accessories:$("#fAcc").value.trim(), notes:$("#fNotes").value.trim(),
    photos:[...draftPhotos], createdAt:old?old.createdAt:Date.now(), updatedAt:Date.now() };
  await putJob(job);
  allJobs=await getAll(); render(); hide(intakeModal); stopCam(); toast("Saved — "+name);
  maybeAutoDrive();
});

/* ---------- detail ---------- */
let currentId=null;
function openDetail(j){
  currentId=j.id;
  $("#dTitle").textContent=`${j.customerName||"Job"} — ${[j.brand,j.model].filter(Boolean).join(" ")||"device"}`;
  $("#dBody").innerHTML=`
    <div style="margin-bottom:10px"><span class="pill ${esc(j.status)}">${esc(j.status)}</span>
    <span class="muted"> • In: ${esc(fmtDate(j.dateIn))}${j.dateOut?` • Out: ${esc(fmtDate(j.dateOut))}`:""}</span></div>
    <div class="d-grid">
      <div><div class="k">Customer name</div><div class="v">${esc(j.customerName||"—")}</div></div>
      <div><div class="k">Contact</div><div class="v">${esc(j.contactPhone||"—")}${j.contactEmail?`<br/><a class="link" href="mailto:${esc(j.contactEmail)}">${esc(j.contactEmail)}</a>`:""}<br/><a class="link" href="tel:${esc((j.contactPhone||"").replace(/\s/g,""))}">📞 Call</a></div></div>
      <div><div class="k">Device</div><div class="v">${esc([j.brand,j.model,j.color].filter(Boolean).join(" · ")||"—")}</div></div>
      <div><div class="k">IMEI / Serial</div><div class="v">${esc(j.imei||"—")}</div></div>
      <div class="d-full"><div class="k">Fault reported</div><div class="v">${esc(j.issue||"—")}</div></div>
      <div><div class="k">Repair fee</div><div class="v">${gbp(j.fee)}${j.deposit?` (deposit ${gbp(j.deposit)})`:""}</div></div>
      <div><div class="k">Accessories</div><div class="v">${esc(j.accessories||"None recorded")}</div></div>
      ${j.notes?`<div class="d-full"><div class="k">Shop notes</div><div class="v">${esc(j.notes)}</div></div>`:""}
      ${j.passcode?`<div class="d-full"><div class="k">Passcode</div><div class="v">${esc(j.passcode)}</div></div>`:""}
    </div>
    <div class="k" style="margin-top:12px">Phone photos (${(j.photos||[]).length})</div>
    <div class="d-photos">${(j.photos||[]).map(p=>`<a href="${p}" target="_blank" rel="noopener"><img src="${p}" alt="phone photo" loading="lazy"/></a>`).join("")||'<p class="muted">No photos attached.</p>'}</div>`;
  show(detailModal);
}
$("#dEdit").addEventListener("click",()=>{ const j=allJobs.find(x=>x.id===currentId); hide(detailModal); if(j) openForm(j); });
$("#dDelete").addEventListener("click",async()=>{ if(!confirm("Delete this job? This cannot be undone.")) return;
  await delJob(currentId); allJobs=await getAll(); render(); hide(detailModal); toast("Job deleted"); maybeAutoDrive(); });
$("#dPrint").addEventListener("click",()=>printReceipt(allJobs.find(x=>x.id===currentId)));

/* ---------- print / CSV ---------- */
function printReceipt(j){
  if(!j) return;
  const w=window.open("","_blank","width=640,height=800");
  w.document.write(`<html><head><title>Mendsway Tech receipt</title><style>body{font-family:Arial;padding:24px;color:#111}h1{font-size:20px;margin:0}p{font-size:14px}table{width:100%;border-collapse:collapse;margin-top:12px}td,th{border:1px solid #ccc;padding:8px;font-size:14px;text-align:left}img{max-width:220px;margin:6px 6px 0 0;border:1px solid #ccc}</style></head><body>
  <h1>Mendsway Tech — Customer Receipt</h1><p>Date in: ${esc(fmtDate(j.dateIn))} • Status: ${esc(j.status)}<br/>Backup: ${BACKUP_EMAIL}</p>
  <table><tr><th>Customer</th><td>${esc(j.customerName)} — ${esc(j.contactPhone)} ${esc(j.contactEmail||"")}</td></tr>
  <tr><th>Device</th><td>${esc([j.brand,j.model,j.color].filter(Boolean).join(" "))} • IMEI: ${esc(j.imei||"—")}</td></tr>
  <tr><th>Fault</th><td>${esc(j.issue||"")}</td></tr>
  <tr><th>Fee / Deposit</th><td>${gbp(j.fee)} / ${gbp(j.deposit)}</td></tr>
  <tr><th>Notes</th><td>${esc(j.notes||"—")} • Accessories: ${esc(j.accessories||"none")}</td></tr></table>
  <p>Photos:</p><div>${(j.photos||[]).map(p=>`<img src="${p}"/>`).join("")||"No photos"}</div>
  <p>Customer signature: ____________________ &nbsp;&nbsp; Staff: ____________________</p>
  <script>onload=()=>{print();}<\/script></body></html>`);
  w.document.close();
}
$("#printQuick").addEventListener("click",()=>window.print());
function toCSV(list){
  const head=["id","customerName","contactPhone","contactEmail","brand","model","color","imei","issue","status","dateIn","dateOut","fee","deposit","accessories","notes","photoCount","createdAt"];
  const q=v=>`"${String(v==null?"":v).replace(/"/g,'""')}"`;
  return head.join(",")+"\n"+list.map(j=>head.map(h=>q(h==="photoCount"?(j.photos||[]).length:(h==="createdAt"?new Date(j.createdAt).toISOString():j[h]))).join(",")).join("\n");
}
$("#exportCsvQuick").addEventListener("click",()=>{ dl("mendsway-inventory.csv",toCSV(allJobs),"text/csv"); toast("CSV downloaded"); });
$("#exportCsv").addEventListener("click",()=>{ dl("mendsway-inventory.csv",toCSV(allJobs),"text/csv"); toast("CSV downloaded"); });

/* ---------- backup: file export/import + email ---------- */
function buildBackup(){ return { app:"mendsway-tech", version:1, backupEmail:BACKUP_EMAIL, exportedAt:new Date().toISOString(), device:"web", jobs:allJobs }; }
function dl(name,content,type){ const b=content instanceof Blob?content:new Blob([content],{type}); const a=document.createElement("a"); a.href=URL.createObjectURL(b); a.download=name; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),4000); }
function markBackup(where){ localStorage.setItem(LS_KEYS.lastBackup,JSON.stringify({at:Date.now(),where})); updateBackupDot(); renderBackupMeta(); }
function renderBackupMeta(){ const raw=localStorage.getItem(LS_KEYS.lastBackup);
  $("#backupMeta").textContent=raw?`Last backup: ${new Date(JSON.parse(raw).at).toLocaleString("en-GB")} (${JSON.parse(raw).where}) — ${allJobs.length} jobs.`:`No backup made yet on this device. (${allJobs.length} jobs stored locally.)`; }
function updateBackupDot(){ const d=$("#backupDot"),t=$("#backupDotText"); const raw=localStorage.getItem(LS_KEYS.lastBackup);
  if(gToken){ d.classList.add("ok"); t.textContent="Drive linked"; }
  else if(raw){ d.classList.remove("ok"); t.textContent="Backed up "+new Date(JSON.parse(raw).at).toLocaleDateString("en-GB"); }
  else { d.classList.remove("ok"); t.textContent="Local only — back up!"; } }
$("#exportJson").addEventListener("click",()=>{ dl(`mendsway-backup-${todayISO()}.json`,JSON.stringify(buildBackup(),null,2),"application/json"); markBackup("file"); toast("Backup file downloaded — email it to "+BACKUP_EMAIL); });
$("#emailExportBtn").addEventListener("click",()=>{ dl(`mendsway-backup-${todayISO()}.json`,JSON.stringify(buildBackup(),null,2),"application/json"); markBackup("file");
  location.href=`mailto:${BACKUP_EMAIL}?subject=${encodeURIComponent("Mendsway Tech inventory backup "+todayISO())}&body=${encodeURIComponent("Hi,\n\nAttached is my Mendsway Tech inventory backup ("+allJobs.length+" jobs, exported "+new Date().toLocaleString()+").\n\nPlease attach the downloaded file to this email before sending.\n\nOn the new device: install the app, open Backup → Import backup file, and choose the attachment.\n\nThanks!")}`;
  toast("File downloaded — attach it to the email that just opened"); });
$("#importJson").addEventListener("change",async(e)=>{
  const f=e.target.files[0]; if(!f) return;
  try{ const data=JSON.parse(await f.text());
    const jobs=Array.isArray(data)?data:data.jobs; if(!Array.isArray(jobs)) throw 0;
    if(!confirm(`Import ${jobs.length} jobs? This replaces everything on THIS device.`)) return;
    const clean=jobs.map(j=>({photos:[],status:"Received",createdAt:Date.now(),updatedAt:Date.now(),...j,id:j.id||uid()}));
    await clearAll(clean); allJobs=await getAll(); render(); renderBackupMeta(); markBackup("import"); toast(`Imported ${clean.length} jobs`);
  }catch{ toast("That file is not a valid backup"); } e.target.value=""; });

/* ---------- Google Drive sync ---------- */
function initGis(){
  const id=(localStorage.getItem(LS_KEYS.clientId)||"").trim();
  $("#gClientId").value=id;
  if(!(window.google&&google.accounts&&id)) return;
  try{
    tokenClient=google.accounts.oauth2.initTokenClient({ client_id:id, scope:"https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.appdata", callback:(r)=>{ if(r&&r.access_token){ gToken=r.access_token; onDriveSignedIn(); } } });
  }catch(err){ console.warn(err); }
}
$("#saveClientId").addEventListener("click",()=>{ const v=$("#gClientId").value.trim(); if(!v) return toast("Paste a Client ID first");
  localStorage.setItem(LS_KEYS.clientId,v); initGis(); toast("Client ID saved — now Sign in with Google"); });
$("#gSignIn").addEventListener("click",()=>{
  const id=(localStorage.getItem(LS_KEYS.clientId)||"").trim();
  if(!id) return toast("Paste your Google Client ID first (see steps above)");
  if(!window.google||!tokenClient) initGis();
  if(!tokenClient) return toast("Google library still loading — wait a moment and retry");
  tokenClient.requestAccessToken({prompt:"consent"});
});
$("#gSignOut").addEventListener("click",()=>{ gToken=null; if(window.google&&gToken) try{google.accounts.oauth2.revoke(gToken);}catch{} updateDriveUI(); toast("Signed out of Google"); });
function onDriveSignedIn(){ updateDriveUI(); toast("Signed in — you can now Save to / Restore from Drive"); maybeAutoDrive(true); }
function updateDriveUI(){
  const in_=!!gToken;
  $("#gStatus").textContent=in_?"Signed in — Drive sync ready. Backups are visible in your Drive.":"Not signed in.";
  $("#driveUp").disabled=!in_; $("#driveDown").disabled=!in_;
  $("#gSignOut").hidden=!in_; $("#gSignIn").hidden=in_;
  $("#autoBackup").checked=localStorage.getItem(LS_KEYS.auto)==="1";
  updateBackupDot();
}
$("#autoBackup").addEventListener("change",e=>{ localStorage.setItem(LS_KEYS.auto,e.target.checked?"1":"0"); toast(e.target.checked?"Auto Drive backup ON":"Auto Drive backup OFF"); });
async function gapiLoaded(){ if(window.gapi&&gapi.client) return true;
  await new Promise((res)=>{ if(!window.gapi) return res(false); gapi.load("client",res); }); return !!(window.gapi&&gapi.client); }
async function driveRequest(path,method,body,fileId){
  const headers={Authorization:"Bearer "+gToken};
  let url="https://www.googleapis.com/drive/v3/"+path, opts={method,headers};
  if(body&&!fileId){ // multipart upload
    const boundary="mends"+Date.now();
    headers["Content-Type"]=`multipart/related; boundary=${boundary}`;
    const meta=JSON.stringify({name:DRIVE_FILENAME,mimeType:"application/json"});
    opts.body=`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${meta}\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n${body}\r\n--${boundary}--`;
    url="https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,modifiedTime";
  } else if(body&&fileId){
    headers["Content-Type"]="application/json";
    url=`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media&fields=id,modifiedTime`;
    opts.body=body;
  }
  const r=await fetch(url,opts); if(!r.ok) throw new Error("Drive error "+r.status); return r.json();
}
async function driveFind(){
  const q=encodeURIComponent(`name='${DRIVE_FILENAME}' and trashed=false`);
  const r=await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,modifiedTime)&spaces=drive`,{headers:{Authorization:"Bearer "+gToken}});
  if(!r.ok) throw new Error("Drive list failed"); const j=await r.json(); return (j.files||[])[0]||null;
}
$("#driveUp").addEventListener("click",async()=>{
  if(!gToken) return toast("Sign in with Google first");
  try{
    toast("Saving to Drive…");
    const payload=JSON.stringify(buildBackup());
    const existing=await driveFind().catch(()=>null);
    const savedId=localStorage.getItem(LS_KEYS.driveFileId);
    if(existing||savedId){ const id=(existing&&existing.id)||savedId; await driveRequest(null,"PATCH",payload,id); }
    else { const created=await driveRequest("files","POST",payload,false); if(created&&created.id) localStorage.setItem(LS_KEYS.driveFileId,created.id); }
    markBackup("Google Drive"); toast("Saved to Google Drive ("+BACKUP_EMAIL+")");
  }catch(err){ console.error(err); toast("Drive save failed — check Client ID / origins"); }
});
$("#driveDown").addEventListener("click",async()=>{
  if(!gToken) return toast("Sign in with Google first");
  try{
    toast("Checking Drive for backup…");
    const f=await driveFind(); if(!f) return toast("No backup file found in Drive yet");
    if(!confirm(`Restore backup from Drive (modified ${f.modifiedTime})? Replaces this device.`)) return;
    const r=await fetch(`https://www.googleapis.com/drive/v3/files/${f.id}?alt=media`,{headers:{Authorization:"Bearer "+gToken}});
    const data=await r.json(); const jobs=Array.isArray(data)?data:data.jobs;
    if(!Array.isArray(jobs)) throw 0;
    await clearAll(jobs.map(j=>({...j,id:j.id||uid()}))); allJobs=await getAll(); render(); markBackup("Google Drive restore");
    toast(`Restored ${jobs.length} jobs from Drive`);
  }catch(err){ console.error(err); toast("Drive restore failed"); }
});
function maybeAutoDrive(force){
  if(!gToken) return; if(localStorage.getItem(LS_KEYS.auto)!=="1"&&!force) return;
  $("#driveUp").click();
}

/* ---------- shell wiring ---------- */
function show(m){ m.hidden=false; } function hide(m){ m.hidden=true; }
document.querySelectorAll("[data-close]").forEach(b=>b.addEventListener("click",()=>{ hide(intakeModal); hide(detailModal); hide(backupModal); stopCam(); }));
[intakeModal,detailModal,backupModal].forEach(m=>m.addEventListener("click",e=>{ if(e.target===m){ m.hidden=true; stopCam(); } }));
document.addEventListener("keydown",e=>{ if(e.key==="Escape"){ [intakeModal,detailModal,backupModal].forEach(hide); stopCam(); } });
$("#addBtn").addEventListener("click",()=>openForm(null));
$("#emptyAdd").addEventListener("click",()=>openForm(null));
$("#backupBtn").addEventListener("click",()=>{ renderBackupMeta(); updateDriveUI(); show(backupModal); });
searchEl.addEventListener("input",render); statusFilter.addEventListener("change",render); sortBy.addEventListener("change",render);

/* PWA install */
window.addEventListener("beforeinstallprompt",e=>{ e.preventDefault(); deferredPrompt=e; $("#installBtn").hidden=false; });
$("#installBtn").addEventListener("click",async()=>{ if(!deferredPrompt) return toast("Use browser menu → Install / Add to Home Screen");
  deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt=null; $("#installBtn").hidden=true; });
if("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("./service-worker.js").catch(()=>{}));

/* seed demo if empty (first run) so the shop sees the layout) */
async function seed(){
  allJobs=await getAll();
  if(!allJobs.length && !localStorage.getItem("mt_seeded")){
    const demo=[
      {customerName:"Adaeze Okafor",contactPhone:"07700 900101",contactEmail:"",brand:"Apple",model:"iPhone 12",color:"Blue",imei:"354000000000001",passcode:"",issue:"Cracked rear glass, camera OK",status:"Received",dateIn:todayISO(),dateOut:"",fee:65,deposit:20,accessories:"Clear case",notes:"Light scratches on frame. Customer wants quote before proceeding.",photos:[],createdAt:Date.now()-86400000*2},
      {customerName:"Daniel Mensah",contactPhone:"07700 900202",contactEmail:"",brand:"Samsung",model:"Galaxy A54",color:"Black",imei:"",passcode:"1234",issue:"Battery drains in 3 hours",status:"In Repair",dateIn:todayISO(),dateOut:"",fee:45,deposit:0,accessories:"None",notes:"Battery health check pending.",photos:[],createdAt:Date.now()-86400000}
    ].map(j=>({...j,id:uid(),updatedAt:Date.now()}));
    for(const j of demo) await putJob(j);
    allJobs=await getAll(); localStorage.setItem("mt_seeded","1");
  }
  render(); renderBackupMeta();
}

/* boot */
window.addEventListener("load",()=>{ initGis(); setTimeout(initGis,2500); });
seed();
setInterval(()=>{ if(window.google&&!tokenClient) initGis(); },4000);
})();
