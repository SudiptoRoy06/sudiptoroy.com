import {useEffect,useRef,useState} from 'react';
import {useNavigate} from 'react-router-dom';
import Logo from '../components/Logo';
import {useAuth} from './auth';

const groups=[
  ['Profile & about','#profile-about'],['Skills','#skills'],['Projects','#projects'],
  ['Employment','#employment'],['Contact & social','#contact-social'],['Portrait & CV','#portrait-cv']
];
const empty={
  skills:{name:'',description:''},
  projects:{title:'',summary:'',technologies:[],url:'',repositoryUrl:'',image:'',published:true},
  experience:{role:'',company:'',period:'',summary:''}
};

export default function Admin(){
  const [data,setData]=useState(null),[notice,setNotice]=useState(''),[sidebar,setSidebar]=useState(false),{setUser}=useAuth(),nav=useNavigate(),toggle=useRef(null),aside=useRef(null);
  useEffect(()=>{apiFetch('/api/admin/content').then(setData).catch(error=>setNotice(`Error: ${error.message}`))},[]);
  useEffect(()=>{if(!sidebar)return;const first=aside.current?.querySelector('a,button');first?.focus();const close=e=>{if(e.key==='Escape'){setSidebar(false);toggle.current?.focus()}};document.addEventListener('keydown',close);return()=>document.removeEventListener('keydown',close)},[sidebar]);
  async function logout(){await apiFetch('/api/auth/logout',{method:'POST'}).catch(()=>{});setUser(null);nav('/admin/login')}
  async function saveProfile(e,fields){
    e.preventDefault();setNotice('Saving…');
    const form=new FormData(e.currentTarget);
    const profile={...data.profile};
    fields.forEach(field=>{profile[field]=field==='available'?form.get(field)==='on':form.get(field)});
    const payload={headline:profile.headline,bio:profile.bio,email:profile.email,available:profile.available};
    try{
      await apiFetch('/api/admin/profile',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      setData(current=>({...current,profile:{...current.profile,...payload}}));
      setNotice('Section published successfully.');
    }catch(error){setNotice(`Error: ${error.message}`)}
  }
  return <div className="admin">
    <button ref={toggle} className="admin-menu" onClick={()=>setSidebar(v=>!v)} aria-expanded={sidebar} aria-controls="admin-sidebar"><span aria-hidden="true">☰</span> Studio menu</button>
    {sidebar&&<button className="sidebar-scrim" aria-label="Close studio menu" onClick={()=>setSidebar(false)}/>}
    <aside ref={aside} id="admin-sidebar" className={sidebar?'open':''} aria-label="Content studio">
      <button className="sidebar-close" onClick={()=>{setSidebar(false);toggle.current?.focus()}} aria-label="Close studio menu">×</button>
      <a className="admin-brand" href="/"><Logo/></a><p>Content studio</p>
      <nav aria-label="Studio sections">{groups.map(([label,href],i)=><a key={href} onClick={()=>setSidebar(false)} href={href}>{String(i+1).padStart(2,'0')} {label}</a>)}</nav>
      <button className="sign-out" onClick={logout}>Sign out</button>
    </aside>
    <main id="admin-content">
      <div className="admin-head"><div><p className="section-no">OVERVIEW</p><h1>Portfolio control room</h1></div><a href="/" target="_blank" rel="noreferrer">View live site <span aria-hidden="true">↗</span><span className="sr-only"> (opens in a new tab)</span></a></div>
      {notice&&<Toast message={notice} type={isErrorNotice(notice)?'error':'success'} onClose={()=>setNotice('')}/>}
      {!data&&!notice?<div className="loading">Loading content…</div>:data&&<>
        <div className="stats" aria-label="Content totals"><article><b>{data.skills.length}</b><span>Skills</span></article><article><b>{data.projects.length}</b><span>Projects</span></article><article><b>{data.experience.length}</b><span>Roles</span></article></div>
        <form className="editor" id="profile-about" onSubmit={e=>saveProfile(e,['headline','bio','available'])}>
          <h2>Profile & about</h2><label>Professional headline<input name="headline" defaultValue={data.profile.headline} required minLength="3"/></label><label>About biography<textarea name="bio" rows="6" defaultValue={data.profile.bio} required minLength="10"/></label><label className="check"><input name="available" type="checkbox" defaultChecked={data.profile.available}/> <span>Available for opportunities</span></label><SectionActions label="profile"/>
        </form>
        <CollectionEditor section="skills" id="skills" title="Skills" items={data.skills} setData={setData} setNotice={setNotice}/>
        <CollectionEditor section="projects" id="projects" title="Projects" items={data.projects} setData={setData} setNotice={setNotice}/>
        <CollectionEditor section="experience" id="employment" title="Employment" items={data.experience} setData={setData} setNotice={setNotice}/>
        <form className="editor" id="contact-social" onSubmit={e=>saveProfile(e,['email'])}>
          <h2>Contact & social</h2><label>Public email<input name="email" type="email" inputMode="email" defaultValue={data.profile.email}/></label><p className="editor-hint">This email is used by the contact action on your public portfolio.</p><SectionActions label="contact details"/>
        </form>
        <section id="portrait-cv" className="admin-section"><h2>Portrait & CV</h2><Upload title="Replace portrait" field="portrait" accept="image/jpeg,image/png,image/webp" capture="user" setNotice={setNotice}/><Upload title="Replace CV" field="cv" accept="application/pdf,.pdf" setNotice={setNotice}/></section>
      </>}
    </main>
  </div>;
}

function CollectionEditor({section,id,title,items,setData,setNotice}){
  const [drafts,setDrafts]=useState(()=>items.map(normalize));
  const update=(index,field,value)=>setDrafts(current=>current.map((item,i)=>i===index?{...item,[field]:value}:item));
  const remove=index=>setDrafts(current=>current.filter((_,i)=>i!==index));
  const add=()=>setDrafts(current=>[...current,{...empty[section],_key:crypto.randomUUID()}]);
  async function save(e){
    e.preventDefault();setNotice(`Saving ${title.toLowerCase()}…`);
    const payload=drafts.map(({_key,id,...item})=>section==='projects'?{...item,technologies:typeof item.technologies==='string'?item.technologies.split(',').map(x=>x.trim()).filter(Boolean):item.technologies}:item);
    try{
      const result=await apiFetch(`/api/admin/${section}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({items:payload})});
      setData(current=>({...current,[section]:result.items}));setDrafts(result.items.map(normalize));setNotice(`${title} published successfully.`);
    }catch(error){setNotice(`Error: ${error.message}`)}
  }
  return <form className="editor collection-editor" id={id} onSubmit={save}>
    <div className="editor-title"><h2>{title}</h2><button className="button small secondary" type="button" onClick={add}>+ Add {section==='experience'?'experience':title.slice(0,-1).toLowerCase()}</button></div>
    {!drafts.length&&<p className="empty">No {title.toLowerCase()} yet. Add the first one.</p>}
    {drafts.map((item,index)=><fieldset key={item.id||item._key}><legend>{title.slice(0,-1)} {index+1}</legend><EditorFields section={section} item={item} update={(field,value)=>update(index,field,value)}/><button className="remove-item" type="button" onClick={()=>remove(index)}>Remove</button></fieldset>)}
    <SectionActions label={title.toLowerCase()}/>
  </form>;
}

function EditorFields({section,item,update}){
  if(section==='skills')return <><label>Skill name<input value={item.name} onChange={e=>update('name',e.target.value)} required maxLength="100"/></label><label>Description<textarea rows="3" value={item.description} onChange={e=>update('description',e.target.value)} maxLength="1000"/></label></>;
  if(section==='experience')return <><div className="field-row"><label>Role<input value={item.role} onChange={e=>update('role',e.target.value)} required/></label><label>Company<input value={item.company} onChange={e=>update('company',e.target.value)} required/></label></div><label>Period<input value={item.period} onChange={e=>update('period',e.target.value)} placeholder="2024 – Present"/></label><label>Summary<textarea rows="4" value={item.summary} onChange={e=>update('summary',e.target.value)} required/></label></>;
  return <><label>Project title<input value={item.title} onChange={e=>update('title',e.target.value)} required/></label><label>Summary<textarea rows="4" value={item.summary} onChange={e=>update('summary',e.target.value)} required/></label><label>Technologies <span className="label-hint">(comma separated)</span><input value={item.technologies} onChange={e=>update('technologies',e.target.value)} placeholder="React, Node.js"/></label><div className="field-row"><label>Live URL<input type="url" value={item.url} onChange={e=>update('url',e.target.value)}/></label><label>Repository URL<input type="url" value={item.repositoryUrl} onChange={e=>update('repositoryUrl',e.target.value)}/></label></div><label>Image URL<input value={item.image} onChange={e=>update('image',e.target.value)}/></label><label className="check"><input type="checkbox" checked={item.published} onChange={e=>update('published',e.target.checked)}/> <span>Published on the portfolio</span></label></>;
}

function normalize(item){return {...item,_key:item.id||crypto.randomUUID(),technologies:Array.isArray(item.technologies)?item.technologies.join(', '):item.technologies}}
function SectionActions({label}){return <div className="section-actions"><button className="button">Save {label}</button></div>}
function Upload({title,field,accept,capture,setNotice}){async function send(e){e.preventDefault();try{await apiFetch(`/api/admin/upload/${field}`,{method:'POST',body:new FormData(e.currentTarget)});setNotice('Upload published.')}catch(error){setNotice(`Error: ${error.message}`)}}return <form className="editor upload" onSubmit={send}><h3>{title}</h3><label className="file-label">Choose {field} file<input type="file" name="file" accept={accept} capture={capture} required/></label><button className="button small">Upload</button></form>}

function Toast({message,type,onClose}){
  useEffect(()=>{const timer=setTimeout(onClose,5000);return()=>clearTimeout(timer)},[message,onClose]);
  return <div className={`toast ${type}`} role={type==='error'?'alert':'status'}><span>{message}</span><button type="button" onClick={onClose} aria-label="Dismiss notification">×</button></div>;
}

function isErrorNotice(message){return /error|unable|could not|failed|required|expired|invalid|rejected|wrong/i.test(message)}

async function apiFetch(url,options={}){
  let response;
  try{response=await fetch(url,{...options,credentials:'include'})}
  catch{throw new Error('Could not reach the server. Please try again.')}
  const body=response.status===204?null:await response.json().catch(()=>null);
  if(!response.ok)throw new Error(body?.error||(response.status===401?'Authentication required. Please sign in again.':'Something went wrong. Please try again.'));
  return body;
}
