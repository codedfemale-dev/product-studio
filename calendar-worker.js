'use strict';
importScripts('vendor/ical-2.2.1.js','calendar-core.js');
onmessage=async event=>{try{postMessage({ok:true,report:await readCalendarCopy(event.data.text,event.data.options)})}catch(error){postMessage({ok:false,error:error.message||'Could not read this calendar file.'})}};
