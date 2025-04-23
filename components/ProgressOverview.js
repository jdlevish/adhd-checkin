/**
 * ProgressOverview Component
 * 
 * This component displays the user's check-in statistics including
 * total number of check-ins completed and current streak.
 * It provides visual feedback on progress with progress bars and indicators.
 * 
 * @module components/ProgressOverview
 */

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

/**
 * ProgressOverview Component
 * 
 * Displays the user's check-in statistics and progress visualization
 * 
 * @returns {JSX.Element} The progress overview component
 */
export default function ProgressOverview() {
  // Get the user session for authentication
  const { data: session } = useSession();
  
  // State for check-in statistics
  const [stats, setStats] = useState({ totalCheckins: 0, currentStreak: 0 });
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Effect to fetch stats when session is available
   * Triggers the stats fetch when the user is authenticated
   */
  useEffect(() => {
    if (session) {
      fetchStats();
    }
  }, [session]);

  /**
   * Fetches the user's check-in statistics from the API
   * 
   * Retrieves total check-ins and current streak data from the server
   * and updates the component state accordingly.
   */
  const fetchStats = async () => {
    try {
      // Set loading state while fetching data
      setIsLoading(true);
      
      // Call the stats API endpoint
      const response = await fetch('/api/checkins/get-stats');
      
      // Handle non-200 responses
      if (!response.ok) {
        throw new Error('Failed to fetch check-in stats');
      }
      
      // Parse and store the statistics data
      const data = await response.json();
      setStats(data);
    } catch (err) {
      // Handle and log any errors
      console.error('Error fetching stats:', err);
      setError('Failed to load your progress stats');
    } finally {
      // Always turn off loading state when done
      setIsLoading(false);
    }
  };

  /**
   * Loading state UI
   * Displays a spinner while data is being fetched
   */
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Progress Overview</h2>
        <div className="flex justify-center items-center h-20">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  /**
   * Error state UI
   * Displays an error message if data fetching failed
   */
  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Progress Overview</h2>
        <div className="text-red-500 text-center">
          {error}
        </div>
      </div>
    );
  }

  /**
   * Main component render
   * Displays the progress overview with statistics and visual indicators
   */
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors md:col-span-3">
      <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Progress Overview</h2>
      
      <div className="space-y-4">
        {/* Total check-ins counter with progress bar */}
        <div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Check-ins completed:</span>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalCheckins}</span>
          </div>
          {/* Progress bar that fills based on number of check-ins (max 10 check-ins = 100%) */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${Math.min(stats.totalCheckins * 10, 100)}%` }}
              aria-label={`${Math.min(stats.totalCheckins * 10, 100)}% progress`}
            ></div>
          </div>
        </div>
        
        {/* Current streak counter with visual indicators */}
        <div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Current streak:</span>
            <div className="flex items-center">
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.currentStreak}</span>
              <span className="ml-1 text-gray-600 dark:text-gray-400">days</span>
            </div>
          </div>
          
          {/* Visual streak indicators - shows up to 7 days */}
          <div className="flex items-center mt-2 space-x-1">
            {/* Create 7 day indicators */}
            {[...Array(7)].map((_, i) => (
              <div 
                key={i}
                className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium
                  ${i < stats.currentStreak % 7 
                    ? 'bg-green-500 text-white' // Active streak day
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'}`} // Inactive day
                aria-label={i < stats.currentStreak % 7 ? 'Active streak day' : 'Inactive day'}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>
        
        {/* Motivational message based on streak length */}
        {stats.currentStreak > 0 && (
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {stats.currentStreak === 1 
              ? "Great start! Keep checking in daily to build your streak."
              : `You're on a roll! ${stats.currentStreak} days and counting.`}
          </div>
        )}
      </div>
    </div>
  );
}
