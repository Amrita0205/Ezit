import React from 'react';

interface ContentFiltersProps {
  searchQuery: string;
  onSearchChange: (v: string) => void;
  selectedType: string;
  onTypeChange: (v: string) => void;
  selectedDateRange: string;
  onDateRangeChange: (v: string) => void;
  selectedPerformance: string;
  onPerformanceChange: (v: string) => void;
  onClear: () => void;
}

const ContentFilters: React.FC<ContentFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
  selectedDateRange,
  onDateRangeChange,
  selectedPerformance,
  onPerformanceChange,
  onClear,
}) => (
  <div className="flex flex-wrap gap-2 mb-6 items-end">
    <input
      type="text"
      placeholder="Search..."
      value={searchQuery}
      onChange={e => onSearchChange(e.target.value)}
      className="border rounded px-3 py-2 text-sm"
    />
    <select value={selectedType} onChange={e => onTypeChange(e.target.value)} className="border rounded px-3 py-2 text-sm">
      <option value="all">All Types</option>
      <option value="image">Image</option>
      <option value="video">Video</option>
      <option value="text">Text</option>
    </select>
    <select value={selectedDateRange} onChange={e => onDateRangeChange(e.target.value)} className="border rounded px-3 py-2 text-sm">
      <option value="7days">Last 7 Days</option>
      <option value="30days">Last 30 Days</option>
      <option value="90days">Last 90 Days</option>
    </select>
    <select value={selectedPerformance} onChange={e => onPerformanceChange(e.target.value)} className="border rounded px-3 py-2 text-sm">
      <option value="all">All Performance</option>
      <option value="top">Top</option>
      <option value="average">Average</option>
      <option value="low">Low</option>
    </select>
    <button onClick={onClear} className="ml-2 px-3 py-2 rounded bg-gray-200 text-gray-700 text-sm">Clear All</button>
  </div>
);

export default ContentFilters; 