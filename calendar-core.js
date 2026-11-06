'use strict';
// Runs in a worker. Calendar content never leaves the browser.
async function readCalendarCopy(text,options={}){
 if(typeof text!=='string'||new TextEncoder().encode(text).length>2*1024*1024)throw Error('Choose a calendar file smaller than 2 MB.');
 const day=v=>/^\d{4}-\d{2}-\d{2}$/.test(v)&&!isNaN(new Date(v+'T12:00:00'))&&new Date(v+'T12:00:00').getFullYear()>=1900&&new Date(v+'T12:00:00').getFullYear()+'-'+String(new Date(v+'T12:00:00').getMonth()+1).padStart(2,'0')+'-'+String(new Date(v+'T12:00:00').getDate()).padStart(2,'0')===v;
 if(!day(options.from)||!day(options.to)||options.from>options.to||(Date.parse(options.to+'T12:00:00Z')-Date.parse(options.from+'T12:00:00Z'))/86400000>180)throw Error('Choose a date range of up to 180 days.');
 const parsed=ICAL.parse(text.replace(/^\uFEFF/,''));const calendar=new ICAL.Component(parsed);if(calendar.name!=='vcalendar')throw Error('Choose an iCalendar (.ics) file.');
 const components=calendar.getAllSubcomponents('vevent');if(components.length>2000)throw Error('This file contains too many event records. Export a smaller calendar.');
 const all=components.map(c=>new ICAL.Event(c)),events=[],skipped=[],warnings=new Set(),seen=new Set();let iterations=0,capped=false;
 const dateString=d=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
 const hash=async v=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(v)))).map(x=>x.toString(16).padStart(2,'0')).join('');
 const push=async (event,start,end,identity)=>{
  if(event.component.getFirstPropertyValue('status')==='CANCELLED'){skipped.push('Cancelled event');return}
  const title=String(event.summary||'Untitled calendar event').trim()||'Untitled calendar event';if(title.length>1000)throw Error('An event title is too long.');
  const description=String(event.description||''),location=String(event.location||'');if(description.length>12000||location.length>1000)throw Error('An event has more detail than this workspace supports.');
  if(!start||!end)throw Error('Missing start or end time.');
  const localStart=start.toJSDate(),localEnd=end.toJSDate();let date=dateString(localStart),time=String(localStart.getHours()).padStart(2,'0')+':'+String(localStart.getMinutes()).padStart(2,'0');
  const minutes=(localEnd-localStart)/60000;
  if(!start.isDate&&(!Number.isFinite(minutes)||minutes<1||minutes>480||minutes%1)){skipped.push(title+': timed events must last 1–480 whole minutes');return}
  const attendees=event.attendees.map(p=>String(p.getParameter('cn')||p.getFirstValue()||'').replace(/^mailto:/i,'')).join(', ');if(attendees.length>12000)throw Error('Too many participants.');
  const lastDay=new Date(end.toString().slice(0,10)+'T12:00:00');lastDay.setDate(lastDay.getDate()-1);const last=start.isDate?dateString(lastDay):date;
  if(start.isDate){time='00:00';if(last<date||(+localEnd-localStart)/86400000>180){skipped.push(title+': unsupported all-day span');return}}
  do {
   if(date>=options.from&&date<=options.to){
    const dayPart=start.isDate?Math.round((Date.parse(date+'T12:00:00Z')-Date.parse(dateString(localStart)+'T12:00:00Z'))/86400000):0;const key=await hash((event.uid||JSON.stringify([title,start.toString(),description]))+'|'+identity+'|part'+dayPart);
    if(!seen.has(key)){seen.add(key);events.push({title,date,time,duration:start.isDate?'1':String(minutes),purpose:'Imported calendar event',agenda:description,attendees,notes:location?'Location: '+location:'',...(start.isDate?{allDay:true}:{}),calendarImport:{key,source:'ics'}})}
   }
   if(events.length>=300){capped=true;break}
   if(!start.isDate||date>=last)break;const next=new Date(date+'T12:00:00');next.setDate(next.getDate()+1);date=dateString(next);
  }while(true);
 };
 for(const event of all){
  if(capped)break;
  
  try{
   for(const related of all.filter(e=>e.uid===event.uid))for(const name of ['dtstart','dtend','recurrence-id']){
    const prop=related.component.getFirstProperty(name);if(!prop)continue;const tzid=prop.getParameter('tzid');if(tzid&&!calendar.getTimeZoneByID(tzid)&&!ICAL.TimezoneService.has(tzid))throw Error('time zone '+tzid+' has no definition in this file');
   }
   if(event.isRecurring()){
    const iterator=event.iterator();let occurrence;
    while((occurrence=iterator.next())){
     if(++iterations>20000)throw Error('recurrence expansion limit reached; export a shorter history');
     // Date window bounds get a two-day margin before timezone conversion.
     const cutoff=new Date(options.to+'T12:00:00');cutoff.setDate(cutoff.getDate()+2);if(occurrence.toString().slice(0,10)>dateString(cutoff))break;
     const detail=event.getOccurrenceDetails(occurrence);await push(detail.item,detail.startDate,detail.endDate,occurrence.toString());if(capped)break;
    }
    warnings.add('Repeating events become individual copies in this date range. Later changes are not synced.');
   }else await push(event,event.startDate,event.endDate,event.recurrenceId?.toString()||'single');
  }catch(error){skipped.push((event.summary||'Untitled event')+': '+error.message)}
 }
 if(capped)warnings.add('Preview limited to 300 copies. Choose a smaller date range to include more.');
 if(events.some(e=>e.allDay))warnings.add('All-day events are copied as one all-day entry per date.');
 events.sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));return {events,skipped:skipped.slice(0,30),skippedCount:skipped.length,warnings:[...warnings]};
}
