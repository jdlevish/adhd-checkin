import Link from 'next/link';

export default function CBTToolboxCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors flex flex-col justify-between">
      <div>
        <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">CBT Toolbox</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Access practical CBT tools and exercises to help manage your thoughts and emotions.
        </p>
      </div>
      <Link href="/cbt-toolbox">
        <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors mt-2">
          Go to CBT Toolbox
        </button>
      </Link>
    </div>
  );
}
