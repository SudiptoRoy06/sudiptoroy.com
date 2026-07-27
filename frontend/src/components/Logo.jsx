export default function Logo({compact=false}){
  return <span className="brand">
    <img src="/favicon.svg?v=12" alt="" aria-hidden="true" width="42" height="42"/>
    {!compact&&<span>Sudipto Roy</span>}
  </span>;
}
