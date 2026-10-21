(function(){
  'use strict';
  var failedStorageNotice=false,persistenceDisabled=false,progressBridge=null,progressSnapshot={};
  function e(value){return String(value==null?'':value).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function p(text){return String(text||'').split(/\n\s*\n/).filter(Boolean).map(function(t){return '<p>'+e(t).replace(/\n/g,'<br>')+'</p>';}).join('');}
  function read(key,fallback){if(progressBridge)return Object.prototype.hasOwnProperty.call(progressSnapshot,key)?progressSnapshot[key]:fallback;try{var text=localStorage.getItem(key);return text?JSON.parse(text):fallback;}catch(err){return fallback;}}
  function write(key,obj){if(persistenceDisabled)return true;if(progressBridge){progressSnapshot[key]=obj;progressBridge(key,obj);return true;}try{localStorage.setItem(key,JSON.stringify(obj));return true;}catch(err){if(!failedStorageNotice){toast('浏览器无法保存进度，请使用 Export progress 导出。');failedStorageNotice=true;}return false;}}
  function toast(message){var el=document.getElementById('toast');el.textContent=message;el.hidden=false;clearTimeout(toast.timeout);toast.timeout=setTimeout(function(){el.hidden=true;},3300);}
  function download(name,obj){var blob=new Blob([JSON.stringify(obj,null,2)],{type:'application/json'});var url=URL.createObjectURL(blob);var a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url);},1000);}
  function sources(data,ids){var list=(ids||[]).map(function(id){return (data.sources||[]).find(function(s){return s.id===id;});}).filter(Boolean);if(!list.length)return '';return '<div class="content-note">来源：'+list.map(function(s){if(/^https:\/\//.test(s.url||''))return '<a href="'+e(s.url)+'" target="_blank" rel="noopener noreferrer">'+e(s.title)+'</a>';return '<span>'+e(s.title)+'</span>';}).join(' · ')+'</div>';}
  window.KIT={e:e,p:p,read:read,write:write,toast:toast,download:download,sources:sources,disablePersistence:function(){persistenceDisabled=true;},configureProgress:function(progress,onChange){progressSnapshot=progress;progressBridge=onChange;}};
})();
