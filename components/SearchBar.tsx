'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SearchBar() {
  const [searchValue, setSearchValue] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchValue.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchValue)}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-[600px]">
      <div className="relative">
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search for a YouTube channel"
          className="w-full px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <button
          type="submit"
          className="absolute right-2 top-2 w-10 h-10 bg-red-600 hover:bg-red-700
                   rounded-full flex items-center justify-center transition-colors"
        >
          <Search className="h-5 w-5 text-white" />
        </button>
      </div>
    </form>
  );
}

