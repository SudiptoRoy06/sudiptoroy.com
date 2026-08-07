import {lazy, Suspense} from 'react';
import {Route, Routes} from 'react-router-dom';
import Site, {CustomSectionPage} from './site/Site';
import {AuthProvider, RequireAuth} from './admin/auth';

const Admin = lazy(() => import('./admin/Admin'));
const Login = lazy(() => import('./admin/Login'));
const AdminFallback = () => <main className="loading" role="status">Loading admin…</main>;

export default function App({initialContent = null}){
  return <AuthProvider><Routes>
    <Route path="/" element={<Site initialContent={initialContent}/>}/>
    <Route path="/sections/:slug" element={<CustomSectionPage initialContent={initialContent}/>}/>
    <Route path="/sections/:slug/:itemSlug" element={<CustomSectionPage initialContent={initialContent}/>}/>
    <Route path="/admin/login" element={<Suspense fallback={<AdminFallback/>}><Login/></Suspense>}/>
    <Route path="/admin/*" element={<RequireAuth><Suspense fallback={<AdminFallback/>}><Admin/></Suspense></RequireAuth>}/>
    <Route path="*" element={<main className="not-found"><p className="eyebrow">404 · Lost signal</p><h1>This route hasn’t shipped.</h1><a className="button" href="/">Return home</a></main>}/>
  </Routes></AuthProvider>;
}
