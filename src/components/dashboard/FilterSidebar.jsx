import React from 'react';

export default function FilterSidebar({ selectedStore, setSelectedStore, timeWindow, setTimeWindow }) {
  return (
    <aside className="p-4 bg-slate-900 text-white rounded-lg shadow-md w-72 flex flex-col gap-4">
      <h2 className="text-lg font-semibold border-b border-slate-700 pb-2">Spatial Controls</h2>
      
      {/* Store Filter */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-slate-400 font-medium">Select Store Location</label>
        <select 
          value={selectedStore} 
          onChange={(e) => setSelectedStore(e.target.value)}
          className="bg-slate-800 border border-slate-700 p-2 rounded text-sm focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Store Locations</option>
          <option value="store_alpha">Store Alpha (Downtown)</option>
          <option value="store_beta">Store Beta (Suburban Mall)</option>
          <option value="store_gamma">Store Gamma (Highway Hub)</option>
        </select>
      </div>

      {/* Time Window Slider / Selector */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-slate-400 font-medium">Time Window: {timeWindow}:00 hrs</label>
        <input 
          type="range" 
          min="0" 
          max="23" 
          value={timeWindow} 
          onChange={(e) => setTimeWindow(e.target.value)}
          className="accent-blue-500 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-500">
          <span>00:00</span>
          <span>12:00</span>
          <span>23:00</span>
        </div>
      </div>
    </aside>
  );
}
