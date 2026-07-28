import {
  siAngular, siCplusplus, siCss, siDjango, siDocker, siDotnet, siExpress,
  siFigma, siFirebase, siGit, siGithub, siGo, siGooglecloud, siGraphql,
  siHostinger, siHtml5, siJavascript, siJest, siKubernetes, siLaravel, siMongodb,
  siMysql, siNextdotjs, siNodedotjs, siPhp, siPostgresql, siPython,
  siReact, siRedis, siRender, siRust, siTailwindcss, siTypescript, siVercel,
  siVite, siVitest, siVuedotjs, siWordpress
} from 'simple-icons';

const icons = [
  siReact, siNodedotjs, siTypescript, siJavascript, siNextdotjs, siExpress,
  siMongodb, siPostgresql, siMysql, siRedis, siGraphql, siDocker,
  siKubernetes, siGit, siGithub, siGooglecloud, siFirebase, siPython,
  siDjango, siGo, siRust, siCplusplus, siDotnet, siPhp, siLaravel,
  siHtml5, siCss, siTailwindcss, siVuedotjs, siAngular, siVite, siJest,
  siVitest, siFigma, siHostinger, siVercel, siRender, siWordpress
];

export const skillIcons = [
  ...icons.map(icon => ({
    id: icon.slug, title: icon.title, path: icon.path, color: `#${icon.hex}`,
    aliases: ''
  })),
  {id:'amazon-web-services',title:'Amazon Web Services',text:'AWS',color:'#FF9900',aliases:'aws asw amazon cloud'},
  {id:'microsoft-azure',title:'Microsoft Azure',text:'AZ',color:'#0078D4',aliases:'azure azur microsoft cloud'},
  {id:'react-native',title:'React Native',path:siReact.path,color:'#61DAFB',aliases:'reactnative mobile'}
];

export function SkillIcon({id, className = ''}) {
  const icon = skillIcons.find(item => item.id === id);
  if (!icon) return null;
  return <svg className={className} viewBox="0 0 24 24" role="img" aria-label={`${icon.title} icon`} style={{color:icon.color}}>{icon.path?<path fill="currentColor" d={icon.path}/>:<><rect x="1" y="4" width="22" height="16" rx="3" fill="currentColor"/><text x="12" y="14.5" textAnchor="middle" fontSize={icon.text.length>2?'7':'8'} fontWeight="800" fill="white">{icon.text}</text></>}</svg>;
}
