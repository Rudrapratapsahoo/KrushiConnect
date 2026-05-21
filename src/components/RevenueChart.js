'use client';

import React, { useEffect, useState } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const data = [
  { name: 'Jan', Sales: 4000, Revenue: 2400 },
  { name: 'Feb', Sales: 3000, Revenue: 1398 },
  { name: 'Mar', Sales: 9800, Revenue: 8000 },
  { name: 'Apr', Sales: 2780, Revenue: 3908 },
  { name: 'May', Sales: 1890, Revenue: 4800 },
  { name: 'Jun', Sales: 2390, Revenue: 3800 },
  { name: 'Jul', Sales: 3490, Revenue: 4300 },
];

export default function RevenueChart() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-72 w-full bg-stone-50 rounded-2xl animate-pulse flex items-center justify-center text-earth text-sm">
        Loading analytics charts...
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-3xl border border-stone-150 shadow-sm space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-extrabold text-earth-dark text-lg">Sales & Revenue Analytics</h3>
          <p className="text-xs text-earth font-semibold">Monthly overview of sold crops</p>
        </div>
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#16a34a" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#16a34a" stopOpacity={0.0}/>
              </linearGradient>
              <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ca8a04" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ca8a04" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
            <XAxis 
              dataKey="name" 
              stroke="#78716c" 
              fontSize={11} 
              tickLine={false} 
              axisLine={false}
            />
            <YAxis 
              stroke="#78716c" 
              fontSize={11} 
              tickLine={false} 
              axisLine={false}
            />
            <Tooltip 
              contentStyle={{ 
                background: 'rgba(255, 255, 255, 0.95)', 
                border: '1px solid #e7e5e4',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                fontSize: '12px'
              }} 
            />
            <Area 
              type="monotone" 
              dataKey="Sales" 
              stroke="#16a34a" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorSales)" 
            />
            <Area 
              type="monotone" 
              dataKey="Revenue" 
              stroke="#ca8a04" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorRev)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
