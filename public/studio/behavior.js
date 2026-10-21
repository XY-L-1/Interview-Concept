window.mountBehavior = function(scope, D){
  var document=scope;
  'use strict';
  var K=window.KIT,e=K.e,p=K.p,key='simple-ai-behavior-progress-v1';
  var defaults={view:'questions',qid:'',sid:'',tab:'answer',storyTab:'star',category:'All',search:'',notes:{},drafts:{},checks:{},practiced:{},sessions:[],duration:90};
  var state=normalize(K.read(key,{})),workspace=document.getElementById('workspace');
  var elapsedBase=0,runningSince=null,interval=null,saveTimeout=null,reveal=false;
  function normalize(raw){
    var s=Object.assign({},defaults,raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{});
    ['notes','drafts','checks','practiced'].forEach(function(k){if(!s[k]||typeof s[k]!=='object'||Array.isArray(s[k]))s[k]={};});
    if(!Array.isArray(s.sessions))s.sessions=[];
    if(!['questions','stories','practice','introduction','notes'].includes(s.view))s.view='questions';
    if(!D.questions.some(function(q){return q.id===s.qid;}))s.qid=D.questions[0].id;
    if(!D.stories.some(function(q){return q.id===s.sid;}))s.sid=D.stories[0].id;
    if(!['answer','map','follow'].includes(s.tab))s.tab='answer';
    if(!['star','spoken','follow'].includes(s.storyTab))s.storyTab='star';
    if(![60,90,120].includes(Number(s.duration)))s.duration=90;
    s.duration=Number(s.duration);s.search=String(s.search||'');return s;
  }
  function persist(){K.write(key,state);}
  function deferSave(){clearTimeout(saveTimeout);saveTimeout=setTimeout(persist,300);}
  function question(){return D.questions.find(function(q){return q.id===state.qid;})||D.questions[0];}
  function story(){return D.stories.find(function(q){return q.id===state.sid;})||D.stories[0];}
  function list(items){return '<ul>'+items.map(function(t){return '<li>'+e(t)+'</li>';}).join('')+'</ul>';}
  function status(value){return value==='ready'?'<span class="status-text">可练口述</span>':'<span class="status-text needs-detail">需补充真实细节</span>';}
  function selected(value,current){return value===current?' selected':'';}
  function button(action,label,kind,extra){return '<button type="button" class="btn '+(kind||'')+'" data-action="'+action+'" '+(extra||'')+'>'+label+'</button>';}
  function tabs(items,current,action){return '<div class="tabs" role="group" aria-label="内容视图">'+items.map(function(t){return '<button type="button" class="tab '+(current===t[0]?'active':'')+'" aria-pressed="'+(current===t[0])+'" data-action="'+action+'" data-id="'+t[0]+'">'+t[1]+'</button>';}).join('')+'</div>';}
  function missingBox(item){return item.status==='needs-details'||item.readiness==='needs-details'?'<div class="callout callout-warn"><strong>先补事实，再练完整故事</strong><p>以下是已有事实或填写骨架；方括号内容需用真实经历替换。</p>'+(item.missingFacts&&item.missingFacts.length?list(item.missingFacts):'')+'</div>':'';}
  function noteField(id,label){return '<label class="field"><span>'+e(label||'我的事实补充 / Notes')+'</span><textarea class="textarea" data-note="'+e(id)+'" placeholder="补充真实背景、我的行动、结果与验证依据。笔记只保存在当前浏览器。">'+e(state.notes[id]||'')+'</textarea></label>';}
  function followUps(items){return (items||[]).map(function(f){return '<div class="follow-item"><h3>'+e(typeof f==='string'?f:f.q)+'</h3>'+(f.guide?'<p class="muted">'+e(f.guide)+'</p>':'')+'</div>';}).join('')||'<p class="muted">先练清楚问题、行动和结果，再尝试追问。</p>';}
  function words(text){return String(text||'').trim().split(/\s+/).filter(Boolean).length;}
  function filtered(){var term=state.search.toLowerCase();return D.questions.filter(function(q){return (state.category==='All'||q.category===state.category)&&(!term||(q.title+' '+q.category+' '+q.intent+' '+q.answer).toLowerCase().includes(term));});}
  function render(){
    var titles={questions:['Behavioral practice','English answers. Real experiences.'],stories:[D.stories.length+' reusable stories','同一段真实经历，回答不同角度的问题。'],practice:['Practice','先自己说，再看答案与自查。'],introduction:['Introduction','已定稿 · 保留你的最终版本。'],notes:['Preparation notes','补齐事实，区分已做经历与假设设计。']};
    document.getElementById('page-title').textContent=titles[state.view][0];
    document.getElementById('page-subtitle').textContent=titles[state.view][1];
    document.querySelectorAll('#navigation [data-view]').forEach(function(el){el.classList.toggle('active',el.dataset.view===state.view);if(el.dataset.view===state.view)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');});
    if(state.view==='questions')renderQuestions();
    if(state.view==='stories')renderStories();
    if(state.view==='practice')renderPractice();
    if(state.view==='introduction')renderIntroduction();
    if(state.view==='notes')renderNotes();
  }
  function renderQuestions(){
    var qs=filtered(),q=question(),cats=['All','Motivation','Teamwork','Ownership'];
    if(qs.length&&!qs.some(function(x){return x.id===q.id;})){state.qid=qs[0].id;q=question();}
    var rail='<div class="rail"><label class="sr-only" for="question-search">搜索问题</label><input id="question-search" class="search" type="search" placeholder="Search questions…" value="'+e(state.search)+'"><div class="filterbar" role="group" aria-label="常用题目分类">'+cats.map(function(c){return '<button type="button" data-action="category" data-id="'+e(c)+'" class="'+(state.category===c?'active':'')+'" aria-pressed="'+(state.category===c)+'">'+e(c==='Teamwork'?'Collaboration':c)+'</button>';}).join('')+'</div><label class="sr-only" for="category-select">所有题目分类</label><select id="category-select" aria-label="所有题目分类"><option value="All">All topics · '+D.questions.length+' questions</option>'+Array.from(new Set(D.questions.map(function(x){return x.category;}))).map(function(c){return '<option value="'+e(c)+'"'+selected(c,state.category)+'>'+e(c)+'</option>';}).join('')+'</select><p class="rail-label" style="margin-top:12px">'+qs.length+' questions · '+Object.keys(state.practiced).filter(function(id){return state.practiced[id];}).length+' 已练</p><label class="sr-only" for="question-mobile">选择问题</label><select class="mobile-picker" id="question-mobile">'+qs.map(function(x){return '<option value="'+e(x.id)+'"'+selected(x.id,q.id)+'>'+e(x.title)+'</option>';}).join('')+'</select><div class="rail-list">'+qs.map(function(x){return '<button type="button" class="rail-item '+(x.id===q.id?'active':'')+'" data-action="question" data-id="'+e(x.id)+'"><strong>'+e(x.title)+'</strong><span class="rail-meta">'+e(x.category)+(state.practiced[x.id]?' · 已练':'')+(x.status==='needs-details'?' · 待补细节':'')+'</span></button>';}).join('')+(qs.length?'':'<div class="empty">没有匹配问题，请换个关键词。</div>')+'</div></div>';
    if(!qs.length){workspace.innerHTML='<div class="split">'+rail+'<div class="detail empty">没有匹配问题。'+button('clear-filters','清除筛选','btn-quiet')+'</div></div>';return;}
    var detail=tabs([['answer','Answer'],['map','Story map'],['follow','Follow-ups']],state.tab,'question-tab')+'<h2>'+e(q.title)+'</h2>';
    detail+='<div class="summary-line"><span>'+e(q.category)+'</span>'+status(q.status)+'<span>参考稿 '+words(q.answer)+' words</span></div>';
    if(state.tab==='answer'){
      detail+=missingBox(q)+'<div class="answer-title"><h3>参考回答 · English</h3></div><div class="answer-text">'+p(q.id==='introduction'?D.introLocked:q.answer)+'</div><section class="section"><h3>这题在看什么</h3><p>'+e(q.intent)+'</p><h3>回答结构</h3>'+list(q.outline||[])+'</section>';
    }
    if(state.tab==='map'){
      detail+='<p class="muted">选择故事，换一个侧重点回答这道题。</p><div class="plain-list">'+(q.storyIds||[]).map(function(id){var s=D.stories.find(function(x){return x.id===id;});return s?'<div class="plain-row"><div><h3>'+e(s.title)+'</h3><p class="muted">'+e(s.subtitle)+'</p></div>'+button('story', '打开故事', 'btn-small','data-id="'+e(s.id)+'"')+'</div>':'';}).join('')+((q.storyIds||[]).length?'':'<p class="muted">这题以动机、当前事实或提问为主，不需要强行套 STAR。</p>')+'</div>';
    }
    if(state.tab==='follow')detail+=followUps(q.followUps)+((q.missingFacts||[]).length?'<section class="section"><h3>追问前需核对</h3>'+list(q.missingFacts)+'</section>':'')+noteField('q:'+q.id,'我的追问准备 / Notes');
    detail+='<div class="button-row">'+button('practice','Practice this question','btn-primary','data-id="'+e(q.id)+'"')+button('mark',state.practiced[q.id]?'取消已练标记':'Mark as practiced','','data-id="'+e(q.id)+'"')+'</div>'+K.sources(D,q.sourceIds);
    workspace.innerHTML='<div class="split">'+rail+'<article class="detail">'+detail+'</article></div>';
  }
  function renderStories(){
    var s=story(),rail='<div class="rail"><p class="rail-label">'+D.stories.length+' stories · 按问题调整重点</p><label class="sr-only" for="story-mobile">选择故事</label><select id="story-mobile" class="mobile-picker">'+D.stories.map(function(x){return '<option value="'+e(x.id)+'"'+selected(x.id,s.id)+'>'+e(x.title)+'</option>';}).join('')+'</select><div class="rail-list">'+D.stories.map(function(x,i){return '<button type="button" class="rail-item '+(s.id===x.id?'active':'')+'" data-action="story" data-id="'+e(x.id)+'"><strong>'+String(i+1).padStart(2,'0')+'　'+e(x.title)+'</strong><span class="rail-meta">'+e(x.subtitle)+'</span></button>';}).join('')+'</div></div>';
    var detail=tabs([['star','STAR'],['spoken','Spoken answer'],['follow','Follow-ups']],state.storyTab,'story-tab')+'<h2>'+e(s.title)+'</h2><p class="muted">'+e(s.summary)+'</p><div class="summary-line">'+status(s.readiness)+'<span>'+e((s.tags||[]).join(' · '))+'</span></div>';
    if(state.storyTab==='star'){
      detail+='<div class="story-steps">'+[['s','Situation'],['t','Task'],['a','Action'],['r','Result']].map(function(item){return '<section class="story-step"><div class="step-letter">'+item[0].toUpperCase()+'</div><div><h3>'+item[1]+'</h3>'+p(s.star[item[0]])+'</div></section>';}).join('')+'</div><section class="section"><h3>可以用来回答</h3><div class="question-map">'+D.questions.filter(function(q){return (q.storyIds||[]).includes(s.id);}).map(function(q){return '<button type="button" data-action="question" data-id="'+e(q.id)+'">'+e(q.title)+'</button>';}).join('')+'</div></section>';
    }
    if(state.storyTab==='spoken')detail+=missingBox(s)+'<h3>English · 建议 60–90 秒</h3><div class="answer-text">'+p(s.spoken)+'</div><div class="button-row">'+button('practice-story','练相关题目','btn-primary','data-id="'+e(s.id)+'"')+'</div>';
    if(state.storyTab==='follow')detail+=followUps(s.followUps)+'<section class="section"><h3>还需要补齐</h3>'+list(s.missingFacts||[])+noteField('story:'+s.id)+'</section>';
    detail+='<section class="section"><h3>事实边界</h3>'+list(s.guardrails||[])+'</section>'+K.sources(D,s.sourceIds);
    workspace.innerHTML='<div class="split">'+rail+'<article class="detail">'+detail+'</article></div>';
  }
  function elapsed(){return elapsedBase+(runningSince===null?0:Math.floor((Date.now()-runningSince)/1000));}
  function formatTime(sec){return String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0');}
  function tick(){
    var node=document.getElementById('elapsed');if(!node)return;var sec=elapsed();node.textContent=formatTime(sec);node.classList.toggle('over',sec>state.duration);
    var bar=document.getElementById('timer-bar');if(bar)bar.style.width=Math.min(100,sec/state.duration*100)+'%';
    var progress=document.getElementById('timer-progress');if(progress)progress.setAttribute('aria-valuenow',String(Math.min(sec,state.duration)));
  }
  function stopTimer(){elapsedBase=elapsed();runningSince=null;clearInterval(interval);interval=null;}
  function renderPractice(){
    var q=question(),checks=state.checks[q.id]||[],labels=['直接回答了问题','讲清自己的具体行动','结果有事实或验证依据','表达清楚，留出追问空间'];
    var draft=state.drafts[q.id]||'';
    workspace.innerHTML='<div class="reading"><label class="field"><span>选择练习问题</span><select id="practice-select">'+D.questions.map(function(x){return '<option value="'+e(x.id)+'"'+selected(x.id,q.id)+'>'+e(x.title)+(x.status==='needs-details'?' · 待补细节':'')+'</option>';}).join('')+'</select></label><h2>'+e(q.title)+'</h2>'+missingBox(q)+'<div class="timer-controls"><span class="timer" id="elapsed" aria-label="已练习时间">'+formatTime(elapsed())+'</span><label class="sr-only" for="duration-select">目标时长</label><select id="duration-select">'+[60,90,120].map(function(s){return '<option value="'+s+'"'+selected(s,state.duration)+'>'+s+' 秒目标</option>';}).join('')+'</select>'+button('timer-start',runningSince===null?'Start':'正在计时','btn-primary',runningSince===null?'':'disabled')+button('timer-pause','Pause','',runningSince===null?'disabled':'')+button('timer-reset','Reset','btn-quiet')+'</div><div class="progress" id="timer-progress" role="progressbar" aria-label="口述目标时间" aria-valuemin="0" aria-valuemax="'+state.duration+'" aria-valuenow="'+Math.min(elapsed(),state.duration)+'"><span id="timer-bar" style="width:'+Math.min(100,elapsed()/state.duration*100)+'%"></span></div><label class="field"><span>先自己回答 / Recall draft</span><textarea class="textarea" data-draft="'+e(q.id)+'" placeholder="可以先口述，再记关键词。也可以直接写英文回答；不会自动评分。">'+e(draft)+'</textarea></label><div class="button-row">'+button('reveal',reveal?'隐藏参考回答':'查看参考回答','btn-quiet')+button('random','随机下一题','btn-quiet')+'</div>'+(reveal?'<section class="section"><h3>参考回答</h3><div class="answer">'+p(q.id==='introduction'?D.introLocked:q.answer)+'</div><p class="content-note">'+e(q.intent)+'</p></section>':'')+'<section class="section"><h3>自查 · 不是 AI 评分</h3><ul class="check-list">'+labels.map(function(label,i){return '<li><label><input type="checkbox" data-check="'+i+'" '+(checks.includes(i)?'checked':'')+'><span>'+label+'</span></label></li>';}).join('')+'</ul><div class="button-row">'+button('save-practice','保存本次练习','btn-primary')+'</div><p class="content-note">录入的草稿、自查与练习记录保存在当前浏览器。没有录音或语音识别。</p></section></div>';
  }
  function renderIntroduction(){
    workspace.innerHTML='<article class="reading"><div class="summary-line"><span class="status-text">用户最终定稿 · 原样保留</span><span>'+words(D.introLocked)+' words</span></div><div class="answer-text">'+p(D.introLocked)+'</div><div class="button-row">'+button('practice','计时练习','btn-primary','data-id="introduction"')+button('copy-intro','复制全文','btn-quiet')+'</div><section class="section"><h3>练习提示</h3><p>按背景、职责、强项、真实项目和下一步组织表达。停顿自然，具体细节留给追问。</p>'+noteField('introduction','我的口述提示（不修改定稿）')+'</section></article>';
  }
  function renderNotes(){
    var pending=D.questions.filter(function(q){return q.status==='needs-details';});
    var facts=Array.isArray(D.factNotes)?D.factNotes:[];
    workspace.innerHTML='<article class="reading"><h2>事实与准备缺口</h2><p class="muted">参考答案是练习稿。下面这些边界与待补事实，决定你能否接住追问。</p>'+facts.map(function(x){return '<section class="fact-line"><strong>'+e(x[0])+'</strong><p>'+e(x[1])+'</p></section>';}).join('')+'<section class="section"><h3>'+pending.length+' 道题需要补充事实</h3><div class="plain-list">'+pending.map(function(q){return '<div class="plain-row"><div><h3>'+e(q.title)+'</h3><p class="muted">'+e((q.missingFacts||[]).join('；'))+'</p></div>'+button('question','打开','btn-small','data-id="'+e(q.id)+'"')+'</div>';}).join('')+'</div></section>'+noteField('general','准备笔记')+'<section class="section"><h3>导出与迁移</h3><p>进度文件包含你的草稿、笔记、自查和练习记录。题库内容也单独提供，方便以后接入 Learning Website。</p><div class="button-row">'+button('export','Export progress','btn-primary')+button('export-content','导出题库内容','')+'</div><label class="field"><span>导入本页的进度文件</span><input type="file" id="import-progress" class="file-input" accept=".json,application/json"></label><p class="content-note">导入会替换当前行为练习进度；基础训练进度独立保存。题库中的已确认事实不会被导入文件修改。</p></section><section class="section"><h3>参考来源</h3><div class="source-list">'+(D.sources||[]).map(function(s){return '<div class="source-item">'+(/^https:\/\//.test(s.url||'')?'<a href="'+e(s.url)+'" target="_blank" rel="noopener noreferrer">'+e(s.title)+'</a>':'<span>'+e(s.title)+'</span>')+'</div>';}).join('')+'</div></section></article>';
  }
  function go(view){if(state.view==='practice'&&view!=='practice')stopTimer();state.view=view;persist();render();}
  function exportProgress(){K.download('behavior-progress.json',{kind:'behavior-progress',schemaVersion:1,savedAt:new Date().toISOString(),state:state});}
  function startPractice(id){stopTimer();elapsedBase=0;reveal=false;state.qid=id;go('practice');}
  document.getElementById('navigation').addEventListener('click',function(ev){var el=ev.target.closest('[data-view]');if(el){go(el.dataset.view);window.scrollTo(0,0);}});
  document.getElementById('export-button').addEventListener('click',exportProgress);
  workspace.addEventListener('click',function(ev){
    var el=ev.target.closest('[data-action]');if(!el)return;var action=el.dataset.action,id=el.dataset.id,q=question();
    if(action==='question'){state.qid=id;state.tab='answer';go('questions');return;}
    if(action==='category'){state.category=id;persist();render();return;}
    if(action==='clear-filters'){state.search='';state.category='All';persist();render();return;}
    if(action==='question-tab'){state.tab=id;persist();render();return;}
    if(action==='story'){state.sid=id;state.storyTab='star';go('stories');return;}
    if(action==='story-tab'){state.storyTab=id;persist();render();return;}
    if(action==='practice'){startPractice(id);return;}
    if(action==='practice-story'){var mapped=D.questions.find(function(x){return (x.storyIds||[]).includes(id)&&x.status==='ready';})||D.questions.find(function(x){return (x.storyIds||[]).includes(id);});if(mapped)startPractice(mapped.id);return;}
    if(action==='mark'){state.practiced[id]=!state.practiced[id];persist();render();return;}
    if(action==='timer-start'){if(runningSince===null){runningSince=Date.now();interval=setInterval(tick,250);}render();return;}
    if(action==='timer-pause'){stopTimer();render();return;}
    if(action==='timer-reset'){stopTimer();elapsedBase=0;render();return;}
    if(action==='reveal'){reveal=!reveal;render();return;}
    if(action==='random'){var pool=D.questions.filter(function(x){return x.status==='ready'&&x.id!==q.id;});if(pool.length)startPractice(pool[Math.floor(Math.random()*pool.length)].id);return;}
    if(action==='save-practice'){stopTimer();state.sessions.push({qid:q.id,at:new Date().toISOString(),seconds:elapsedBase,checks:state.checks[q.id]||[]});state.practiced[q.id]=true;persist();render();K.toast('本次练习已保存。');return;}
    if(action==='copy-intro'){if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(D.introLocked).then(function(){K.toast('Introduction 已复制。');}).catch(function(){K.toast('当前浏览器无法复制，请选中文本手动复制。');});else K.toast('当前浏览器无法复制，请选中文本手动复制。');return;}
    if(action==='export')exportProgress();
    if(action==='export-content')K.download('behavior-content.json',D);
  });
  workspace.addEventListener('input',function(ev){
    var el=ev.target;
    if(el.id==='question-search'){var pos=el.selectionStart;state.search=el.value;renderQuestions();var again=document.getElementById('question-search');again.focus();if(again.type!=='search')again.setSelectionRange(pos,pos);deferSave();}
    if(el.dataset.note){state.notes[el.dataset.note]=el.value;deferSave();}
    if(el.dataset.draft){state.drafts[el.dataset.draft]=el.value;deferSave();}
  });
  workspace.addEventListener('change',function(ev){
    var el=ev.target;
    if(el.id==='category-select'){state.category=el.value;persist();render();}
    if(el.id==='question-mobile'){state.qid=el.value;state.tab='answer';persist();render();}
    if(el.id==='story-mobile'){state.sid=el.value;state.storyTab='star';persist();render();}
    if(el.id==='practice-select')startPractice(el.value);
    if(el.id==='duration-select'){state.duration=Number(el.value);persist();render();}
    if(el.dataset.check!==undefined){var id=question().id,checks=new Set(state.checks[id]||[]);if(el.checked)checks.add(Number(el.dataset.check));else checks.delete(Number(el.dataset.check));state.checks[id]=Array.from(checks);persist();}
    if(el.id==='import-progress'&&el.files[0])el.files[0].text().then(function(text){var data=JSON.parse(text);if(data.kind!=='behavior-progress'||data.schemaVersion!==1||!data.state||typeof data.state!=='object'||Array.isArray(data.state))throw Error('Invalid');stopTimer();state=normalize(data.state);persist();render();K.toast('行为练习进度已导入。');}).catch(function(){K.toast('文件格式不匹配，请导入行为页导出的进度 JSON。');});
  });
  window.addEventListener('pagehide',function(){clearTimeout(saveTimeout);persist();});
  render();
  return {suspend:function(){
    clearTimeout(saveTimeout);stopTimer();persist();
    if(state.view==='practice')render();
  }};
};
