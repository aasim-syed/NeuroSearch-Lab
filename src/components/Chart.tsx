import React from "react"; 
import { ResponsiveContainer, ScatterChart, CartesianGrid, XAxis, YAxis, Tooltip, Scatter } from "recharts"; 
import type { BenchmarkPoint } from "../lib/types";
export function Chart({points}:{points:BenchmarkPoint[]}){
  return (
    <div style={{height:360}}>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
          <CartesianGrid />
          <XAxis type="number" dataKey="latency" name="Latency" unit="ms"/>
          <YAxis type="number" dataKey="recall" name="Recall" domain={[0,1]} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Scatter name="Configs" data={points} shape="circle"/>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
