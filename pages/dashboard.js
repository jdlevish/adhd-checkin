/**
 * Dashboard Page Component
 * 
 * This is the main dashboard page of the ADHD Check-in application.
 * It displays the user's check-in status, history, progress, and provides
 * functionality to create or edit check-ins.
 */

// Authentication and routing imports
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';

// React hooks
import { useState, useEffect } from 'react';

// Component imports
import CheckInModal from '../components/CheckInModal';
import ThemeToggle from '../components/ThemeToggle';
import CheckInHistory from '../components/CheckInHistory';
import ProgressOverview from '../components/ProgressOverview';

// Theme context for dark mode functionality
import { useTheme } from '../context/ThemeContext';

/**
 * Dashboard Component
 * 
 * Main dashboard component that handles user check-ins, authentication,
 * and displays various dashboard cards.
 */
export default function Dashboard() {
  // Authentication state from NextAuth
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // State for managing the check-in modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastCheckIn, setLastCheckIn] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [hasTodayCheckIn, setHasTodayCheckIn] = useState(false);
  
  // Dark mode state from ThemeContext
  const { darkMode } = useTheme();

  /**
   * Authentication check effect
   * Redirects to login page if user is not authenticated
   */
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  /**
   * Fetch latest check-in effect
   * Retrieves the user's most recent check-in when session is available
   */
  useEffect(() => {
    if (session) {
      fetchLatestCheckIn();
    }
  }, [session]);

  /**
   * Fetches the user's most recent check-in
   * 
   * This function retrieves the latest check-in from the API and determines
   * if the user has already completed a check-in for the current day.
   */
  const fetchLatestCheckIn = async () => {
    try {
      // Fetch only the most recent check-in (limit=1)
      const response = await fetch('/api/checkins/get-user-checkins?limit=1');
      if (response.ok) {
        const data = await response.json();
        if (data.checkins && data.checkins.length > 0) {
          const latestCheckIn = data.checkins[0];
          setLastCheckIn(latestCheckIn);
          
          // Check if the latest check-in is from today by comparing dates
          // (ignoring time component by setting hours, minutes, seconds to 0)
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const checkInDate = new Date(latestCheckIn.date);
          checkInDate.setHours(0, 0, 0, 0);
          
          // Compare timestamps to determine if check-in is from today
          setHasTodayCheckIn(today.getTime() === checkInDate.getTime());
        }
      }
    } catch (error) {
      console.error('Error fetching latest check-in:', error);
    }
  };

  /**
   * Handles the submission of check-in data
   * 
   * This function determines whether to create a new check-in or update an existing one
   * based on the isEditMode state. It sends the appropriate request to the API and
   * refreshes the dashboard data upon success.
   * 
   * @param {Object} data - The check-in data from the form (goals, intentions, etc.)
   */
  const handleCheckInSubmit = async (data) => {
    try {
      // Default to creating a new check-in
      let url = '/api/checkins/create';
      let method = 'POST';
      
      // If in edit mode and we have a lastCheckIn, use the update endpoint instead
      if (isEditMode && lastCheckIn) {
        url = `/api/checkins/update?id=${lastCheckIn._id}`;
        method = 'PUT';
      }
      
      // Send the request to the appropriate API endpoint
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        // On success, refresh the latest check-in data to update the UI
        await fetchLatestCheckIn();
        setIsModalOpen(false);
        setIsEditMode(false);
      }
    } catch (error) {
      console.error('Error submitting check-in:', error);
    }
  };

  /**
   * Loading state while authentication status is being determined
   */
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  /**
   * Return null if there's no active session
   * This prevents rendering the dashboard for unauthenticated users
   */
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
          {/* Daily Check-in Card - Allows users to create or edit their daily check-in */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Daily Check-in</h2>
            {lastCheckIn ? (
              // If user has at least one previous check-in
              <div className="space-y-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Last check-in: {new Date(lastCheckIn.date).toLocaleDateString()}
                </div>
                
                {hasTodayCheckIn ? (
                  // If user already has a check-in for today, show edit button
                  <button
                    onClick={() => {
                      setIsEditMode(true);
                      setIsModalOpen(true);
                    }}
                    className="w-full bg-yellow-500 text-white py-2 px-4 rounded-md hover:bg-yellow-600 transition-colors"
                  >
                    Edit Today's Check-in
                  </button>
                ) : (
                  // If user has previous check-ins but none for today
                  <button
                    onClick={() => {
                      setIsEditMode(false);
                      setIsModalOpen(true);
                    }}
                    className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors"
                  >
                    Start Today's Check-in
                  </button>
                )}
              </div>
            ) : (
              // If user has no previous check-ins at all
              <button
                onClick={() => {
                  setIsEditMode(false);
                  setIsModalOpen(true);
                }}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
              >
                Start Today's Check-in
              </button>
            )}
          </div>

          {/* Check-in History Card - Spans 2 columns on larger screens */}
          <div className="md:col-span-2">
            <CheckInHistory />
          </div>
          
         

          {/* Tips Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Daily Tips</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Remember to break large tasks into smaller, manageable chunks.
            </p>
          </div>
        
        {/* add goals to to=do list */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">To-do List</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Add your goals to your to-do list to help you stay organized and focused.
          </p>
        </div>
        {/* Progress Card */}
        <ProgressOverview />
        
        </div>
            
      </main>

      {/* Check-in Modal - Renders conditionally when isModalOpen is true */}
      {isModalOpen && (
        <CheckInModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setIsEditMode(false);
          }}
          onSubmit={handleCheckInSubmit}
          isEditMode={isEditMode} // Pass edit mode status to modal
          initialData={isEditMode ? lastCheckIn : null} // Pass existing data when in edit mode
        />
      )}
    </div>
  );
}
