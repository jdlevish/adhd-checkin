import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

export default function JournalCard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [hasEntry, setHasEntry] = useState(null); // null = loading, true/false = loaded

  useEffect(() => {
    if (!session) return;
    async function checkJournal() {
      try {
        const res = await fetch('/api/journal/get-todays-entry');
        setHasEntry(res.ok);
      } catch {
        setHasEntry(false);
      }
    }
    checkJournal();
  }, [session]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
      <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Journal</h2>
      {hasEntry === null ? (
        <div className="text-gray-500 dark:text-gray-400">Checking journal status...</div>
      ) : hasEntry ? (
        <div className="text-green-600 dark:text-green-400 mb-4">You have written a journal entry today.</div>
      ) : (
        <div className="text-yellow-700 dark:text-yellow-300 mb-4">You haven't written a journal entry today.</div>
      )}
      <button
        onClick={() => router.push('/journal')}
        className="w-full px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700 flex items-center justify-center"
      >
        {hasEntry ? 'View/Edit Today\'s Entry' : "Write Today's Journal Entry"}
      </button>
    </div>
  );
}
