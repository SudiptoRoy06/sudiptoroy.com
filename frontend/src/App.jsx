import {Navigate, Route, Routes} from 'react-router-dom';
import Site from './site/Site';
import Admin from './admin/Admin';
import Login from './admin/Login';
import {AuthProvider, RequireAuth} from './admin/auth';
export default function App(){return <AuthProvider><Routes><Route path="/" element={<Site/>}/><Route path="/admin/login" element={<Login/>}/><Route path="/admin/*" element={<RequireAuth><Admin/></RequireAuth>}/><Route path="*" element={<main className="not-found"><p className="eyebrow">404 · Lost signal</p><h1>This route hasn’t shipped.</h1><a className="button" href="/">Return home</a></main>}/></Routes></AuthProvider>}
