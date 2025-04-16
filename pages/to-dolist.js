import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';

// React hooks
import { useState, useEffect } from 'react';

// Component imports
import TodoListDashboard from '../components/todoListDashboard';
import ThemeToggle from '../components/ThemeToggle';

// Theme context for dark mode functionality
import { useTheme } from '../context/ThemeContext';

/**
 * ToDos Page
 * 
 * Page component for the to-do list functionality.
 * Displays the todo list dashboard component within the main layout.
 * 
 * @returns {JSX.Element} The to-do list page component
 */
export default function ToDos() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { darkMode } = useTheme();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  // Show content if authenticated
  if (session) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-md transition-colors">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">ADHD Check-in</h1>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">My To-Do List</h1>
          <TodoListDashboard />
        </main>
      </div>
    );
  }

  // Return null if not authenticated (will redirect)
  return null;
}