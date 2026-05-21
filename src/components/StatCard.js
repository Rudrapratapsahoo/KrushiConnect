import React from 'react';

export default function StatCard({ title, value, icon: Icon, trend, color = 'primary' }) {
  const colorMap = {
    primary: 'text-primary bg-primary-light/40 border-primary/10',
    secondary: 'text-secondary bg-yellow-50 border-yellow-100',
    earth: 'text-earth-dark bg-stone-100 border-stone-200',
    blue: 'text-blue-600 bg-blue-50 border-blue-100',
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-stone-150 shadow-sm flex items-center justify-between transition-all duration-200 hover:shadow-md">
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-wider text-earth">{title}</p>
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-extrabold text-earth-dark tracking-tight">{value}</span>
          {trend && (
            <span className={`text-xs font-bold ${trend.startsWith('+') ? 'text-primary' : 'text-red-500'}`}>
              {trend}
            </span>
          )}
        </div>
      </div>
      <div className={`p-3.5 rounded-2xl border ${colorMap[color] || colorMap.primary}`}>
        <Icon className="h-6 w-6" />
      </div>
    </div>
  );
}
