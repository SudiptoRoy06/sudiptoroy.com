import angular from 'simple-icons/icons/angular.svg?raw';
import cplusplus from 'simple-icons/icons/cplusplus.svg?raw';
import css from 'simple-icons/icons/css.svg?raw';
import django from 'simple-icons/icons/django.svg?raw';
import docker from 'simple-icons/icons/docker.svg?raw';
import dotnet from 'simple-icons/icons/dotnet.svg?raw';
import express from 'simple-icons/icons/express.svg?raw';
import figma from 'simple-icons/icons/figma.svg?raw';
import firebase from 'simple-icons/icons/firebase.svg?raw';
import git from 'simple-icons/icons/git.svg?raw';
import github from 'simple-icons/icons/github.svg?raw';
import go from 'simple-icons/icons/go.svg?raw';
import googlecloud from 'simple-icons/icons/googlecloud.svg?raw';
import graphql from 'simple-icons/icons/graphql.svg?raw';
import hostinger from 'simple-icons/icons/hostinger.svg?raw';
import html5 from 'simple-icons/icons/html5.svg?raw';
import javascript from 'simple-icons/icons/javascript.svg?raw';
import jest from 'simple-icons/icons/jest.svg?raw';
import kubernetes from 'simple-icons/icons/kubernetes.svg?raw';
import laravel from 'simple-icons/icons/laravel.svg?raw';
import mongodb from 'simple-icons/icons/mongodb.svg?raw';
import mysql from 'simple-icons/icons/mysql.svg?raw';
import nextdotjs from 'simple-icons/icons/nextdotjs.svg?raw';
import nodedotjs from 'simple-icons/icons/nodedotjs.svg?raw';
import php from 'simple-icons/icons/php.svg?raw';
import postgresql from 'simple-icons/icons/postgresql.svg?raw';
import python from 'simple-icons/icons/python.svg?raw';
import react from 'simple-icons/icons/react.svg?raw';
import redis from 'simple-icons/icons/redis.svg?raw';
import render from 'simple-icons/icons/render.svg?raw';
import rust from 'simple-icons/icons/rust.svg?raw';
import tailwindcss from 'simple-icons/icons/tailwindcss.svg?raw';
import typescript from 'simple-icons/icons/typescript.svg?raw';
import vercel from 'simple-icons/icons/vercel.svg?raw';
import vite from 'simple-icons/icons/vite.svg?raw';
import vitest from 'simple-icons/icons/vitest.svg?raw';
import vuedotjs from 'simple-icons/icons/vuedotjs.svg?raw';
import wordpress from 'simple-icons/icons/wordpress.svg?raw';

const pathFrom = svg => svg.match(/<path d="([^"]+)"/)?.[1] || '';
const catalog = [
  ['react','React',react,'61DAFB'],['nodedotjs','Node.js',nodedotjs,'5FA04E'],['typescript','TypeScript',typescript,'3178C6'],
  ['javascript','JavaScript',javascript,'F7DF1E'],['nextdotjs','Next.js',nextdotjs,'000000'],['express','Express',express,'000000'],
  ['mongodb','MongoDB',mongodb,'47A248'],['postgresql','PostgreSQL',postgresql,'4169E1'],['mysql','MySQL',mysql,'4479A1'],
  ['redis','Redis',redis,'FF4438'],['graphql','GraphQL',graphql,'E10098'],['docker','Docker',docker,'2496ED'],
  ['kubernetes','Kubernetes',kubernetes,'326CE5'],['git','Git',git,'F05032'],['github','GitHub',github,'181717'],
  ['googlecloud','Google Cloud',googlecloud,'4285F4'],['firebase','Firebase',firebase,'DD2C00'],['python','Python',python,'3776AB'],
  ['django','Django',django,'092E20'],['go','Go',go,'00ADD8'],['rust','Rust',rust,'000000'],['cplusplus','C++',cplusplus,'00599C'],
  ['dotnet','.NET',dotnet,'512BD4'],['php','PHP',php,'777BB4'],['laravel','Laravel',laravel,'FF2D20'],['html5','HTML5',html5,'E34F26'],
  ['css','CSS',css,'663399'],['tailwindcss','Tailwind CSS',tailwindcss,'06B6D4'],['vuedotjs','Vue.js',vuedotjs,'4FC08D'],
  ['angular','Angular',angular,'0F0F11'],['vite','Vite',vite,'646CFF'],['jest','Jest',jest,'C21325'],['vitest','Vitest',vitest,'6E9F18'],
  ['figma','Figma',figma,'F24E1E'],['hostinger','Hostinger',hostinger,'673DE6'],['vercel','Vercel',vercel,'000000'],
  ['render','Render',render,'000000'],['wordpress','WordPress',wordpress,'21759B']
];

export const skillIcons = [
  ...catalog.map(([id,title,svg,hex]) => ({id,title,path:pathFrom(svg),color:`#${hex}`,aliases:''})),
  {id:'amazon-web-services',title:'Amazon Web Services',text:'AWS',color:'#FF9900',aliases:'aws asw amazon cloud'},
  {id:'microsoft-azure',title:'Microsoft Azure',text:'AZ',color:'#0078D4',aliases:'azure azur microsoft cloud'},
  {id:'react-native',title:'React Native',path:pathFrom(react),color:'#61DAFB',aliases:'reactnative mobile'}
];

export function SkillIcon({id, className = ''}) {
  const icon = skillIcons.find(item => item.id === id);
  if (!icon) return null;
  return <svg className={className} viewBox="0 0 24 24" role="img" aria-label={`${icon.title} icon`} style={{color:icon.color}}>{icon.path?<path fill="currentColor" d={icon.path}/>:<><rect x="1" y="4" width="22" height="16" rx="3" fill="currentColor"/><text x="12" y="14.5" textAnchor="middle" fontSize={icon.text.length>2?'7':'8'} fontWeight="800" fill="white">{icon.text}</text></>}</svg>;
}
