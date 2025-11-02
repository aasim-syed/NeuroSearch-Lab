import React from "react";
export function Controls(props:{ label:string; value:number; min:number; max:number; step?:number; onChange:(v:number)=>void }){
  return (
    <div>
      <div className="label">{props.label}: {props.value}</div>
      <input className="slider" type="range" value={props.value} min={props.min} max={props.max} step={props.step??1} onChange={(e)=>props.onChange(Number(e.target.value))} />
    </div>
  );
}
