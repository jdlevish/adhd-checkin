/**
 * TodoListCard Component
 * 
 * A dashboard card component for the to-do list functionality.
 * Allows users to import goals from today's check-in and navigate to the to-do list page.
 * 
 * @module components/TodoListCard
 */

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

/**
 * TodoListCard Component
 * 
 * @returns {JSX.Element} The to-do list card component
 */
export default function TodoListCard({ todaysCheckinId }) {
  // Router for navigation
  const router = useRouter();
  
  // Authentication session
  const { data: session } = useSession();
  
  // State variables
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [goalsImported, setGoalsImported] = useState(false);
  
  /**
   * Check if goals from today's check-in have already been imported
   */
  useEffect(() => {
    const checkImportedGoals = async () => {
      if (!todaysCheckinId || !session) return;
      
      try {
        const response = await fetch(`/api/todos/check-imported-goals?checkinId=${todaysCheckinId}`);
        
        if (!response.ok) {
          throw new Error('Failed to check imported goals');
        }
        
        const data = await response.json();
        setGoalsImported(data.imported);
      } catch (err) {
        console.error('Error checking imported goals:', err);
        // Not setting error state as this is not critical
      }
    };
    
    checkImportedGoals();
  }, [todaysCheckinId, session]);
  
  /**
   * Handle importing goals from today's check-in
   */
  const handleImportGoals = async () => {
    if (!todaysCheckinId) {
      setError('No check-in found for today. Please complete a check-in first.');
      return;
    }
    
    try {
      setLoading(true);
      
      // If goals are already imported, just navigate to the to-do list page
      if (goalsImported) {
        router.push('/to-dolist');
        return;
      }
      
      // Import goals from today's check-in
      const response = await fetch('/api/todos/import-from-checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ checkinId: todaysCheckinId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to import goals');
      }
      
      // Navigate to the to-do list page
      router.push('/to-dolist');
    } catch (err) {
      console.error('Error importing goals:', err);
      setError('Failed to import goals. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Clear error message
   */
  const clearError = () => {
    setError(null);
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
      <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">To-do List</h2>
      
      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-md flex justify-between items-center">
          <p className="text-sm">{error}</p>
          <button 
            onClick={clearError}
            className="text-red-800 dark:text-red-200 hover:text-red-600 dark:hover:text-red-400"
            aria-label="Dismiss error"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        {goalsImported 
          ? "You've already imported today's goals to your to-do list."
          : "Add your goals to your to-do list to help you stay organized and focused."
        }
      </p>
      
      <button
        onClick={handleImportGoals}
        disabled={loading || (!todaysCheckinId && !goalsImported)}
        className="w-full px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            {goalsImported ? "Going to To-do List..." : "Importing..."}
          </>
        ) : (
          <>
            {goalsImported ? (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
                Go to To-do List
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Import Goals to To-do List
              </>
            )}
          </>
        )}
      </button>
    </div>
  );
}
