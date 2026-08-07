import {mkdir, readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {createServer} from 'vite';

const siteOrigin=(process.env.SITE_ORIGIN||'https://www.sudiptoroy.com').replace(/\/$/,'');
const apiOrigin=(process.env.VITE_BACKEND_ORIGIN||'https://sudiptoroy-com.onrender.com').replace(/\/$/,'');
globalThis.__PRERENDER_BACKEND_ORIGIN__=apiOrigin;
const response=await fetch(`${apiOrigin}/api/content`);
if(!response.ok)throw new Error(`Could not fetch public content (${response.status})`);
const content=await response.json();
const routes=['/'];
for(const section of content.customSections||[]){
  if((section.presentation||'section')!=='page')continue;
  routes.push(`/sections/${section.slug}`);
  if(section.itemPresentation==='page')for(const block of section.blocks||[])routes.push(`/sections/${section.slug}/${block.slug}`);
}
const vite=await createServer({server:{middlewareMode:true},appType:'custom'});
const {render}=await vite.ssrLoadModule('/src/entry-server.jsx');
const template=await readFile('dist/index.html','utf8');
const escapeJson=value=>JSON.stringify(value).replace(/</g,'\\u003c');
const clean=value=>String(value||'').replace(/\s+/g,' ').trim();
const mediaUrl=value=>value&&typeof value==='object'?value.url:value;
const escapeHtml=value=>String(value||'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
function metaFor(route){
  const base={title:'Sudipto Roy · Software Engineer',description:clean(content.profile?.headline)||'Software engineer building reliable, human-centered digital products.',image:`${siteOrigin}/social-preview.svg`,type:'website'};
  if(route==='/')return base;
  const [, ,slug,itemSlug]=route.split('/');
  const section=(content.customSections||[]).find(item=>item.slug===slug);
  const block=itemSlug&&section?.blocks?.find(item=>item.slug===itemSlug);
  if(block)return {title:`${block.heading||section.title} · Sudipto Roy`,description:clean(block.body).slice(0,160),image:mediaUrl(block.images?.[0]||block.image||block.logo)||base.image,type:'article',publishedAt:block.publishedAt};
  return {title:`${section?.title||'Portfolio'} · Sudipto Roy`,description:clean(section?.intro)||base.description,image:base.image,type:'website'};
}
function tags(route){
  const meta=metaFor(route),canonical=`${siteOrigin}${route}`;
  const image=meta.image.startsWith('/')?`${apiOrigin}${meta.image}`:meta.image;
  const graph=route==='/'
    ? {'@context':'https://schema.org','@graph':[{'@type':'Person',name:'Sudipto Roy',url:siteOrigin,image},{'@type':'WebSite',name:'Sudipto Roy',url:siteOrigin,description:meta.description}]}
    : { '@context':'https://schema.org','@type':meta.type==='article'?'Article':'WebPage',name:meta.title,description:meta.description,url:canonical,image,...(meta.publishedAt?{datePublished:meta.publishedAt}:{}),author:{'@type':'Person',name:'Sudipto Roy',url:siteOrigin}};
  return `<title>${escapeHtml(meta.title)}</title><meta name="description" content="${escapeHtml(meta.description)}"><link rel="canonical" href="${canonical}"><meta property="og:title" content="${escapeHtml(meta.title)}"><meta property="og:description" content="${escapeHtml(meta.description)}"><meta property="og:type" content="${meta.type}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${escapeHtml(image)}"><meta name="twitter:card" content="summary_large_image"><script type="application/ld+json">${escapeJson(graph)}</script>`;
}
for(const route of routes){
  const markup=render(route,content);
  let html=template.replace(/<title>[\s\S]*?<\/title>/,'')
    .replace(/<meta name="description"[^>]*\/>?/,'').replace(/<meta property="og:[^"]+"[^>]*\/>?/g,'')
    .replace('</head>',`${tags(route)}</head>`).replace('<div id="root">','<div id="root" data-prerendered>')
    .replace(/<div id="root" data-prerendered>[\s\S]*?<\/div><\/body>/,`<div id="root" data-prerendered>${markup}</div><script>window.__INITIAL_CONTENT__=${escapeJson(content)}</script></body>`);
  const directory=route==='/'?'dist':path.join('dist',route.slice(1));
  await mkdir(directory,{recursive:true});
  await writeFile(path.join(directory,'index.html'),html);
}
const urls=routes.map(route=>`  <url><loc>${siteOrigin}${route}</loc></url>`).join('\n');
await writeFile('dist/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
await writeFile('dist/robots.txt',`User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: ${siteOrigin}/sitemap.xml\n`);
await vite.close();
