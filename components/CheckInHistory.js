import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function CheckInHistory() {
  const { data: session } = useSession();
  const [recentCheckins, setRecentCheckins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (session) {
      fetchCheckins();
    }
  }, [session]);

  const fetchCheckins = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/checkins/get-user-checkins?limit=6');
      
      if (!response.ok) {
        throw new Error('Failed to fetch check-ins');
      }
      
      const data = await response.json();
      setRecentCheckins(data.checkins);
    } catch (err) {
      console.error('Error fetching check-ins:', err);
      setError('Failed to load your check-ins');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        {error}
      </div>
    );
  }

  if (recentCheckins.length === 0) {
    return (
      <div className="text-gray-600 dark:text-gray-400 text-center p-4">
        You haven't completed any check-ins yet.
      </div>
    );
  }

  // Most recent check-in is the first one
  const mostRecent = recentCheckins[0];
  // The rest of the check-ins (up to 5)
  const olderCheckins = recentCheckins.slice(1, 6);

  return (
    <div className="space-y-6">
      {/* Most recent check-in */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
          Today's Check-in ({formatDate(mostRecent.date)})
        </h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-1">Goals:</h4>
            <p className="text-xl text-gray-900 dark:text-white">{mostRecent.goals}</p>
          </div>
          
          <div>
            <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-1">Intentions:</h4>
            <p className="text-xl text-gray-900 dark:text-white">{mostRecent.intentions}</p>
          </div>
        </div>
      </div>

      {/* Previous check-ins */}
      {olderCheckins.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Previous Check-ins
          </h3>
          
          <div className="space-y-4 divide-y divide-gray-200 dark:divide-gray-700">
            {olderCheckins.map((checkin, index) => (
              <div key={index} className={index === 0 ? '' : 'pt-4'}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {formatDate(checkin.date)}
                    </h4>
                    <div className="mt-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Goals:</span> {checkin.goals}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Intentions:</span> {checkin.intentions}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
