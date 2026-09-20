const defaultComplaints=[
 {id:"CS2026001",category:"Public Service",area:"Guduvanchery",title:"Service delay",description:"Prototype record",status:"Under Review",date:"18 Sep 2026"},
 {id:"CS2026002",category:"Documentation",area:"Chennai",title:"Document service query",description:"Prototype record",status:"Pending",date:"19 Sep 2026"},
 {id:"CS2026003",category:"Corruption / Bribery",area:"Chengalpattu",title:"Bribery concern",description:"Prototype record",status:"Resolved",date:"20 Sep 2026"}
];

let complaints=JSON.parse(localStorage.getItem("civicComplaints")||"null")||defaultComplaints;

const titles={
 dashboard:"Civic Dashboard",report:"Report an Issue",track:"Track Complaint",rights:"Know Your Rights",
 services:"Public Services",help:"Find Help",alerts:"Public Alerts",awareness:"Civic Awareness",
 feedback:"Citizen Feedback",privacy:"Privacy & Safety",impact:"Impact",official:"Official Help",admin:"Admin Panel"
};

function showPage(id){
 document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
 const page=document.getElementById(id); if(page) page.classList.add("active");
 document.querySelectorAll(".nav button").forEach(b=>b.classList.toggle("active",b.dataset.page===id));
 document.getElementById("topTitle").textContent=titles[id]||"CivicShield";
 document.getElementById("sidebar").classList.remove("open");
 window.scrollTo({top:0,behavior:"smooth"});
 if(id==="admin") renderAdmin();
}
document.querySelectorAll(".nav button").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.page)));

const sidebar = document.getElementById("sidebar");
const menuBtn = document.getElementById("menuBtn");

menuBtn.addEventListener("click", (event) => {
  event.stopPropagation();
  sidebar.classList.toggle("open");
});

document.addEventListener("click", (event) => {
  if (
    sidebar.classList.contains("open") &&
    !sidebar.contains(event.target) &&
    !menuBtn.contains(event.target)
  ) {
    sidebar.classList.remove("open");
  }
});


function save(){localStorage.setItem("civicComplaints",JSON.stringify(complaints));}

function showToast(msg){
 const t=document.getElementById("toast"); t.textContent=msg;t.style.display="block";
 clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>t.style.display="none",2800);
}

function openInfo(title,body){document.getElementById("modalTitle").textContent=title;document.getElementById("modalBody").textContent=body;document.getElementById("modal").classList.add("open")}
function closeModal(){document.getElementById("modal").classList.remove("open")}
document.getElementById("modal").addEventListener("click",e=>{if(e.target.id==="modal")closeModal()});

function statusBadge(status){
 const cls=status==="Resolved"?"resolved":status==="Under Review"?"review":status==="Rejected"?"rejected":"pending";
 return `<span class="badge ${cls}">${status}</span>`;
}
function updateStats(){
 const total=complaints.length, resolved=complaints.filter(c=>c.status==="Resolved").length, review=complaints.filter(c=>c.status==="Under Review").length, pending=complaints.filter(c=>c.status==="Pending").length;
 document.getElementById("adminTotal").textContent=total;
 document.getElementById("adminResolved").textContent=resolved;
 document.getElementById("adminReview").textContent=review;
 document.getElementById("adminPending").textContent=pending;
}
function renderAdmin(){
 const body=document.getElementById("adminTable");
 body.innerHTML=complaints.map(c=>`<tr>
 <td><b>${c.id}</b></td><td>${c.category}</td><td>${c.area}</td><td>${c.title}</td><td>${statusBadge(c.status)}</td>
 <td><button class="btn btn-outline btn-sm" onclick="cycleStatus('${c.id}')"><i class="fa-solid fa-pen"></i> Update</button></td>
 </tr>`).join("");
 updateStats();
}
function cycleStatus(id){
 const c=complaints.find(x=>x.id===id); if(!c)return;
 const order=["Pending","Under Review","Resolved"];
 c.status=order[(order.indexOf(c.status)+1)%order.length];
 save();renderAdmin();showToast(`${id} updated to ${c.status}`);
}
function resetDemo(){
 complaints=[...defaultComplaints];save();renderAdmin();showToast("Demo records reset");
}

document.getElementById("reportForm").addEventListener("submit",e=>{
 e.preventDefault();
 const id="CS"+new Date().getFullYear()+String(Math.floor(Math.random()*900)+100);
 const c={
   id, category:document.getElementById("issueCategory").value,
   area:document.getElementById("issueArea").value.trim(),
   title:document.getElementById("issueTitle").value.trim(),
   description:document.getElementById("issueDescription").value.trim(),
   status:"Pending",date:new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})
 };
 complaints.unshift(c);save();e.target.reset();
 document.getElementById("trackInput").value=id;
 showPage("track");trackComplaint();
 showToast("Report submitted successfully");
});

function trackComplaint(){
 const id=document.getElementById("trackInput").value.trim().toUpperCase();
 const result=document.getElementById("trackResult");
 if(!id){result.innerHTML='<div class="notice">Enter a complaint ID to continue.</div>';return}
 const c=complaints.find(x=>x.id===id);
 if(!c){result.innerHTML='<div class="notice"><b>No record found.</b><br>Try CS2026001, CS2026002 or submit a new prototype report.</div>';return}
 const steps=["Submitted","Under Review","Resolved"], current=steps.indexOf(c.status);
 result.innerHTML=`
 <div class="grid two-col" style="margin-top:16px">
   <div class="card panel">
    <div class="panel-head"><h3>${c.id}</h3>${statusBadge(c.status)}</div>
    <div style="display:grid;gap:11px;font-size:11px">
      <div><span class="muted">Category</span><br><b>${escapeHtml(c.category)}</b></div>
      <div><span class="muted">Area</span><br><b>${escapeHtml(c.area)}</b></div>
      <div><span class="muted">Issue</span><br><b>${escapeHtml(c.title)}</b></div>
      <div><span class="muted">Submitted</span><br><b>${escapeHtml(c.date)}</b></div>
    </div>
   </div>
   <div class="card panel"><div class="panel-head"><h3>Complaint Timeline</h3><i class="fa-solid fa-route"></i></div>
    <div class="timeline">
      ${steps.map((s,i)=>`<div class="step ${i<=current?'done':''} ${i===current?'current':''}"><div class="dot"></div><h4>${s}</h4><p>${i===0?'Report received':i===1?(current>=1?'Review in progress':'Waiting for review'):(c.status==='Resolved'?'Issue marked resolved':'Pending resolution')}</p></div>`).join("")}
    </div>
   </div>
 </div>`;
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}

document.getElementById("feedbackForm").addEventListener("submit",e=>{e.preventDefault();e.target.reset();showToast("Thank you — demo feedback submitted");});
document.getElementById("trackInput").addEventListener("keydown",e=>{if(e.key==="Enter")trackComplaint()});
renderAdmin();

