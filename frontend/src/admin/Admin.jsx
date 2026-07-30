import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import { apiUrl } from "../api";
import { useAuth } from "./auth";
import { SkillIcon, skillIcons } from "../skill-icons";

const groups = [
  ["Profile & about", "#profile-about"],
  ["Skills", "#skills"],
  ["Projects", "#projects"],
  ["Employment", "#employment"],
  ["Custom sections", "#custom-sections"],
  ["Contact & social", "#contact-social"],
  ["Portrait & CV", "#portrait-cv"],
];
const empty = {
  skills: { name: "", description: "", icon: "" },
  projects: {
    title: "",
    summary: "",
    technologies: [],
    technologyIcons: [],
    url: "",
    repositoryUrl: "",
    images: [],
    logo: "",
    published: true,
  },
  experience: { role: "", company: "", period: "", summary: "" },
};
const reservedSectionSlugs = new Set(["top", "about", "skills", "experience", "projects", "contact", "content", "avatar", "cv"]);
const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "section";

export default function Admin() {
  const [data, setData] = useState(null),
    [notice, setNotice] = useState(""),
    [sidebar, setSidebar] = useState(false),
    { setUser } = useAuth(),
    nav = useNavigate(),
    toggle = useRef(null),
    aside = useRef(null);
  useEffect(() => {
    apiFetch("/api/admin/content")
      .then(setData)
      .catch((error) => setNotice(`Error: ${error.message}`));
  }, []);
  useEffect(() => {
    if (!sidebar) return;
    const first = aside.current?.querySelector("a,button");
    first?.focus();
    const close = (e) => {
      if (e.key === "Escape") {
        setSidebar(false);
        toggle.current?.focus();
      }
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [sidebar]);
  async function logout() {
    await apiFetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    setUser(null);
    nav("/admin/login");
  }
  async function saveProfile(e, fields) {
    e.preventDefault();
    setNotice("Saving…");
    const form = new FormData(e.currentTarget);
    const profile = { ...data.profile };
    fields.forEach((field) => {
      profile[field] = field === "available" ? form.get(field) === "on" : form.get(field);
    });
    const payload = {
      headline: profile.headline,
      bio: profile.bio,
      email: profile.email,
      phone: profile.phone || "",
      linkedinUrl: profile.linkedinUrl || "",
      githubUrl: profile.githubUrl || "",
      wordpressUrl: profile.wordpressUrl || "",
      available: profile.available,
    };
    try {
      await apiFetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setData((current) => ({
        ...current,
        profile: { ...current.profile, ...payload },
      }));
      setNotice("Section published successfully.");
    } catch (error) {
      setNotice(`Error: ${error.message}`);
    }
  }
  return (
    <div className="admin">
      <button ref={toggle} className="admin-menu" onClick={() => setSidebar((v) => !v)} aria-expanded={sidebar} aria-controls="admin-sidebar">
        <span aria-hidden="true">☰</span> Studio menu
      </button>
      {sidebar && <button className="sidebar-scrim" aria-label="Close studio menu" onClick={() => setSidebar(false)} />}
      <aside ref={aside} id="admin-sidebar" className={sidebar ? "open" : ""} aria-label="Content studio">
        <button
          className="sidebar-close"
          onClick={() => {
            setSidebar(false);
            toggle.current?.focus();
          }}
          aria-label="Close studio menu"
        >
          ×
        </button>
        <a className="admin-brand" href="/">
          <Logo />
        </a>
        <p>Content studio</p>
        <nav aria-label="Studio sections">
          {groups.map(([label, href], i) => (
            <a key={href} onClick={() => setSidebar(false)} href={href}>
              {String(i + 1).padStart(2, "0")} {label}
            </a>
          ))}
        </nav>
        <button className="sign-out" onClick={logout}>
          Sign out
        </button>
      </aside>
      <main id="admin-content">
        <div className="admin-head">
          <div>
            <p className="section-no">OVERVIEW</p>
            <h1>Portfolio control room</h1>
          </div>
          <a href="/" target="_blank" rel="noreferrer">
            View live site <span aria-hidden="true">↗</span>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
        {notice && <Toast message={notice} type={isErrorNotice(notice) ? "error" : "success"} onClose={() => setNotice("")} />}
        {!data && !notice ? (
          <div className="loading">Loading content…</div>
        ) : (
          data && (
            <>
              <div className="stats" aria-label="Content totals">
                <article>
                  <b>{data.skills.length}</b>
                  <span>Skills</span>
                </article>
                <article>
                  <b>{data.projects.length}</b>
                  <span>Projects</span>
                </article>
                <article>
                  <b>{data.customSections?.length || 0}</b>
                  <span>Custom sections</span>
                </article>
              </div>
              <form className="editor" id="profile-about" onSubmit={(e) => saveProfile(e, ["headline", "bio", "available"])}>
                <h2>Profile & about</h2>
                <label>
                  Professional headline
                  <input name="headline" defaultValue={data.profile.headline} required minLength="3" />
                </label>
                <label>
                  About biography
                  <textarea name="bio" rows="6" defaultValue={data.profile.bio} required minLength="10" />
                </label>
                <label className="check">
                  <input name="available" type="checkbox" defaultChecked={data.profile.available} /> <span>Available for opportunities</span>
                </label>
                <SectionActions label="profile" />
              </form>
              <CollectionEditor section="skills" id="skills" title="Skills" items={data.skills} setData={setData} setNotice={setNotice} />
              <CollectionEditor section="projects" id="projects" title="Projects" items={data.projects} setData={setData} setNotice={setNotice} />
              <CollectionEditor section="experience" id="employment" title="Employment" items={data.experience} setData={setData} setNotice={setNotice} />
              <CustomSectionsEditor items={data.customSections || []} setData={setData} setNotice={setNotice} />
              <form className="editor" id="contact-social" onSubmit={(e) => saveProfile(e, ["email", "phone", "linkedinUrl", "githubUrl", "wordpressUrl"])}>
                <h2>Contact & social</h2>
                <p className="editor-hint">Add any details you want to publish. Empty fields stay hidden on the portfolio.</p>
                <div className="field-row">
                  <label>
                    Public email
                    <input name="email" type="email" inputMode="email" autoComplete="email" defaultValue={data.profile.email} />
                  </label>
                  <label>
                    Phone number
                    <input name="phone" type="tel" inputMode="tel" autoComplete="tel" defaultValue={data.profile.phone || ""} placeholder="+91 98765 43210" />
                  </label>
                </div>
                <label>
                  LinkedIn profile URL
                  <input name="linkedinUrl" type="url" inputMode="url" defaultValue={data.profile.linkedinUrl || ""} placeholder="https://www.linkedin.com/in/username" />
                </label>
                <label>
                  GitHub profile URL
                  <input name="githubUrl" type="url" inputMode="url" defaultValue={data.profile.githubUrl || ""} placeholder="https://github.com/username" />
                </label>
                <label>
                  WordPress profile URL
                  <input name="wordpressUrl" type="url" inputMode="url" defaultValue={data.profile.wordpressUrl || ""} placeholder="https://profiles.wordpress.org/username" />
                </label>
                <SectionActions label="contact details" />
              </form>
              <section id="portrait-cv" className="admin-section">
                <h2>Portrait & CV</h2>
                <Upload title="Replace portrait" field="portrait" accept="image/jpeg,image/png,image/webp" capture="user" setNotice={setNotice} />
                <Upload title="Replace CV" field="cv" accept="application/pdf,.pdf" setNotice={setNotice} />
              </section>
            </>
          )
        )}
      </main>
    </div>
  );
}

function CustomSectionsEditor({ items, setData, setNotice }) {
  const prepare = (section) => ({
    ...section,
    _key: section.id || crypto.randomUUID(),
    blocks: section.blocks.map((block) => ({
      ...block,
      images: block.images?.length ? block.images : block.image ? [block.image] : [],
      _key: crypto.randomUUID(),
    })),
  });
  const [drafts, setDrafts] = useState(() => items.map(prepare));
  const updateSection = (index, field, value) => setDrafts((current) => current.map((section, i) => (i === index ? { ...section, [field]: value } : section)));
  const addSection = () =>
    setDrafts((current) => [
      ...current,
      {
        _key: crypto.randomUUID(),
        title: "",
        intro: "",
        presentation: "section",
        itemPresentation: "modal",
        published: true,
        blocks: [],
      },
    ]);
  const removeSection = (index) => setDrafts((current) => current.filter((_, i) => i !== index));
  const addBlock = (sectionIndex) =>
    setDrafts((current) =>
      current.map((section, i) =>
        i === sectionIndex
          ? {
              ...section,
              blocks: [
                ...section.blocks,
                {
                  _key: crypto.randomUUID(),
                  heading: "",
                  body: "",
                  logo: "",
                  images: [],
                  url: "",
                  linkLabel: "",
                  publishedAt: "",
                },
              ],
            }
          : section,
      ),
    );
  const updateBlock = (sectionIndex, blockIndex, field, value) =>
    setDrafts((current) =>
      current.map((section, i) =>
        i === sectionIndex
          ? {
              ...section,
              blocks: section.blocks.map((block, j) => (j === blockIndex ? { ...block, [field]: value } : block)),
            }
          : section,
      ),
    );
  const removeBlock = (sectionIndex, blockIndex) =>
    setDrafts((current) =>
      current.map((section, i) =>
        i === sectionIndex
          ? {
              ...section,
              blocks: section.blocks.filter((_, j) => j !== blockIndex),
            }
          : section,
      ),
    );
  const imageCount = (section) => section.blocks.reduce((count, block) => count + block.images.length, 0);
  const ensureSectionSlug = (index) => {
    const section = drafts[index];
    if (section.slug) return section.slug;
    if (!section.title.trim()) {
      setNotice("Error: Enter the custom section title before uploading files.");
      return "";
    }
    const used = new Set([...reservedSectionSlugs, ...drafts.map((item) => item.slug).filter(Boolean)]);
    const base = slugify(section.title);
    let slug = base,
      suffix = 2;
    while (used.has(slug)) slug = `${base}-${suffix++}`;
    setDrafts((current) => current.map((item, i) => (i === index ? { ...item, slug } : item)));
    return slug;
  };
  async function save(e) {
    e.preventDefault();
    setNotice("Saving custom sections…");
    const payload = drafts.map((section) => ({
      title: section.title,
      ...(section.slug ? { slug: section.slug } : {}),
      intro: section.intro,
      presentation: section.presentation || "section",
      itemPresentation: section.itemPresentation || "modal",
      published: section.published,
      blocks: section.blocks.map((block) => ({
        heading: block.heading,
        body: block.body,
        logo: block.logo || "",
        images: block.images,
        url: block.url || "",
        linkLabel: block.linkLabel || "",
        publishedAt: block.publishedAt || "",
      })),
    }));
    try {
      const result = await apiFetch("/api/admin/customSections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: payload }),
      });
      setData((current) => ({ ...current, customSections: result.items }));
      setDrafts(result.items.map(prepare));
      setNotice("Custom sections published successfully.");
    } catch (error) {
      setNotice(`Error: ${error.message}`);
    }
  }
  return (
    <form className="editor collection-editor" id="custom-sections" onSubmit={save}>
      <div className="editor-title">
        <div>
          <h2>Custom sections</h2>
          <p className="editor-hint">Published sections automatically appear in the public menu.</p>
        </div>
        <button className="button small secondary" type="button" onClick={addSection}>
          + Add section
        </button>
      </div>
      {!drafts.length && <p className="empty">No custom sections yet. Add one whenever you need it.</p>}
      {drafts.map((section, index) => (
        <fieldset className="custom-section-editor" key={section._key}>
          <legend>Section {index + 1}</legend>
          <label>
            Menu and section title
            <input value={section.title} onChange={(e) => updateSection(index, "title", e.target.value)} required maxLength="100" placeholder="Writing & Talks" />
          </label>
          <label>
            Introduction
            <textarea rows="3" value={section.intro} onChange={(e) => updateSection(index, "intro", e.target.value)} maxLength="1000" />
          </label>
          <label>
            Where it opens
            <select value={section.presentation || "section"} onChange={(e) => updateSection(index, "presentation", e.target.value)}>
              <option value="section">Section on the homepage</option>
              <option value="page">Dedicated page</option>
            </select>
          </label>
          <p className="editor-hint">{(section.presentation || "section") === "page" ? "The menu opens a separate page containing this section’s content." : "The menu scrolls to this section on the homepage."}</p>
          <label>
            How each item opens
            <select value={section.itemPresentation || "modal"} onChange={(e) => updateSection(index, "itemPresentation", e.target.value)}>
              <option value="modal">Popup details — recommended for Products</option>
              <option value="page">Dedicated post page — recommended for Blogs, Events and Achievements</option>
            </select>
          </label>
          <label className="check">
            <input type="checkbox" checked={section.published} onChange={(e) => updateSection(index, "published", e.target.checked)} /> <span>Published on the portfolio and shown in the menu</span>
          </label>
          <div className="block-title">
            <h3>Content blocks</h3>
            <button className="button small secondary" type="button" onClick={() => addBlock(index)}>
              + Add content
            </button>
          </div>
          <p className="editor-hint">{imageCount(section)} of 5 images uploaded for this section.</p>
          {section.blocks.map((block, blockIndex) => (
            <div className="content-block-editor" key={block._key}>
              <label>
                Heading <span className="label-hint">(optional)</span>
                <input value={block.heading} onChange={(e) => updateBlock(index, blockIndex, "heading", e.target.value)} maxLength="160" />
              </label>
              <label>
                Publication date and time <span className="label-hint">(optional)</span>
                <input type="datetime-local" value={block.publishedAt || ""} onChange={(e) => updateBlock(index, blockIndex, "publishedAt", e.target.value)} />
              </label>
              <label>
                Content
                <textarea rows="8" value={block.body} onChange={(e) => updateBlock(index, blockIndex, "body", e.target.value)} required maxLength="5000" />
              </label>
              <div className="field-row">
                <AssetField label="Logo" kind="logo" folder={() => ensureSectionSlug(index)} value={block.logo} onChange={(value) => updateBlock(index, blockIndex, "logo", value)} setNotice={setNotice} />
                <MultiAssetField label="Images" folder={() => ensureSectionSlug(index)} values={block.images} onChange={(value) => updateBlock(index, blockIndex, "images", value)} setNotice={setNotice} limit={5 - imageCount(section) + block.images.length} />
              </div>
              <div className="field-row">
                <label>
                  Destination URL <span className="label-hint">(optional)</span>
                  <input type="url" value={block.url || ""} onChange={(e) => updateBlock(index, blockIndex, "url", e.target.value)} placeholder="https://example.com" />
                </label>
                <label>
                  Link text <span className="label-hint">(optional)</span>
                  <input value={block.linkLabel || ""} onChange={(e) => updateBlock(index, blockIndex, "linkLabel", e.target.value)} maxLength="100" placeholder="Learn more" />
                </label>
              </div>
              <button className="remove-item" type="button" onClick={() => removeBlock(index, blockIndex)}>
                Remove content block
              </button>
            </div>
          ))}
          <button className="remove-item" type="button" onClick={() => removeSection(index)}>
            Remove section
          </button>
        </fieldset>
      ))}
      <SectionActions label="custom sections" />
    </form>
  );
}

function CollectionEditor({ section, id, title, items, setData, setNotice }) {
  const [drafts, setDrafts] = useState(() => items.map(normalize));
  const update = (index, field, value) => setDrafts((current) => current.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  const remove = (index) => setDrafts((current) => current.filter((_, i) => i !== index));
  const add = () => setDrafts((current) => [...current, { ...empty[section], _key: crypto.randomUUID() }]);
  async function save(e) {
    e.preventDefault();
    setNotice(`Saving ${title.toLowerCase()}…`);
    const payload = drafts.map(({ _key, id, ...item }) =>
      section === "projects"
        ? {
            ...item,
            technologies:
              typeof item.technologies === "string"
                ? item.technologies
                    .split(",")
                    .map((x) => x.trim())
                    .filter(Boolean)
                : item.technologies,
          }
        : item,
    );
    try {
      const result = await apiFetch(`/api/admin/${section}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: payload }),
      });
      setData((current) => ({ ...current, [section]: result.items }));
      setDrafts(result.items.map(normalize));
      setNotice(`${title} published successfully.`);
    } catch (error) {
      setNotice(`Error: ${error.message}`);
    }
  }
  return (
    <form className="editor collection-editor" id={id} onSubmit={save}>
      <div className="editor-title">
        <h2>{title}</h2>
        <button className="button small secondary" type="button" onClick={add}>
          + Add {section === "experience" ? "experience" : title.slice(0, -1).toLowerCase()}
        </button>
      </div>
      {!drafts.length && <p className="empty">No {title.toLowerCase()} yet. Add the first one.</p>}
      {drafts.map((item, index) => (
        <fieldset key={item.id || item._key}>
          <legend>
            {title.slice(0, -1)} {index + 1}
          </legend>
          <EditorFields section={section} item={item} update={(field, value) => update(index, field, value)} setNotice={setNotice} />
          <button className="remove-item" type="button" onClick={() => remove(index)}>
            Remove
          </button>
        </fieldset>
      ))}
      <SectionActions label={title.toLowerCase()} />
    </form>
  );
}

function EditorFields({ section, item, update, setNotice }) {
  if (section === "skills")
    return (
      <>
        <label>
          Skill name
          <input value={item.name} onChange={(e) => update("name", e.target.value)} required maxLength="100" />
        </label>
        <SkillIconPicker value={item.icon || ""} onChange={(value) => update("icon", value)} />
        <label>
          Description
          <textarea rows="3" value={item.description} onChange={(e) => update("description", e.target.value)} maxLength="1000" />
        </label>
      </>
    );
  if (section === "experience")
    return (
      <>
        <div className="field-row">
          <label>
            Role
            <input value={item.role} onChange={(e) => update("role", e.target.value)} required />
          </label>
          <label>
            Company
            <input value={item.company} onChange={(e) => update("company", e.target.value)} required />
          </label>
        </div>
        <label>
          Period
          <input value={item.period} onChange={(e) => update("period", e.target.value)} placeholder="2024 – Present" />
        </label>
        <label>
          Summary
          <textarea rows="4" value={item.summary} onChange={(e) => update("summary", e.target.value)} required />
        </label>
      </>
    );
  return (
    <>
      <label>
        Project title
        <input value={item.title} onChange={(e) => update("title", e.target.value)} required />
      </label>
      <label>
        Summary
        <textarea rows="4" value={item.summary} onChange={(e) => update("summary", e.target.value)} required />
      </label>
      <label>
        Technologies <span className="label-hint">(comma separated)</span>
        <input value={item.technologies} onChange={(e) => update("technologies", e.target.value)} placeholder="React, Node.js" />
      </label>
      <ProjectTechnologyPicker values={item.technologyIcons} onChange={(value) => update("technologyIcons", value)} />
      <div className="field-row">
        <label>
          Live URL
          <input type="url" value={item.url} onChange={(e) => update("url", e.target.value)} />
        </label>
        <label>
          Repository URL
          <input type="url" value={item.repositoryUrl} onChange={(e) => update("repositoryUrl", e.target.value)} />
        </label>
      </div>
      <AssetField label="Project logo" kind="logo" folder="projects" value={item.logo} onChange={(value) => update("logo", value)} setNotice={setNotice} />
      <MultiAssetField label="Project images" folder="projects" values={item.images} onChange={(value) => update("images", value)} setNotice={setNotice} limit={5} />
      <label className="check">
        <input type="checkbox" checked={item.published} onChange={(e) => update("published", e.target.checked)} /> <span>Published on the portfolio</span>
      </label>
    </>
  );
}

function SkillIconPicker({ value, onChange }) {
  const [query, setQuery] = useState("");
  const matches = skillIcons.filter((icon) => `${icon.title} ${icon.id} ${icon.aliases || ""}`.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="icon-picker">
      <div className="icon-picker-label">
        <b>Technology icon</b>
        <span className="label-hint">(optional)</span>
      </div>
      <label>
        Search icons
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search React, Node.js, Python…" />
      </label>
      <div className="icon-options" role="listbox" aria-label="Technology icons">
        <button type="button" role="option" className={!value ? "selected" : ""} aria-selected={!value} onClick={() => onChange("")}>
          No icon
        </button>
        {matches.map((icon) => (
          <button type="button" role="option" aria-selected={value === icon.id} className={value === icon.id ? "selected" : ""} key={icon.id} onClick={() => onChange(icon.id)}>
            <SkillIcon id={icon.id} />
            <span>{icon.title}</span>
          </button>
        ))}
      </div>
      {!matches.length && <p className="editor-hint">No matching icon in the catalog.</p>}
    </div>
  );
}

function ProjectTechnologyPicker({ values, onChange }) {
  const [query, setQuery] = useState("");
  const matches = skillIcons.filter((icon) => `${icon.title} ${icon.id} ${icon.aliases || ""}`.toLowerCase().includes(query.toLowerCase()));
  const toggle = (id) => onChange(values.includes(id) ? values.filter((value) => value !== id) : values.length < 20 ? [...values, id] : values);
  return (
    <div className="icon-picker">
      <div className="icon-picker-label">
        <b>Technology icons</b>
        <span className="label-hint">(optional, up to 20)</span>
      </div>
      {values.length > 0 && (
        <div className="selected-icons" aria-label="Selected technologies">
          {values.map((id) => (
            <button type="button" key={id} onClick={() => toggle(id)}>
              <SkillIcon id={id} />
              <span>{skillIcons.find((icon) => icon.id === id)?.title || id}</span>
              <b aria-hidden="true">×</b>
            </button>
          ))}
        </div>
      )}
      <label>
        Search and select icons
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search React, AWS, WordPress…" />
      </label>
      <div className="icon-options" role="listbox" aria-label="Project technology icons" aria-multiselectable="true">
        {matches.map((icon) => (
          <button type="button" role="option" aria-selected={values.includes(icon.id)} className={values.includes(icon.id) ? "selected" : ""} key={icon.id} onClick={() => toggle(icon.id)} disabled={!values.includes(icon.id) && values.length >= 20}>
            <SkillIcon id={icon.id} />
            <span>{icon.title}</span>
          </button>
        ))}
      </div>
      {!matches.length && <p className="editor-hint">No matching icon in the catalog.</p>}
    </div>
  );
}

function normalize(item) {
  return {
    ...item,
    _key: item.id || crypto.randomUUID(),
    technologies: Array.isArray(item.technologies) ? item.technologies.join(", ") : item.technologies,
    technologyIcons: item.technologyIcons || [],
    images: item.images || (item.image ? [item.image] : []),
    logo: item.logo || "",
  };
}
function SectionActions({ label }) {
  return (
    <div className="section-actions">
      <button className="button">Save {label}</button>
    </div>
  );
}
function Upload({ title, field, accept, capture, setNotice }) {
  async function send(e) {
    e.preventDefault();
    try {
      await apiFetch(`/api/admin/upload/${field}`, {
        method: "POST",
        body: new FormData(e.currentTarget),
      });
      setNotice("Upload published.");
    } catch (error) {
      setNotice(`Error: ${error.message}`);
    }
  }
  return (
    <form className="editor upload" onSubmit={send}>
      <h3>{title}</h3>
      <label className="file-label">
        Choose {field} file
        <input type="file" name="file" accept={accept} capture={capture} required />
      </label>
      <button className="button small">Upload</button>
    </form>
  );
}

function AssetField({ label, kind, folder, value, onChange, setNotice = () => {}, disabled = false }) {
  async function upload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const body = new FormData();
    body.append("file", file);
    body.append("folder", typeof folder === "function" ? folder() : folder);
    setNotice(`Uploading ${label.toLowerCase()}…`);
    try {
      const result = await apiFetch(`/api/admin/upload/${kind}`, {
        method: "POST",
        body,
      });
      onChange(result.url);
      setNotice(`${label} uploaded. Save the section to publish it.`);
    } catch (error) {
      setNotice(`Error: ${error.message}`);
    }
    event.target.value = "";
  }
  return (
    <div className="asset-field">
      <span>
        {label} <span className="label-hint">(optional)</span>
      </span>
      {value && (
        <div className="asset-preview">
          <img src={apiUrl(value)} alt="" />
          <button type="button" onClick={() => onChange("")}>
            Remove
          </button>
        </div>
      )}
      <label className={`button small secondary ${disabled ? "disabled" : ""}`}>
        {value ? "Replace file" : "Choose file"}
        <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={upload} disabled={disabled} />
      </label>
      {disabled && <small>Five-image limit reached.</small>}
    </div>
  );
}

function MultiAssetField({ label, folder, values, onChange, setNotice, limit = 5 }) {
  async function upload(event) {
    const files = [...(event.target.files || [])];
    event.target.value = "";
    const remaining = limit - values.length;
    if (!files.length) return;
    if (files.length > remaining) {
      setNotice(`Error: You can select only ${remaining} more image${remaining === 1 ? "" : "s"}.`);
      return;
    }
    setNotice(`Uploading ${files.length} image${files.length === 1 ? "" : "s"}…`);
    try {
      const uploaded = [];
      const uploadFolder = typeof folder === "function" ? folder() : folder;
      for (const file of files) {
        const body = new FormData();
        body.append("file", file);
        body.append("folder", uploadFolder);
        const result = await apiFetch("/api/admin/upload/image", {
          method: "POST",
          body,
        });
        uploaded.push(result.url);
      }
      onChange([...values, ...uploaded]);
      setNotice(`${uploaded.length} image${uploaded.length === 1 ? "" : "s"} uploaded. Save the section to publish.`);
    } catch (error) {
      setNotice(`Error: ${error.message}`);
    }
  }
  return (
    <div className="asset-field">
      <div className="project-upload-head">
        <b>{label}</b>
        <span>
          {values.length} of {limit}
        </span>
      </div>
      <div className="asset-gallery">
        {values.map((image, index) => (
          <div className="asset-preview" key={image}>
            <img src={apiUrl(image)} alt="" />
            <button type="button" onClick={() => onChange(values.filter((_, i) => i !== index))}>
              Remove
            </button>
          </div>
        ))}
      </div>
      <label className={`button small secondary ${values.length >= limit ? "disabled" : ""}`}>
        Select images
        <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={upload} disabled={values.length >= limit} />
      </label>
      <small>Select up to {Math.max(0, limit - values.length)} more at once.</small>
    </div>
  );
}

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [message, onClose]);
  return (
    <div className={`toast ${type}`} role={type === "error" ? "alert" : "status"}>
      <span>{message}</span>
      <button type="button" onClick={onClose} aria-label="Dismiss notification">
        ×
      </button>
    </div>
  );
}

function isErrorNotice(message) {
  return /error|unable|could not|failed|required|expired|invalid|rejected|wrong/i.test(message);
}

async function apiFetch(url, options = {}) {
  let response;
  try {
    response = await fetch(apiUrl(url), { ...options, credentials: "include" });
  } catch {
    throw new Error("Could not reach the server. Please try again.");
  }
  const body = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.error || (response.status === 401 ? "Authentication required. Please sign in again." : "Something went wrong. Please try again."));
  return body;
}
