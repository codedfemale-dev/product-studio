import {statuses,validate,overdue,summary,filterTasks,sortTasks,seed,localDate,monthCells,duplicateTask,reconcileChecklist,templateTasks,csv} from './core.mjs';
const $=id=>document.getElementById(id),key='codedfemale-tutorial-planner-v1';
let tasks=seed(),view='board',focus='all',month=localDate().slice(0,7),storageHealthy=true,history=[],focusTask=null,dragId=null;
function say(text){$('message').textContent=text;}
try{const raw=localStorage.getItem(key);if(raw!==null)tasks=validate(JSON.parse(raw));}catch{storageHealthy=false;say('Saved data could not be read. The example is shown without replacing it. Export to save this session, or reset to replace the stored data.');}
function save(){if(!storageHealthy){say('Storage is unavailable or contains unreadable data. Changes are in memory only. Export a backup.');return;}try{localStorage.setItem(key,JSON.stringify(tasks));}catch{storageHealthy=false;say('Browser storage is unavailable. Changes are in memory only. Export a backup.');}}
function commit(next,message='Saved in this browser.'){
 const valid=validate(next);history.push(JSON.stringify(tasks));if(history.length>20)history.shift();tasks=valid;save();if(storageHealthy)say(message+' Undo is available.');render();
}
function el(tag,text,className){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(className)e.className=className;return e;}
function button(text,action,className){const b=el('button',text,className);b.type='button';b.onclick=action;return b;}
function dateText(date){return date?new Date(date+'T12:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):'No due date';}
function refreshOptions(id,values,placeholder){const selected=$(id).value;$(id).replaceChildren(new Option(placeholder,''));[...new Set(values.filter(Boolean))].sort().forEach(v=>$(id).add(new Option(v,v)));$(id).value=selected;if($(id).selectedIndex<0)$(id).value='';}
function clearFilters(){focus='all';for(const id of ['search','owner','priority','tag'])$(id).value='';}
function render(){
 $('undo').disabled=!history.length;
 const s=summary(tasks);$('metrics').replaceChildren();for(const [label,value] of [['Tasks',s.total],['Complete',s.percent+'%'],['Overdue',s.overdue],['Blocked',s.blocked]]){const box=el('div',undefined,'metric');box.append(el('strong',value),el('span',label));$('metrics').append(box);}
 refreshOptions('owner',tasks.map(t=>t.owner),'Everyone');refreshOptions('tag',tasks.flatMap(t=>t.tags||[]),'All labels');
 $('quick-filters').replaceChildren();for(const [id,label] of [['all','All tasks'],['unfinished','Unfinished'],['today','Due today'],['week','Next 7 days'],['overdue','Overdue'],['blocked','Blocked']]){const b=button(label,()=>{focus=id;render();$('focus-'+id).focus();});b.id='focus-'+id;b.setAttribute('aria-pressed',String(focus===id));$('quick-filters').append(b);}
 const visible=sortTasks(filterTasks(tasks,{search:$('search').value,owner:$('owner').value,priority:$('priority').value,tag:$('tag').value,focus}),$('sort').value);
 $('count').textContent=`Showing ${visible.length} of ${tasks.length} tasks. Overview counts cover the whole project.`;
 $('tasks').replaceChildren();$('tasks').className=view==='board'?'columns':view==='list'?'table-container':'calendar-view';
 if(view==='calendar'){renderCalendar(visible);return;}
 if(!visible.length){$('tasks').append(el('p',tasks.length?'No tasks match. Try clearing the filters.':'No tasks yet. Add a task or use a template.','empty'));return;}
 if(view==='list'){renderTable(visible);return;}
 for(const status of statuses){const col=el('section',undefined,'column');col.append(el('h2',`${status} · ${visible.filter(t=>t.status===status).length}`));
  col.addEventListener('dragover',e=>{if(dragId){e.preventDefault();e.dataTransfer.dropEffect='move';col.classList.add('drop-target');}});
  col.addEventListener('dragleave',e=>{if(!col.contains(e.relatedTarget))col.classList.remove('drop-target');});
  col.addEventListener('drop',e=>{e.preventDefault();col.classList.remove('drop-target');if(dragId)move(dragId,status);dragId=null;});
  for(const t of visible.filter(t=>t.status===status))col.append(card(t));$('tasks').append(col);
 }
}
function move(id,status){if(tasks.find(t=>t.id===id)?.status===status)return;commit(tasks.map(t=>t.id===id?{...t,status}:t),'Task moved.');$('status-'+id)?.focus();}
function statusControl(t){const select=el('select');select.id='status-'+t.id;select.setAttribute('aria-label',`Status for ${t.title}`);statuses.forEach(s=>select.add(new Option(s,s)));select.value=t.status;select.onchange=()=>move(t.id,select.value);return select;}
function badges(t){const b=el('div',undefined,'badges');b.append(el('span',t.priority,`badge ${t.priority.toLowerCase()}`));if(t.blocked&&t.status!=='Done')b.append(el('span','Blocked','badge blocked'));if(overdue(t))b.append(el('span','Overdue','badge blocked'));for(const tag of t.tags||[])b.append(el('span',tag,'badge tag'));return b;}
function taskButton(t){const b=button(t.title,()=>edit(t),'task-title');b.id='task-'+t.id;return b;}
function card(t){
 const a=el('article',undefined,'card');a.draggable=true;a.addEventListener('dragstart',e=>{if(e.target.closest('input,select')){e.preventDefault();return;}dragId=t.id;e.dataTransfer.setData('text/plain',t.id);e.dataTransfer.effectAllowed='move';});a.addEventListener('dragend',()=>{dragId=null;document.querySelectorAll('.drop-target').forEach(c=>c.classList.remove('drop-target'));});
 a.append(badges(t),taskButton(t));if(t.description)a.append(el('p',t.description,'description'));a.append(el('p',`${t.owner||'Unassigned'} · ${dateText(t.due)}`,'meta'));
 if(t.blocked&&t.status!=='Done')a.append(el('p',t.blocker,'blocker'));
 if(t.checklist.length)a.append(el('p',`${t.checklist.filter(c=>c.done).length}/${t.checklist.length} checklist items complete`,'meta'));
 t.checklist.forEach((c,i)=>{const label=el('label',undefined,'check'),input=el('input');input.type='checkbox';input.id='check-'+t.id+'-'+i;input.checked=c.done;input.onchange=()=>{commit(tasks.map(x=>x.id===t.id?{...x,checklist:x.checklist.map((item,n)=>n===i?{...item,done:input.checked}:item)}:x),'Checklist updated.');$(input.id)?.focus();};label.append(input,document.createTextNode(c.text));a.append(label);});
 const label=el('label','Move to','move');label.append(statusControl(t));a.append(label);return a;
}
function renderTable(visible){
 const table=el('table'),caption=el('caption','Project tasks. Select a task name to edit it.');table.append(caption);const head=el('thead'),row=el('tr');for(const title of ['Task','Owner','Due date','Priority / labels','Status','Checklist']){const th=el('th',title);th.scope='col';row.append(th);}head.append(row);table.append(head);const body=el('tbody');
 for(const t of visible){const r=el('tr'),name=el('td');name.append(taskButton(t));if(t.blocked&&t.status!=='Done')name.append(el('p','Blocked: '+t.blocker,'blocker'));if(overdue(t))name.append(el('span','Overdue','badge blocked'));r.append(name,el('td',t.owner||'Unassigned'),el('td',dateText(t.due)));const labels=el('td');labels.append(badges(t));const status=el('td');status.append(statusControl(t));r.append(labels,status,el('td',t.checklist.length?`${t.checklist.filter(c=>c.done).length}/${t.checklist.length}`:'None'));body.append(r);}table.append(body);$('tasks').append(table);
}
function renderCalendar(visible){
 const nav=el('div',undefined,'calendar-nav'),title=el('h2',new Date(month+'-01T12:00:00').toLocaleDateString('en-GB',{month:'long',year:'numeric'}));
 function step(n){const d=new Date(month+'-01T12:00:00');d.setMonth(d.getMonth()+n);month=localDate(d).slice(0,7);render();$('calendar-month').focus();}
 title.id='calendar-month';title.tabIndex=-1;nav.append(button('Previous month',()=>step(-1)),title,button('Next month',()=>step(1)),button('Today',()=>{month=localDate().slice(0,7);render();$('calendar-month').focus();}));$('tasks').append(nav);
 const grid=el('div',undefined,'month-grid');grid.setAttribute('aria-label','Calendar dates');for(const day of ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'])grid.append(el('div',day,'weekday'));
 for(const date of monthCells(month)){const day=el('section',undefined,'calendar-day'+(date.startsWith(month)?'':' outside')+(date===localDate()?' today':''));day.setAttribute('aria-label',dateText(date));day.append(el('span',String(Number(date.slice(-2))),'day-number'));for(const t of visible.filter(t=>t.due===date)){const b=button(t.title,()=>edit(t),'calendar-task'+(t.status==='Done'?' completed':''));b.setAttribute('aria-label',`${t.title}, ${t.status}, ${dateText(date)}`);day.append(b);}grid.append(day);} $('tasks').append(grid);
 const agenda=el('section',undefined,'agenda');agenda.append(el('h2','Agenda for this month'));const dated=sortTasks(visible.filter(t=>t.due.startsWith(month)),'due');if(!dated.length)agenda.append(el('p','No matching tasks are due this month. Try another month or clear your filters.'));
 for(const t of dated){const row=el('div',undefined,'agenda-row');row.append(el('span',dateText(t.due)),button(t.title,()=>edit(t),'agenda-title'),el('span',`${t.status} · ${t.owner||'Unassigned'}`));agenda.append(row);} $('tasks').append(agenda);
 const undated=visible.filter(t=>!t.due),section=el('section',undefined,'agenda');section.append(el('h2',`No due date · ${undated.length}`));if(!undated.length)section.append(el('p','All matching tasks have due dates.'));for(const t of undated)section.append(button(t.title,()=>edit(t),'agenda-title'));$('tasks').append(section);
}
const form=$('form');
$('editor').addEventListener('close',()=>{(focusTask?$('task-'+focusTask):null)?.focus();if(!focusTask||!$('task-'+focusTask))(view==='calendar'?$('calendar'):$('add')).focus();});
function edit(t){focusTask=t?.id||null;form.reset();$('form-error').textContent='';$('dialog-title').textContent=t?'Edit task':'New task';$('delete').hidden=$('duplicate').hidden=!t;for(const name of ['id','title','description','owner','due','priority','status','blocker'])form.elements[name].value=t?t[name]:({priority:'Medium',status:'To do'}[name]||'');form.elements.blocked.checked=!!t?.blocked;form.elements.tags.value=(t?.tags||[]).join(', ');form.elements.checklist.value=t?t.checklist.map(c=>c.text).join('\n'):'';$('editor').showModal();form.elements.title.focus();}
$('add').onclick=()=>edit();$('close').onclick=()=>$('editor').close();
form.onsubmit=e=>{e.preventDefault();const old=tasks.find(t=>t.id===form.elements.id.value),t={};for(const n of ['title','description','owner','due','priority','status','blocker'])t[n]=form.elements[n].value.trim();t.id=old?.id||crypto.randomUUID();t.blocked=form.elements.blocked.checked;t.tags=form.elements.tags.value.split(',').map(s=>s.trim()).filter(Boolean);t.checklist=reconcileChecklist(form.elements.checklist.value.split('\n').map(s=>s.trim()).filter(Boolean),old?.checklist);try{commit(old?tasks.map(x=>x.id===old.id?t:x):[...tasks,t],'Task saved.');$('editor').close();}catch(err){$('form-error').textContent=err.message;}};
$('delete').onclick=()=>{if(confirm('Delete this task? You can undo during this session.')){commit(tasks.filter(t=>t.id!==form.elements.id.value),'Task deleted.');$('editor').close();}};
$('duplicate').onclick=()=>{const old=tasks.find(t=>t.id===form.elements.id.value);try{const copy=duplicateTask(old,crypto.randomUUID());commit([...tasks,copy],'Task duplicated.');edit(copy);}catch(err){$('form-error').textContent=err.message;}};
for(const id of ['search','owner','priority','tag','sort'])$(id).addEventListener(id==='search'?'input':'change',render);
$('clear').onclick=()=>{clearFilters();render();};
for(const v of ['board','list','calendar'])$(v).onclick=()=>{view=v;for(const n of ['board','list','calendar'])$(n).setAttribute('aria-pressed',String(n===v));render();};
$('undo').onclick=()=>{if(!history.length)return;tasks=validate(JSON.parse(history.pop()));save();if(storageHealthy)say('Last change undone.');render();};
function download(content,type,name){const a=el('a');a.href=URL.createObjectURL(new Blob([content],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
$('export').onclick=()=>{download(JSON.stringify(tasks,null,2),'application/json','project-planner-backup.json');say('Backup exported. Keep the file somewhere you can find it.');};
$('csv').onclick=()=>{download('\uFEFF'+csv(tasks),'text/csv;charset=utf-8','project-planner-tasks.csv');say('All tasks exported as CSV. Use the JSON backup to restore the planner.');};
$('import').onclick=()=>$('file').click();$('file').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>2_000_000)throw Error('Choose a file smaller than 2 MB.');const next=validate(JSON.parse(await file.text()));if(confirm(`Replace all current tasks with ${next.length} imported tasks? Export a backup first if needed.`)){storageHealthy=true;commit(next,'Backup imported.');}}catch(err){say('Import failed: '+err.message);}e.target.value='';};
$('reset').onclick=()=>{if(confirm('Replace all tasks with the original example? Export a backup first if needed.')){storageHealthy=true;clearFilters();commit(seed(),'Example restored.');}};
$('templates').onclick=()=>{$('template-form').reset();$('template-form').elements.start.value=localDate();$('template-error').textContent='';$('template-dialog').showModal();};$('template-close').onclick=()=>$('template-dialog').close();
$('template-form').onsubmit=e=>{e.preventDefault();const f=e.target;try{const next=templateTasks(f.elements.kind.value,f.elements.start.value,()=>crypto.randomUUID());if(f.elements.mode.value==='replace'&&!confirm('Replace all current tasks with this template? You can undo during this session.'))return;const result=f.elements.mode.value==='replace'?next:[...tasks,...next];validate(result);clearFilters();month=f.elements.start.value.slice(0,7);commit(result,'Template tasks created.');$('template-dialog').close();}catch(err){$('template-error').textContent=err.message;}};
const filterBreakpoint=matchMedia('(min-width:700px)');$('advanced-filters').open=filterBreakpoint.matches;filterBreakpoint.addEventListener('change',e=>{$('advanced-filters').open=e.matches;});
// Refresh date-based labels when an open tab returns after midnight.
document.addEventListener('visibilitychange',()=>{if(!document.hidden)render();});
render();
