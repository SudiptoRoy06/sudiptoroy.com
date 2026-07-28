import {useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {Link, useParams} from 'react-router-dom';
import Logo from '../components/Logo';
import {apiUrl, assetUrl} from '../api';
import {SkillIcon} from '../skill-icons';
import {siGithub,siWordpress} from 'simple-icons';

const fallback = {
  profile: {
    name: 'Sudipto Roy',
    headline: 'Software engineer crafting dependable digital products.',
    bio: 'I turn complex problems into clear, accessible experiences—pairing product thinking with pragmatic engineering.',
    available: true,
    portrait: '/images/portrait-placeholder.svg',
    cv: null,
    email: '',
    phone: '',
    linkedinUrl: '',
    githubUrl: '',
    wordpressUrl: '',
  },
  skills: ['React & TypeScript', 'Node.js & APIs', 'Product engineering', 'Accessible UI'],
  experience: [{id: 1, role: 'Software Engineer', company: 'Employment details to verify', period: 'Dates to verify', summary: 'Impact and responsibilities awaiting Sudipto’s review.'}],
  projects: [{id: 1, title: 'Featured work coming soon', summary: 'Verified case studies will appear here after publication.', stack: 'React · Node.js', url: ''}],
  customSections: [],
};
const imageSet = (src) => src ? `${src}?w=480 480w, ${src}?w=800 800w, ${src}?w=1200 1200w` : undefined;
function Reveal({children, className = ''}) {
  return <div className={`reveal ${className}`}>{children}</div>;
}
function TechAccent({variant}) {
  return <div className={`section-motion ${variant}`} aria-hidden="true"><i/><i/><i/><span/></div>;
}
function ContactIcon({type}) {
  const brand={github:siGithub,wordpress:siWordpress}[type];
  if(brand)return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d={brand.path}/></svg>;
  if(type==='linkedin')return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4.7 3A1.7 1.7 0 1 1 4.7 6.4 1.7 1.7 0 0 1 4.7 3ZM3.2 8h3v12.8h-3V8Zm5.2 0h2.9v1.8h.1c.8-1.4 2.2-2.2 3.9-2.2 4.1 0 4.9 2.7 4.9 6.3v6.9h-3v-6.1c0-1.5 0-4.3-2.6-4.3s-3 2-3 4.1v6.3h-3V8Z"/></svg>;
  if(type==='email')return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6.5h18v12H3zM3.5 7l8.5 7 8.5-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.1 3.5 10 7.3 8.2 9.5c1.3 2.7 3.5 4.9 6.2 6.2l2.3-1.8 3.8 2.9-.8 3c-.2.7-.8 1.2-1.6 1.2C10 20.6 3.4 14 3 5.9c0-.7.5-1.4 1.2-1.6l2.9-.8Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>;
}
const excerpt = (text, limit = 15) => {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean);
  return words.length > limit ? `${words.slice(0, limit).join(' ')}…` : words.join(' ');
};

function ProjectShowcase({projects}) {
  const [selected,setSelected]=useState(null);
  const [imageIndex,setImageIndex]=useState(0);
  const trackRef=useRef(null),closeRef=useRef(null),openerRef=useRef(null);
  const openProject=(project,event)=>{openerRef.current=event.currentTarget;setImageIndex(0);setSelected(project)};
  const close=()=>{setSelected(null);requestAnimationFrame(()=>openerRef.current?.focus())};
  const scroll=direction=>trackRef.current?.scrollBy({left:direction*trackRef.current.clientWidth*.8,behavior:'smooth'});
  useEffect(()=>{
    if(!selected)return;
    closeRef.current?.focus();
    const previous=document.body.style.overflow;
    document.body.style.overflow='hidden';
    const onKey=event=>{if(event.key==='Escape')close()};
    document.addEventListener('keydown',onKey);
    return()=>{document.body.style.overflow=previous;document.removeEventListener('keydown',onKey)};
  },[selected]);
  if(!projects.length)return <p className="empty">No projects have been published yet.</p>;
  const modalImages=selected?(selected.images?.length?selected.images:(selected.image?[selected.image]:[])).map(assetUrl):[];
  const changeImage=direction=>setImageIndex(index=>(index+direction+modalImages.length)%modalImages.length);
  return <><div className="project-slider-wrap"><div className="slider-controls" aria-label="Project slider controls"><button type="button" onClick={()=>scroll(-1)} aria-label="Previous projects">←</button><button type="button" onClick={()=>scroll(1)} aria-label="Next projects">→</button></div><div className="project-slider" ref={trackRef}>{projects.map(project=><button className="project-card" type="button" key={project.id} onClick={event=>openProject(project,event)}><span className="project-card-logo">{project.logo?<img src={assetUrl(project.logo)} alt="" loading="lazy"/>:<b aria-hidden="true">{project.title?.trim().charAt(0)||'P'}</b>}</span><span className="project-card-copy"><strong>{project.title}</strong><span>{excerpt(project.summary)}</span></span><span className="project-card-action">View details <i aria-hidden="true">↗</i></span></button>)}</div></div>
    {selected&&createPortal(<div className="project-modal-backdrop" onMouseDown={event=>event.target===event.currentTarget&&close()}><section className="project-modal" role="dialog" aria-modal="true" aria-labelledby="project-modal-title"><button ref={closeRef} type="button" className="modal-close" onClick={close} aria-label="Close project details">×</button><div className="modal-media">{modalImages.length>0?<><div className="modal-slide"><img src={modalImages[imageIndex]} alt={`${selected.title} screenshot ${imageIndex+1} of ${modalImages.length}`}/>{modalImages.length>1&&<><button type="button" className="slide-prev" onClick={()=>changeImage(-1)} aria-label="Previous project image">←</button><button type="button" className="slide-next" onClick={()=>changeImage(1)} aria-label="Next project image">→</button></>}</div>{modalImages.length>1&&<div className="slide-dots" aria-label="Choose project image">{modalImages.map((image,index)=><button type="button" key={image} className={index===imageIndex?'active':''} onClick={()=>setImageIndex(index)} aria-label={`Show image ${index+1}`} aria-current={index===imageIndex?'true':undefined}/>)}</div>}</>:<div className="modal-image-empty">No project images</div>}</div><div className="modal-copy">{selected.logo&&<img className="project-logo" src={assetUrl(selected.logo)} alt=""/>}<h2 id="project-modal-title">{selected.title}</h2>{selected.technologyIcons?.length>0&&<div className="project-tech-icons" aria-label="Project technologies">{selected.technologyIcons.map(id=><SkillIcon key={id} id={id}/>)}</div>}<p className="modal-stack">{selected.stack}</p><p className="modal-description">{selected.summary}</p><div className="modal-actions">{selected.url&&<a className="button" href={selected.url} rel="noreferrer" target="_blank">Visit live project <span aria-hidden="true">↗</span><span className="sr-only"> (opens in a new tab)</span></a>}{selected.repositoryUrl&&<a className="text-link" href={selected.repositoryUrl} rel="noreferrer" target="_blank">View repository <span aria-hidden="true">↗</span><span className="sr-only"> (opens in a new tab)</span></a>}</div></div></section></div>,document.body)}
  </>;
}

function CustomPost({section,block}){
  const images=(block.images?.length?block.images:(block.image?[block.image]:[])).map(assetUrl);
  const [imageIndex,setImageIndex]=useState(0);
  const changeImage=direction=>setImageIndex(index=>(index+direction+images.length)%images.length);
  const published=block.publishedAt?new Date(block.publishedAt):null;
  const validDate=published&&!Number.isNaN(published.getTime());
  return <article className="custom-post">
    {images.length>0&&<div className="post-hero" aria-label={`${block.heading||section.title} images`}><div className="post-slide" key={images[imageIndex]}><img src={images[imageIndex]} alt={`${block.heading||section.title} image ${imageIndex+1} of ${images.length}`}/></div>{images.length>1&&<><button type="button" className="post-prev" onClick={()=>changeImage(-1)} aria-label="Previous post image">←</button><button type="button" className="post-next" onClick={()=>changeImage(1)} aria-label="Next post image">→</button><div className="post-dots">{images.map((image,index)=><button type="button" key={image} className={index===imageIndex?'active':''} onClick={()=>setImageIndex(index)} aria-label={`Show post image ${index+1}`} aria-current={index===imageIndex?'true':undefined}/>)}</div></>}</div>}
    <header className="post-heading"><p className="section-label">{section.title.toUpperCase()}</p>{block.logo&&<img className="custom-post-logo" src={assetUrl(block.logo)} alt=""/>}<h1>{block.heading||section.title}</h1>{validDate&&<time dateTime={block.publishedAt}>{new Intl.DateTimeFormat(undefined,{dateStyle:'long'}).format(published)}<span aria-hidden="true"> · </span>{new Intl.DateTimeFormat(undefined,{timeStyle:'short'}).format(published)}</time>}</header>
    <div className="custom-post-body">{block.body}</div>
    {block.url&&<a className="button" href={block.url} rel="noreferrer" target="_blank">{block.linkLabel||'Learn more'} <span aria-hidden="true">↗</span></a>}
  </article>;
}

export function CustomSectionPage(){
  const {slug,itemSlug}=useParams();
  const [state,setState]=useState({loading:true,data:null});
  const [theme,setTheme]=useState(()=>{
    const savedTheme=window.localStorage.getItem('theme');
    return savedTheme==='light'||savedTheme==='dark'?savedTheme:'dark';
  });
  useEffect(()=>{
    document.documentElement.dataset.theme=theme;
    document.documentElement.style.colorScheme=theme;
    window.localStorage.setItem('theme',theme);
  },[theme]);
  useEffect(()=>{
    let active=true;
    const controller=new AbortController();
    fetch(apiUrl('/api/content'),{signal:controller.signal})
      .then(response=>response.ok?response.json():Promise.reject())
      .then(data=>active&&setState({loading:false,data}))
      .catch(error=>error?.name!=='AbortError'&&active&&setState({loading:false,data:null}));
    return()=>{active=false;controller.abort()};
  },[]);
  if(state.loading)return <div className="loading" role="status"><Logo/><span>Loading content…</span></div>;
  const section=state.data?.customSections?.find(item=>item.slug===slug);
  if(!section)return <main className="not-found"><p className="eyebrow">404 · Lost signal</p><h1>This page hasn’t shipped.</h1><Link className="button" to="/">Return home</Link></main>;
  const block=itemSlug&&section.itemPresentation==='page'?section.blocks.find(item=>item.slug===itemSlug):null;
  if(itemSlug&&!block)return <main className="not-found"><p className="eyebrow">404 · Lost signal</p><h1>This post hasn’t shipped.</h1><Link className="button" to={`/sections/${section.slug}`}>Return to {section.title}</Link></main>;
  return <><header className="site-header"><nav aria-label="Primary"><Link className="brand-link" to="/" aria-label="Sudipto Roy home"><Logo/></Link><div className="header-controls"><Link className="text-link" to={block?`/sections/${section.slug}`:'/'}>← {block?`Back to ${section.title}`:'Back to portfolio'}</Link><button className="theme-toggle" type="button" onClick={()=>setTheme(value=>value==='dark'?'light':'dark')} aria-label={`Switch to ${theme==='dark'?'light':'dark'} theme`} title={`Current theme: ${theme}`}><span className="theme-copy" aria-hidden="true"><small><i/>THEME</small><b>{theme}</b></span><span className="theme-track" aria-hidden="true"><svg className="theme-sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.25"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"/></svg><svg className="theme-moon" viewBox="0 0 24 24"><path d="M20 15.2A8.5 8.5 0 0 1 8.8 4a8.5 8.5 0 1 0 11.2 11.2Z"/></svg><i className="theme-orbit"/></span></button></div></nav></header><main id="content" className="custom-page">{block?<CustomPost section={section} block={block}/>:<section className="custom-section motion-section"><TechAccent variant="matrix"/><p className="section-label">{section.title.toUpperCase()}</p><h1>{section.title}</h1>{section.intro&&<p className="body-large">{section.intro}</p>}<CustomSectionShowcase section={section}/></section>}</main></>;
}

export function CustomSectionShowcase({section}) {
  const [selected,setSelected]=useState(null),[imageIndex,setImageIndex]=useState(0);
  const trackRef=useRef(null),closeRef=useRef(null),openerRef=useRef(null);
  const close=()=>{setSelected(null);requestAnimationFrame(()=>openerRef.current?.focus())};
  const open=(block,event)=>{openerRef.current=event.currentTarget;setImageIndex(0);setSelected(block)};
  useEffect(()=>{
    if(!selected)return;
    closeRef.current?.focus();
    const previous=document.body.style.overflow;
    document.body.style.overflow='hidden';
    const onKey=event=>event.key==='Escape'&&close();
    document.addEventListener('keydown',onKey);
    return()=>{document.body.style.overflow=previous;document.removeEventListener('keydown',onKey)};
  },[selected]);
  if(!section.blocks.length)return null;
  const images=selected?(selected.images?.length?selected.images:(selected.image?[selected.image]:[])).map(assetUrl):[];
  const changeImage=direction=>setImageIndex(index=>(index+direction+images.length)%images.length);
  return <><div className="project-slider-wrap custom-slider"><div className="slider-controls" aria-label={`${section.title} slider controls`}><button type="button" onClick={()=>trackRef.current?.scrollBy({left:-trackRef.current.clientWidth*.8,behavior:'smooth'})} aria-label={`Previous ${section.title} items`}>←</button><button type="button" onClick={()=>trackRef.current?.scrollBy({left:trackRef.current.clientWidth*.8,behavior:'smooth'})} aria-label={`Next ${section.title} items`}>→</button></div><div className="project-slider" ref={trackRef}>{section.blocks.map((block,index)=>{const content=<><span className="project-card-logo">{block.logo?<img src={assetUrl(block.logo)} alt="" loading="lazy"/>:<b aria-hidden="true">{(block.heading||section.title).trim().charAt(0)}</b>}</span><span className="project-card-copy"><strong>{block.heading||section.title}</strong><span>{excerpt(block.body)}</span></span><span className="project-card-action">View details <i aria-hidden="true">→</i></span></>;return (section.itemPresentation||'modal')==='page'?<Link className="project-card" key={`${section.slug}-${block.slug||index}`} to={`/sections/${section.slug}/${block.slug||index+1}`}>{content}</Link>:<button className="project-card" type="button" key={`${section.slug}-${index}`} onClick={event=>open(block,event)}>{content}</button>})}</div></div>
    {selected&&createPortal(<div className="project-modal-backdrop" onMouseDown={event=>event.target===event.currentTarget&&close()}><section className="project-modal" role="dialog" aria-modal="true" aria-labelledby={`custom-modal-${section.slug}`}><button ref={closeRef} type="button" className="modal-close" onClick={close} aria-label="Close details">×</button><div className="modal-media">{images.length>0?<><div className="modal-slide"><img src={images[imageIndex]} alt={`${selected.heading||section.title} image ${imageIndex+1} of ${images.length}`}/>{images.length>1&&<><button type="button" className="slide-prev" onClick={()=>changeImage(-1)} aria-label="Previous image">←</button><button type="button" className="slide-next" onClick={()=>changeImage(1)} aria-label="Next image">→</button></>}</div>{images.length>1&&<div className="slide-dots" aria-label="Choose image">{images.map((image,index)=><button type="button" key={image} className={index===imageIndex?'active':''} onClick={()=>setImageIndex(index)} aria-label={`Show image ${index+1}`} aria-current={index===imageIndex?'true':undefined}/>)}</div>}</>:<div className="modal-image-empty">No images</div>}</div><div className="modal-copy">{selected.logo&&<img className="project-logo" src={assetUrl(selected.logo)} alt=""/>}<h2 id={`custom-modal-${section.slug}`}>{selected.heading||section.title}</h2><p className="modal-description">{selected.body}</p>{selected.url&&<div className="modal-actions"><a className="button" href={selected.url} rel="noreferrer" target="_blank">{selected.linkLabel||'Learn more'} <span aria-hidden="true">↗</span><span className="sr-only"> (opens in a new tab)</span></a></div>}</div></section></div>,document.body)}
  </>;
}

export default function Site() {
  const [data, setData] = useState(null);
  const [menu, setMenu] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [theme, setTheme] = useState(() => {
    const savedTheme = window.localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
    return 'dark';
  });
  const toggleRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem('theme', theme);
  }, [theme]);
  useEffect(() => {
    const controller = new AbortController();
    fetch(apiUrl('/api/content'), {signal: controller.signal})
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then(setData)
      .catch((error) => error?.name !== 'AbortError' && setData(fallback));
    return () => controller.abort();
  }, []);
  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 400);
    handleScroll();
    window.addEventListener('scroll', handleScroll, {passive: true});
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  useEffect(() => {
    if (!data) return;
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add('shown')), {threshold: .08});
    document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [data]);
  useEffect(() => {
    if (!menu) return;
    const focusable = [...panelRef.current.querySelectorAll('a,button')];
    focusable[0]?.focus();
    const handleKey = (event) => {
      if (event.key === 'Escape') {
        setMenu(false);
        toggleRef.current?.focus();
      }
      if (event.key === 'Tab' && focusable.length) {
        const first = focusable[0];
        const last = focusable.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [menu]);

  if (!data) return <div className="loading" role="status"><Logo/><span>Loading portfolio…</span></div>;
  const profile = {...fallback.profile, ...data.profile};
  profile.portrait = assetUrl(profile.portrait);
  profile.cv = assetUrl(profile.cv);
  const closeMenu = () => setMenu(false);
  const contactItems = [
    profile.email&&{type:'email',label:'Email',value:profile.email,href:`mailto:${profile.email}`},
    profile.phone&&{type:'phone',label:'Phone',value:profile.phone,href:`tel:${profile.phone.replace(/[^\d+]/g,'')}`},
    profile.linkedinUrl&&{type:'linkedin',label:'LinkedIn',value:'Connect professionally',href:profile.linkedinUrl,external:true},
    profile.githubUrl&&{type:'github',label:'GitHub',value:'Explore my code',href:profile.githubUrl,external:true},
    profile.wordpressUrl&&{type:'wordpress',label:'WordPress',value:'Read my profile',href:profile.wordpressUrl,external:true}
  ].filter(Boolean);
  const navItems = [
    {label:'About',slug:'about'},{label:'Skills',slug:'skills'},
    {label:'Experience',slug:'experience'},{label:'Projects',slug:'projects'},
    ...(data.customSections || []).map(section=>({label:section.title,slug:section.slug,href:(section.presentation||'section')==='page'?`/sections/${section.slug}`:`#${section.slug}`})),
    {label:'Contact',slug:'contact'}
  ];

  return <>
    <a className="skip" href="#content">Skip to content</a>
    <header className="site-header">
      <nav aria-label="Primary">
        <a className="brand-link" href="#top" aria-label="Sudipto Roy home"><Logo/></a>
        <div className="header-controls">
          <div ref={panelRef} id="navlinks" className={menu ? 'navlinks open' : 'navlinks'}>
            {navItems.map((item) => <a key={item.slug} onClick={closeMenu} href={item.href||`#${item.slug}`}>{item.label}</a>)}
            <a className="button small" onClick={closeMenu} href={profile.cv || '#contact'} download={profile.cv ? true : undefined}>{profile.cv ? 'Download CV' : 'Request CV'}</a>
          </div>
          <button className="theme-toggle" type="button" onClick={() => setTheme((value) => value === 'dark' ? 'light' : 'dark')} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} title={`Current theme: ${theme}`}>
            <span className="theme-copy" aria-hidden="true"><small><i/>THEME</small><b>{theme}</b></span>
            <span className="theme-track" aria-hidden="true">
              <svg className="theme-sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.25"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"/></svg>
              <svg className="theme-moon" viewBox="0 0 24 24"><path d="M20 15.2A8.5 8.5 0 0 1 8.8 4a8.5 8.5 0 1 0 11.2 11.2Z"/></svg>
              <i className="theme-orbit"/>
            </span>
          </button>
          <button ref={toggleRef} className={`menu ${menu ? 'open' : ''}`} onClick={() => setMenu((value) => !value)} aria-expanded={menu} aria-controls="navlinks" aria-label={`${menu ? 'Close' : 'Open'} navigation menu`}>
            <span aria-hidden="true" className="menu-icon"><i/><i/><i/></span>
          </button>
        </div>
      </nav>
    </header>
    <main id="content">
      <section id="top" className="hero">
        <div className="hero-motion" aria-hidden="true">
          <span className="tech-grid"/>
          <span className="scan-line"/>
          <span className="system-ring"><i/><i/><i/></span>
          <span className="data-path path-one"><i/><i/><i/></span>
          <span className="data-path path-two"><i/><i/></span>
        </div>
        <div className="hero-copy">
          <p className="eyebrow"><i/> {profile.available ? 'Available for the right opportunity' : 'Currently focused on existing work'}</p>
          <h1>Engineering clarity<br/><span>into every interaction.</span></h1>
          <p className="lede">{profile.headline}</p>
          <div className="actions"><a className="button" href="#projects">Explore my work</a><a className="text-link" href="#contact">Start a conversation <span aria-hidden="true">→</span></a></div>
          <div className="metrics" aria-label="Working principles"><span><b>Product-minded</b>Engineering</span><span><b>Accessible</b>By default</span><span><b>Reliable</b>From UI to API</span></div>
        </div>
        <div className="portrait-wrap"><picture><source srcSet={imageSet(profile.portrait)} sizes="(max-width: 480px) 82vw, (max-width: 900px) 360px, 32vw"/><img src={profile.portrait} width="720" height="720" fetchPriority="high" alt="Sudipto Roy"/></picture><span className="code-badge badge-one" aria-hidden="true">&lt;/&gt;</span><span className="code-badge badge-two" aria-hidden="true">01</span></div>
      </section>
      <Reveal><section id="about" className="split motion-section"><TechAccent variant="flow"/><p className="section-label">ABOUT</p><div><h2>I build software that feels simple, not simplistic.</h2><p className="body-large">{profile.bio}</p></div></section></Reveal>
      <Reveal><section id="skills" className="motion-section"><TechAccent variant="matrix"/><p className="section-label">SKILLS</p><h2>Tools are temporary.<br/>Good judgment compounds.</h2><div className="skill-grid">{(data.skills || fallback.skills).length ? (data.skills || fallback.skills).map((skill) => <article key={skill.id || skill}>{skill.icon&&<SkillIcon id={skill.icon} className="skill-icon"/>}<h3>{skill.name || skill}</h3><p>{skill.description || 'Applied thoughtfully to ship maintainable, high-quality work.'}</p></article>) : <p className="empty">Skills will be published soon.</p>}</div></section></Reveal>
      <Reveal><section id="experience" className="experience-section motion-section"><TechAccent variant="signal"/><p className="section-label">EXPERIENCE</p><div><h2>Where I’ve made an impact.</h2><div className="roadmap">{(data.experience || fallback.experience).map((item) => <article className="milestone" key={item.id}><span className="milestone-dot" aria-hidden="true"/><p className="milestone-period">{item.period}</p><div className="milestone-card"><h3>{item.role}</h3><b>{item.company}</b><p>{item.summary}</p></div></article>)}</div></div></section></Reveal>
      <Reveal><section id="projects" className="motion-section"><TechAccent variant="nodes"/><p className="section-label">SELECTED WORK</p><h2>Built to solve. Designed to last.</h2><ProjectShowcase projects={(data.projects || fallback.projects)}/></section></Reveal>
      {(data.customSections || []).filter(section=>(section.presentation||'section')==='section').map(section => <Reveal key={section.id || section.slug}><section id={section.slug} className="custom-section motion-section"><TechAccent variant="matrix"/><p className="section-label">{section.title.toUpperCase()}</p><h2>{section.title}</h2>{section.intro && <p className="body-large">{section.intro}</p>}<CustomSectionShowcase section={section}/></section></Reveal>)}
      <section id="contact" className="contact motion-section"><TechAccent variant="terminal"/><div className="contact-inner"><p className="eyebrow">HAVE A ROLE OR PROJECT IN MIND?</p><h2>Let’s build something<br/>worth remembering.</h2>{contactItems.length?<div className="contact-grid">{contactItems.map(item=><a className={`contact-card ${item.type}`} key={item.type} href={item.href} target={item.external?'_blank':undefined} rel={item.external?'noreferrer':undefined}><span className="contact-icon"><ContactIcon type={item.type}/></span><span><b>{item.label}</b><small>{item.value}</small></span>{item.external&&<i aria-hidden="true">↗</i>}</a>)}</div>:<p className="contact-empty">Contact details coming soon.</p>}</div></section>
    </main>
    <a className={`back-to-top ${showBackToTop ? 'visible' : ''}`} href="#top" aria-label="Back to top" aria-hidden={!showBackToTop} tabIndex={showBackToTop ? 0 : -1}>
      <span aria-hidden="true">↑</span>
    </a>
    <footer><Logo/><p>Software, systems & thoughtful details.</p><a href=""></a></footer>
  </>;
}
