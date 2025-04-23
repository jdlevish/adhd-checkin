import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString();
}

export default function JournalPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [entry, setEntry] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const [allEntries, setAllEntries] = useState([]);
  const [showEntries, setShowEntries] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (status === 'authenticated') {
      fetch('/api/journal/get-all')
        .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch entries'))
        .then(data => setAllEntries(data.entries))
        .catch(() => setAllEntries([]));
    }
  }, [status, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/journal/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entry }),
      });
      if (!response.ok) throw new Error('Failed to save journal entry');
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 w-full max-w-xl">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Journal Entry</h1>
        <form onSubmit={handleSubmit}>
          <textarea
            className="w-full h-40 p-2 border border-gray-300 rounded-md mb-4 dark:bg-gray-700 dark:text-white"
            value={entry}
            onChange={e => setEntry(e.target.value)}
            placeholder="Write your thoughts for today..."
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Entry'}
          </button>
        </form>
        {saved && <div className="mt-2 text-green-600">Journal entry saved!</div>}
        {error && <div className="mt-2 text-red-600">{error}</div>}

        {/* Previous Entries Section */}
        <div className="mt-8">
          <button
            className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-md mb-2 hover:bg-gray-300 dark:hover:bg-gray-600"
            onClick={() => setShowEntries(e => !e)}
          >
            {showEntries ? 'Hide Previous Entries' : 'Show Previous Entries'}
          </button>
          {showEntries && (
            <div className="max-h-80 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700 bg-gray-50 dark:bg-gray-900 rounded-md p-2">
              {allEntries.length === 0 && (
                <div className="text-gray-500 text-center py-4">No previous entries found.</div>
              )}
              {allEntries.map(entry => (
                <div key={entry._id || entry.date} className="py-2">
                  <div className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-1">{formatDate(entry.date)}</div>
                  <div className="whitespace-pre-line text-gray-900 dark:text-gray-100 text-sm bg-white dark:bg-gray-800 rounded p-2 border border-gray-200 dark:border-gray-700">{entry.entry}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
