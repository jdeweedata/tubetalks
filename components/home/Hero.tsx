'use client';

import SearchBar from '@/components/SearchBar';

export default function Hero() {
  return (
    <div className="pt-28 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-[900px] mx-auto text-center">
          <h1 className="text-5xl sm:text-7xl lg:text-[90px] font-extrabold leading-[0.95] tracking-tight">
            Search any
            <br />
            YouTube Channel
          </h1>
          
          <p className="mt-6 sm:mt-8 text-lg sm:text-xl lg:text-2xl text-gray-400">
            Get detailed analytics and insights to grow your channel
          </p>

          <div className="mt-10 sm:mt-14 max-w-[600px] mx-auto">
            <SearchBar />
          </div>
        </div>
      </div>
    </div>
  );
}

