'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const sortOptions = [
  { label: 'Most Recent', value: 'date' },
  { label: 'Most Viewed', value: 'views' },
  { label: 'Duration', value: 'duration' }
];

const durationOptions = [
  { label: 'Any', value: 'any' },
  { label: 'Short (< 4 min)', value: 'short' },
  { label: 'Medium (4-20 min)', value: 'medium' },
  { label: 'Long (> 20 min)', value: 'long' }
];

export default function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'date');
  const [duration, setDuration] = useState(searchParams.get('duration') || 'any');

  const handleFilterChange = (type: 'sort' | 'duration', value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(type, value);
    
    if (type === 'sort') {
      setSortBy(value);
    } else {
      setDuration(value);
    }

    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg transition-colors">
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sort By</label>
        <select
          value={sortBy}
          onChange={(e) => handleFilterChange('sort', e.target.value)}
          className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md px-3 py-2 border border-gray-300 dark:border-gray-600 focus:border-red-500 dark:focus:border-red-500 focus:ring-1 focus:ring-red-500 dark:focus:ring-red-500 transition-colors"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Duration</label>
        <select
          value={duration}
          onChange={(e) => handleFilterChange('duration', e.target.value)}
          className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md px-3 py-2 border border-gray-300 dark:border-gray-600 focus:border-red-500 dark:focus:border-red-500 focus:ring-1 focus:ring-red-500 dark:focus:ring-red-500 transition-colors"
        >
          {durationOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
} 