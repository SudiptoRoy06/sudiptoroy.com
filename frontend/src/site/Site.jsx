import {useEffect, useRef, useState} from 'react';
import Logo from '../components/Logo';

const fallback = {
  profile: {
    name: 'Sudipto Roy',
    headline: 'Software engineer crafting dependable digital products.',
    bio: 'I turn complex problems into clear, accessible experiences—pairing product thinking with pragmatic engineering.',
    available: true,
    portrait: '/images/portrait-placeholder.svg',
    cv: null,
    email: '',
  },
  skills: ['React & TypeScript', 'Node.js & APIs', 'Product engineering', 'Accessible UI'],
  experience: [{id: 1, role: 'Software Engineer', company: 'Employment details to verify', period: 'Dates to verify', summary: 'Impact and responsibilities awaiting Sudipto’s review.'}],
  projects: [{id: 1, title: 'Featured work coming soon', summary: 'Verified case studies will appear here after publication.', stack: 'React · Node.js', url: ''}],
};
const navItems = ['About', 'Skills', 'Experience', 'Projects', 'Contact'];
const imageSet = (src) => src ? `${src}?w=480 480w, ${src}?w=800 800w, ${src}?w=1200 1200w` : undefined;
function Reveal({children, className = ''}) {
  return <div className={`reveal ${className}`}>{children}</div>;
}
function TechAccent({variant}) {
  return <div className={`section-motion ${variant}`} aria-hidden="true"><i/><i/><i/><span/></div>;
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
    fetch('/api/content').then((r) => r.ok ? r.json() : Promise.reject()).then(setData).catch(() => setData(fallback));
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
  const closeMenu = () => setMenu(false);

  return <>
    <a className="skip" href="#content">Skip to content</a>
    <header className="site-header">
      <nav aria-label="Primary">
        <a className="brand-link" href="#top" aria-label="Sudipto Roy home"><Logo/></a>
        <div className="header-controls">
          <div ref={panelRef} id="navlinks" className={menu ? 'navlinks open' : 'navlinks'}>
            {navItems.map((item) => <a key={item} onClick={closeMenu} href={`#${item.toLowerCase()}`}>{item}</a>)}
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
      <Reveal><section id="skills" className="motion-section"><TechAccent variant="matrix"/><p className="section-label">SKILLS</p><h2>Tools are temporary.<br/>Good judgment compounds.</h2><div className="skill-grid">{(data.skills || fallback.skills).length ? (data.skills || fallback.skills).map((skill) => <article key={skill.id || skill}><h3>{skill.name || skill}</h3><p>{skill.description || 'Applied thoughtfully to ship maintainable, high-quality work.'}</p></article>) : <p className="empty">Skills will be published soon.</p>}</div></section></Reveal>
      <Reveal><section id="experience" className="experience-section motion-section"><TechAccent variant="signal"/><p className="section-label">EXPERIENCE</p><div><h2>Where I’ve made an impact.</h2><div className="roadmap">{(data.experience || fallback.experience).map((item) => <article className="milestone" key={item.id}><span className="milestone-dot" aria-hidden="true"/><p className="milestone-period">{item.period}</p><div className="milestone-card"><h3>{item.role}</h3><b>{item.company}</b><p>{item.summary}</p></div></article>)}</div></div></section></Reveal>
      <Reveal><section id="projects" className="motion-section"><TechAccent variant="nodes"/><p className="section-label">SELECTED WORK</p><h2>Built to solve. Designed to last.</h2><div className="projects">{(data.projects || fallback.projects).length ? (data.projects || fallback.projects).map((project) => <article className={`project ${project.image ? 'has-image' : ''}`} key={project.id}>{project.image && <picture className="project-image"><source srcSet={imageSet(project.image)} sizes="(max-width: 760px) 100vw, 46vw"/><img src={project.image} width="960" height="640" alt="" loading="lazy" decoding="async"/></picture>}<div><p>{project.stack}</p><h3>{project.title}</h3><p>{project.summary}</p>{project.url && <a className="text-link" href={project.url} rel="noreferrer" target="_blank">View project <span aria-hidden="true">↗</span><span className="sr-only"> (opens in a new tab)</span></a>}</div></article>) : <p className="empty">No projects have been published yet.</p>}</div></section></Reveal>
      <section id="contact" className="contact motion-section"><TechAccent variant="terminal"/><p className="eyebrow">HAVE A ROLE OR PROJECT IN MIND?</p><h2>Let’s build something<br/>worth remembering.</h2><a className="button inverse" href={profile.email ? `mailto:${profile.email}` : '#top'}>{profile.email ? 'Email Sudipto' : 'Contact details coming soon'}</a></section>
    </main>
    <a className={`back-to-top ${showBackToTop ? 'visible' : ''}`} href="#top" aria-label="Back to top" aria-hidden={!showBackToTop} tabIndex={showBackToTop ? 0 : -1}>
      <span aria-hidden="true">↑</span>
    </a>
    <footer><Logo/><p>Software, systems & thoughtful details.</p><a href=""></a></footer>
  </>;
}
