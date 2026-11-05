/* Canonical data stays unchanged; only displayed text is localized. */
function chooseAtlasLanguage(preference = 'auto', languages = []) {
  if (preference === 'zh' || preference === 'en') return preference;
  for (const language of languages) {
    const base = String(language).toLowerCase().split(/[-_]/)[0];
    if (base === 'zh' || base === 'en') return base;
  }
  return 'en';
}
function makeAtlasTranslator(dictionary = {}) {
  const keys = Object.keys(dictionary).filter(key => /[\u3400-\u9fff]/.test(key)).sort((a,b)=>b.length-a.length);
  const escape = s => s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const pattern = keys.length ? new RegExp(keys.map(escape).join('|'),'g') : null;
  return value => {
    const text = String(value ?? '');
    if (!/[\u3400-\u9fff]/.test(text)) return text;
    if (Object.hasOwn(dictionary,text)) return dictionary[text];
    return pattern ? text.replace(pattern,match=>dictionary[match]) : text;
  };
}
if (typeof module !== 'undefined' && module.exports) module.exports = {chooseAtlasLanguage,makeAtlasTranslator};
if (typeof window !== 'undefined') {
  const dictionary = {...ATLAS_TRANSLATIONS.content,...ATLAS_TRANSLATIONS.ui};
  const translateEnglish = makeAtlasTranslator(dictionary);
  const textRecords = new WeakMap(),attributeRecords = new WeakMap(),searchCache=new WeakMap();
  let observer,preference='auto';
  try {preference=localStorage.getItem('atlas-language')||'auto';} catch {}
  const requested = new URLSearchParams(location.search).get('lang');
  if (['en','zh','auto'].includes(requested)) preference=requested;
  if (!['en','zh','auto'].includes(preference)) preference='auto';
  let language=chooseAtlasLanguage(preference,navigator.languages||[navigator.language]);
  function localized(text){return language==='en'?translateEnglish(text).replace(/，/g,', ').replace(/。/g,'. ').replace(/；/g,'; ').replace(/：/g,': ').replace(/（/g,' (').replace(/）/g,')').replace(/、/g,', '):String(text??'');}
  function apply(root=document.body) {
    if (!root) return;
    observer?.disconnect();
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    let node;
    while ((node=walker.nextNode())) {
      const parent=node.parentElement;
      if (!parent||parent.closest('script,style,pre,code,textarea,[translate="no"]')) continue;
      let record=textRecords.get(node);
      if(!record||node.nodeValue!==record.display)record={source:node.nodeValue,display:node.nodeValue};
      const display=localized(record.source);
      if(node.nodeValue!==display)node.nodeValue=display;
      record.display=display;textRecords.set(node,record);
    }
    for(const el of root.querySelectorAll('[placeholder],[title],[aria-label],[alt]')) {
      if(el.closest('[translate="no"]'))continue;
      let records=attributeRecords.get(el)||{};
      for(const attr of ['placeholder','title','aria-label','alt']) {
        if(!el.hasAttribute(attr))continue;
        const current=el.getAttribute(attr);
        let record=records[attr];
        if(!record||current!==record.display)record={source:current,display:current};
        const display=localized(record.source);
        if(display!==current)el.setAttribute(attr,display);
        record.display=display;records[attr]=record;
      }
      attributeRecords.set(el,records);
    }
    document.documentElement.lang=language==='zh'?'zh-CN':'en';
    const description=document.querySelector('meta[name="description"]');
    if(description)description.content=language==='zh'?'无线通信数据生产流程、科研选型、资源对比与官方材料的在线知识库':'Wireless data production, research selection, resource comparisons, and official reference materials.';
    const picker=document.getElementById('language-select');
    if(picker){picker.value=preference;picker.setAttribute('aria-label','Language / 语言');}
    observer?.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['placeholder','title','aria-label','alt']});
  }
  function setPreference(value,persist=true) {
    if(!['en','zh','auto'].includes(value))return;
    preference=value;
    if(persist){
      try{localStorage.setItem('atlas-language',value);}catch{}
      const url=new URL(location.href);url.searchParams.delete('lang');history.replaceState(null,'',url);
    }
    language=chooseAtlasLanguage(preference,navigator.languages||[navigator.language]);
    apply();window.AtlasI18n.onChange?.();
  }
  function searchText(value) {
    if(value&&typeof value==='object'&&searchCache.has(value))return searchCache.get(value);
    const terms=[JSON.stringify(value)];
    const visit=item=>{if(typeof item==='string')terms.push(translateEnglish(item));else if(Array.isArray(item))item.forEach(visit);else if(item&&typeof item==='object')Object.values(item).forEach(visit);};
    visit(value);
    const result=terms.join(' ').toLowerCase();
    if(value&&typeof value==='object')searchCache.set(value,result);
    return result;
  }
  window.AtlasI18n={apply,setPreference,searchText,translate:localized,get language(){return language;},get preference(){return preference;},onChange:null};
  observer=new MutationObserver(()=>apply());
  document.addEventListener('change',event=>{if(event.target.id==='language-select')setPreference(event.target.value);});
  window.addEventListener('languagechange',()=>{if(preference==='auto')setPreference('auto',false);});
  apply();
}
