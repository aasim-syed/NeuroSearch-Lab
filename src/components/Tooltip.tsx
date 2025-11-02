import React from "react";

export function Tooltip({children, text}:{children:React.ReactNode; text:string}){
  const [open,setOpen]=React.useState(false);
  return (
    <span style={{position:'relative', display:'inline-block'}}
          onMouseEnter={()=>setOpen(true)} onMouseLeave={()=>setOpen(false)}>
      {children}
      {open && (
        <span style={{
          position:'absolute', top:'calc(100% + 8px)', left:'50%',
          transform:'translateX(-50%)', background:'var(--card)', color:'var(--fg)',
          border:'1px solid var(--border)', padding:'8px 10px', borderRadius:8,
          fontSize:12, whiteSpace:'nowrap', boxShadow:'0 6px 20px rgba(0,0,0,.2)'
        }}>
          {text}
        </span>
      )}
    </span>
  );
}
