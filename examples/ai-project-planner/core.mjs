export const statuses=['To do','In progress','In review','Done'];
export const priorities=['High','Medium','Low'];
export function localDate(date=new Date()){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;}
export function validDate(s){if(s==='')return true;if(!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;const d=new Date(`${s}T12:00:00`);return Number.isFinite(+d)&&localDate(d)===s;}
export function validate(tasks){
 if(!Array.isArray(tasks)||tasks.length>500)throw Error('Choose a backup containing up to 500 tasks.');
 const ids=new Set();
 return tasks.map(t=>{
  if(!t||typeof t!=='object'||typeof t.id!=='string'||!t.id||t.id.length>100||ids.has(t.id))throw Error('Every task needs a unique ID.');ids.add(t.id);
  for(const [key,max] of Object.entries({title:160,description:3000,owner:80,due:10,blocker:300}))if(typeof t[key]!=='string'||t[key].length>max)throw Error(`Invalid ${key}.`);
  if(!t.title.trim()||!statuses.includes(t.status)||!priorities.includes(t.priority)||!validDate(t.due)||typeof t.blocked!=='boolean'||!Array.isArray(t.checklist)||t.checklist.length>40)throw Error('Invalid task fields.');
  if(t.blocked&&!t.blocker.trim())throw Error('Add a reason for the blocker.');
  const checklist=t.checklist.map(c=>{if(!c||typeof c.text!=='string'||!c.text.trim()||c.text.length>300||typeof c.done!=='boolean')throw Error('Invalid checklist item.');return {text:c.text,done:c.done};});
  const tags=t.tags??[];
  if(!Array.isArray(tags)||tags.length>8||tags.some(x=>typeof x!=='string'||!x.trim()||x.length>30))throw Error('Use up to eight labels, each at most 30 characters.');
  return {id:t.id,title:t.title.trim(),description:t.description,owner:t.owner.trim(),due:t.due,priority:t.priority,status:t.status,blocked:t.blocked,blocker:t.blocker,checklist,tags:[...new Set(tags.map(x=>x.trim()))]};
 });
}
export function overdue(t,today=localDate()){return !!t.due&&t.due<today&&t.status!=='Done';}
export function summary(tasks,today=localDate()){const done=tasks.filter(t=>t.status==='Done').length;return {total:tasks.length,done,percent:tasks.length?Math.round(done/tasks.length*100):0,overdue:tasks.filter(t=>overdue(t,today)).length,blocked:tasks.filter(t=>t.blocked&&t.status!=='Done').length};}
export function offsetDate(date,n){const d=new Date(date+'T12:00:00');d.setDate(d.getDate()+n);return localDate(d);}
export function filterTasks(tasks,{search='',owner='',priority='',tag='',focus='all',today=localDate()}={}){
 const query=search.trim().toLowerCase();return tasks.filter(t=>{
  if(query&&!`${t.title} ${t.description} ${t.owner} ${(t.tags||[]).join(' ')}`.toLowerCase().includes(query))return false;
  if(owner&&t.owner!==owner||priority&&t.priority!==priority||tag&&!(t.tags||[]).includes(tag))return false;
  if(focus==='unfinished')return t.status!=='Done';
  if(focus==='today')return t.status!=='Done'&&t.due===today;
  if(focus==='week')return t.status!=='Done'&&!!t.due&&t.due>=today&&t.due<=offsetDate(today,6);
  if(focus==='overdue')return overdue(t,today);
  if(focus==='blocked')return t.blocked&&t.status!=='Done';
  return true;
 });
}
export function sortTasks(tasks,sort='original'){
 return [...tasks].sort((a,b)=>sort==='due'?(a.due||'9999').localeCompare(b.due||'9999'):sort==='priority'?priorities.indexOf(a.priority)-priorities.indexOf(b.priority):sort==='title'?a.title.localeCompare(b.title):0);
}
export function monthCells(month){
 const first=new Date(month+'-01T12:00:00');const start=offsetDate(localDate(first),-((first.getDay()+6)%7));
 return Array.from({length:42},(_,i)=>offsetDate(start,i));
}
export function duplicateTask(t,id){return {...t,id,title:('Copy of '+t.title).slice(0,160),status:'To do',blocked:false,blocker:'',checklist:t.checklist.map(c=>({...c,done:false})),tags:[...(t.tags||[])]};}
export function reconcileChecklist(lines,old=[]){
 const remaining=old.map(c=>({...c}));return lines.map(text=>{const i=remaining.findIndex(c=>c.text===text);return {text,done:i<0?false:remaining.splice(i,1)[0].done};});
}
export function templateTasks(kind,start,idFactory){
 const titles={website:['Agree the launch scope','Draft the homepage copy','Review the mobile layout','Test the contact form','Prepare the launch announcement'],content:['Choose the reader and topic','Write the first draft','Edit and fact-check','Prepare the images','Publish and share'],study:['Set the learning goal','Find learning resources','Complete a practice exercise','Build a small example','Review what you learnt']}[kind];
 if(!titles||!start||!validDate(start))throw Error('Choose a template and valid start date.');
 return titles.map((title,i)=>({id:idFactory(),title,description:'',owner:'',due:offsetDate(start,i*2),priority:i===0?'High':'Medium',status:'To do',blocked:false,blocker:'',checklist:[],tags:[kind==='website'?'Website':kind==='content'?'Content':'Learning']}));
}
export function csv(tasks){
 const cell=x=>'"'+String(x).replace(/^\s*[=+@\-]|^[\t\r\n]/,"'$&").replaceAll('"','""')+'"';
 return [['Task','Owner','Status','Priority','Due date','Labels','Blocked','Blocker','Checklist complete'],...tasks.map(t=>[t.title,t.owner,t.status,t.priority,t.due,(t.tags||[]).join('; '),t.blocked?'Yes':'No',t.blocker,`${t.checklist.filter(c=>c.done).length}/${t.checklist.length}`])].map(row=>row.map(cell).join(',')).join('\r\n');
}
export function seed(){const date=n=>{const d=new Date();d.setDate(d.getDate()+n);return localDate(d);};return [
 {id:'scope',title:'Agree the launch scope',description:'Choose the three things visitors need to do on the new website.',owner:'Amira',due:date(-3),priority:'High',status:'Done',blocked:false,blocker:'',checklist:[{text:'Write the launch goal',done:true},{text:'Agree what can wait',done:true}]},
 {id:'copy',title:'Draft the homepage copy',description:'Explain who the website helps and give visitors a clear next step.',owner:'Beth',due:date(2),priority:'High',status:'In progress',blocked:false,blocker:'',checklist:[{text:'Write the headline',done:true},{text:'Review the call to action',done:false}]},
 {id:'mobile',title:'Review the mobile layout',description:'Check navigation, text size and buttons on a small screen.',owner:'Chloe',due:date(3),priority:'Medium',status:'In review',blocked:false,blocker:'',checklist:[{text:'Check at 390px width',done:false}]},
 {id:'images',title:'Confirm image permissions',description:'Record the source and permission for each launch image.',owner:'Amira',due:date(-1),priority:'High',status:'To do',blocked:true,blocker:'Waiting for permission from the photographer.',checklist:[]},
 {id:'form',title:'Test the contact form',description:'Send a test enquiry and check that the reply reaches the visitor.',owner:'Chloe',due:date(5),priority:'High',status:'To do',blocked:false,blocker:'',checklist:[{text:'Check validation messages',done:false},{text:'Check the email arrives',done:false}]},
 {id:'announce',title:'Prepare the launch announcement',description:'Draft a short announcement explaining what readers can find.',owner:'Beth',due:date(7),priority:'Low',status:'To do',blocked:false,blocker:'',checklist:[]}
 ].map(t=>({...t,tags:[['copy','announce'].includes(t.id)?'Content':t.id==='mobile'?'Design':'Launch']}));}
