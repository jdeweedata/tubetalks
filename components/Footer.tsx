import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Link href="/" className="text-white text-xl font-bold">
              TubeTalks
            </Link>
            <p className="text-gray-400 mt-2">
              YouTube Channel Analytics and Insights
            </p>
          </div>
          <div className="flex space-x-6">
            <Link href="/about" className="text-gray-300 hover:text-white">
              About
            </Link>
            <Link href="/privacy" className="text-gray-300 hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-300 hover:text-white">
              Terms of Service
            </Link>
          </div>
        </div>
        <div className="mt-8 text-center text-gray-400">
          © {new Date().getFullYear()} TubeTalks. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

