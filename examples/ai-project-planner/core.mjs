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
  return {id:t.id,title:t.title.trim(),description:t.description,owner:t.owner.trim(),due:t.due,priority:t.priority,status:t.status,blocked:t.blocked,blocker:t.blocker,checklist};
 });
}
export function overdue(t,today=localDate()){return !!t.due&&t.due<today&&t.status!=='Done';}
export function summary(tasks,today=localDate()){const done=tasks.filter(t=>t.status==='Done').length;return {total:tasks.length,done,percent:tasks.length?Math.round(done/tasks.length*100):0,overdue:tasks.filter(t=>overdue(t,today)).length,blocked:tasks.filter(t=>t.blocked&&t.status!=='Done').length};}
export function filterTasks(tasks,{search='',owner='',priority=''}={}){const query=search.trim().toLowerCase();return tasks.filter(t=>(!query||`${t.title} ${t.description} ${t.owner}`.toLowerCase().includes(query))&&(!owner||t.owner===owner)&&(!priority||t.priority===priority));}
export function seed(){const date=n=>{const d=new Date();d.setDate(d.getDate()+n);return localDate(d);};return [
 {id:'scope',title:'Agree the launch scope',description:'Choose the three things visitors need to do on the new website.',owner:'Amira',due:date(-3),priority:'High',status:'Done',blocked:false,blocker:'',checklist:[{text:'Write the launch goal',done:true},{text:'Agree what can wait',done:true}]},
 {id:'copy',title:'Draft the homepage copy',description:'Explain who the website helps and give visitors a clear next step.',owner:'Beth',due:date(2),priority:'High',status:'In progress',blocked:false,blocker:'',checklist:[{text:'Write the headline',done:true},{text:'Review the call to action',done:false}]},
 {id:'mobile',title:'Review the mobile layout',description:'Check navigation, text size and buttons on a small screen.',owner:'Chloe',due:date(3),priority:'Medium',status:'In review',blocked:false,blocker:'',checklist:[{text:'Check at 390px width',done:false}]},
 {id:'images',title:'Confirm image permissions',description:'Record the source and permission for each launch image.',owner:'Amira',due:date(-1),priority:'High',status:'To do',blocked:true,blocker:'Waiting for permission from the photographer.',checklist:[]},
 {id:'form',title:'Test the contact form',description:'Send a test enquiry and check that the reply reaches the visitor.',owner:'Chloe',due:date(5),priority:'High',status:'To do',blocked:false,blocker:'',checklist:[{text:'Check validation messages',done:false},{text:'Check the email arrives',done:false}]},
 {id:'announce',title:'Prepare the launch announcement',description:'Draft a short announcement explaining what readers can find.',owner:'Beth',due:date(7),priority:'Low',status:'To do',blocked:false,blocker:'',checklist:[]}
 ];}
