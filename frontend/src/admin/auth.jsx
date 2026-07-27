import {createContext,useContext,useEffect,useState} from 'react';
import {Navigate,useLocation} from 'react-router-dom';
import {apiUrl} from '../api';
const C=createContext();export const useAuth=()=>useContext(C);
export function AuthProvider({children}){const [user,setUser]=useState(undefined);const refresh=()=>fetch(apiUrl('/api/auth/session'),{credentials:'include'}).then(r=>r.ok?r.json():null).then(x=>setUser(x?.user||null)).catch(()=>setUser(null));useEffect(()=>{refresh()},[]);return <C.Provider value={{user,setUser,refresh}}>{children}</C.Provider>}
export function RequireAuth({children}){const {user}=useAuth(),loc=useLocation();if(user===undefined)return <div className="loading" role="status">Checking secure session…</div>;return user?children:<Navigate to="/admin/login" state={{from:loc}} replace/>}
