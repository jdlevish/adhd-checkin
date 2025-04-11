import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import CheckInModal from '../components/CheckInModal';
import ThemeToggle from '../components/ThemeToggle';
import CheckInHistory from '../components/CheckInHistory';
import ProgressOverview from '../components/ProgressOverview';
import { useTheme } from '../context/ThemeContext';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastCheckIn, setLastCheckIn] = useState(null);
  const { darkMode } = useTheme();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
      <nav className="bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">ADHD Check-in</h1>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <span className="text-gray-700 dark:text-gray-300">Welcome, {session.user.name}</span>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="text-sm bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Daily Check-in Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Daily Check-in</h2>
            {lastCheckIn ? (
              <div className="space-y-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Last check-in: {new Date(lastCheckIn.date).toLocaleDateString()}
                </div>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors"
                >
                  Complete Another Check-in
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
              >
                Start Check-in
              </button>
            )}
          </div>

          {/* Check-in History Card - Spans 2 columns on larger screens */}
          <div className="md:col-span-2">
            <CheckInHistory />
          </div>
          
          {/* Progress Card */}
          <ProgressOverview />

          {/* Tips Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Daily Tips</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Remember to break large tasks into smaller, manageable chunks.
            </p>
          </div>
        </div>
      </main>

      <CheckInModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={async (checkInData) => {
          try {
            const res = await fetch('/api/checkins/create', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(checkInData),
            });

            if (res.ok) {
              setLastCheckIn(checkInData);
              alert('Check-in saved successfully!');
            } else {
              const error = await res.json();
              alert(error.message);
            }
          } catch (error) {
            alert('Error saving check-in');
          }
        }}
      />
    </div>
  );
}
