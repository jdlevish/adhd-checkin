import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function ProgressOverview() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({ totalCheckins: 0, currentStreak: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (session) {
      fetchStats();
    }
  }, [session]);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/checkins/get-stats');
      
      if (!response.ok) {
        throw new Error('Failed to fetch check-in stats');
      }
      
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to load your progress stats');
    } finally {
      setIsLoading(false);
    }
  };

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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
      <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Progress Overview</h2>
      
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Check-ins completed:</span>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalCheckins}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${Math.min(stats.totalCheckins * 10, 100)}%` }}
            ></div>
          </div>
        </div>
        
        <div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Current streak:</span>
            <div className="flex items-center">
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.currentStreak}</span>
              <span className="ml-1 text-gray-600 dark:text-gray-400">days</span>
            </div>
          </div>
          
          <div className="flex items-center mt-2 space-x-1">
            {[...Array(7)].map((_, i) => (
              <div 
                key={i}
                className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium
                  ${i < stats.currentStreak % 7 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'}`}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>
        
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
