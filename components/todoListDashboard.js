import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

// Theme context for dark mode functionality
import { useTheme } from '../context/ThemeContext';

/**
 * TodoListDashboard Component
 * 
 * A dashboard component for managing a user's todo list.
 * Allows users to create, complete, and delete todo items,
 * as well as import goals from today's check-in.
 * 
 * @returns {JSX.Element} The todo list dashboard component
 */
export default function TodoListDashboard() {
  // Authentication session
  const { data: session } = useSession();
  
  // Theme context for dark mode
  const { darkMode } = useTheme();
  
  // State for todo list
  const [todos, setTodos] = useState([]);
  const [newTodoText, setNewTodoText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for today's check-in
  const [todaysCheckin, setTodaysCheckin] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  
  /**
   * Fetch the user's todo list from the API
   */
  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/todos/get-user-todos');
      
      if (!response.ok) {
        throw new Error('Failed to fetch todos');
      }
      
      const data = await response.json();
      setTodos(data.todos);
    } catch (err) {
      console.error('Error fetching todos:', err);
      setError('Failed to load your todo list. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Fetch today's check-in from the API
   */
  const fetchTodaysCheckin = async () => {
    try {
      const response = await fetch('/api/checkins/get-todays-checkin');
      
      if (response.status === 404) {
        // No check-in for today, which is fine
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch today\'s check-in');
      }
      
      const data = await response.json();
      setTodaysCheckin(data);
    } catch (err) {
      console.error('Error fetching today\'s check-in:', err);
      // Not setting error state here as this is not critical
    }
  };
  
  /**
   * Load initial data when component mounts
   */
  useEffect(() => {
    if (session) {
      fetchTodos();
      fetchTodaysCheckin();
    }
  }, [session]);
  
  /**
   * Handle adding a new todo item
   */
  const handleAddTodo = async (e) => {
    e.preventDefault();
    
    if (!newTodoText.trim()) {
      return;
    }
    
    try {
      const response = await fetch('/api/todos/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: newTodoText }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create todo');
      }
      
      const newTodo = await response.json();
      setTodos([newTodo, ...todos]);
      setNewTodoText('');
    } catch (err) {
      console.error('Error adding todo:', err);
      setError('Failed to add todo. Please try again.');
    }
  };
  
  /**
   * Handle toggling a todo item's completed status
   */
  const handleToggleTodo = async (todoId) => {
    try {
      const todoToUpdate = todos.find(todo => todo._id === todoId);
      const updatedTodo = { ...todoToUpdate, completed: !todoToUpdate.completed };
      
      // Optimistically update UI
      setTodos(todos.map(todo => 
        todo._id === todoId ? updatedTodo : todo
      ));
      
      // Update in database
      const response = await fetch(`/api/todos/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          todoId, 
          completed: updatedTodo.completed 
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update todo');
      }
    } catch (err) {
      console.error('Error updating todo:', err);
      setError('Failed to update todo. Please try again.');
      // Revert the optimistic update
      fetchTodos();
    }
  };
  
  /**
   * Handle deleting a todo item
   */
  const handleDeleteTodo = async (todoId) => {
    try {
      // Optimistically update UI
      setTodos(todos.filter(todo => todo._id !== todoId));
      
      // Delete from database
      const response = await fetch(`/api/todos/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ todoId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete todo');
      }
    } catch (err) {
      console.error('Error deleting todo:', err);
      setError('Failed to delete todo. Please try again.');
      // Revert the optimistic update
      fetchTodos();
    }
  };
  
  /**
   * Import goals from today's check-in as todo items
   */
  const handleImportGoals = async () => {
    if (!todaysCheckin) {
      setError('No check-in found for today. Please complete a check-in first.');
      return;
    }
    
    try {
      setImportLoading(true);
      
      const response = await fetch('/api/todos/import-from-checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ checkinId: todaysCheckin._id }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to import goals');
      }
      
      const data = await response.json();
      
      // Update the todo list with the newly imported items
      fetchTodos();
      
      // Show success message
      setImportSuccess(true);
      setTimeout(() => setImportSuccess(false), 3000);
    } catch (err) {
      console.error('Error importing goals:', err);
      setError('Failed to import goals. Please try again.');
    } finally {
      setImportLoading(false);
    }
  };
  
  /**
   * Clear error message
   */
  const clearError = () => {
    setError(null);
  };
  
  // Show loading state
  if (loading && todos.length === 0) {
    return (
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md transition-colors">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Todo List</h2>
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md transition-colors">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Todo List</h2>
      
      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-md flex justify-between items-center">
          <p>{error}</p>
          <button 
            onClick={clearError}
            className="text-red-800 dark:text-red-200 hover:text-red-600 dark:hover:text-red-400"
            aria-label="Dismiss error"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      
      {/* Success message for import */}
      {importSuccess && (
        <div className="mb-4 p-3 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-md">
          <p>Goals successfully imported as todo items!</p>
        </div>
      )}
      
      {/* Import goals button */}
      {todaysCheckin && (
        <div className="mb-4">
          <button
            onClick={handleImportGoals}
            disabled={importLoading}
            className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {importLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Importing...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Import Goals from Today's Check-in
              </>
            )}
          </button>
        </div>
      )}
      
      {/* Add new todo form */}
      <form onSubmit={handleAddTodo} className="mb-6">
        <div className="flex">
          <input
            type="text"
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
            placeholder="Add a new todo..."
            className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-l-md focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            Add
          </button>
        </div>
      </form>
      
      {/* Todo list */}
      <ul className="space-y-2">
        {todos.length === 0 ? (
          <li className="p-3 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-600 dark:text-gray-300">
            No todos yet. Add one above or import from today's check-in.
          </li>
        ) : (
          todos.map((todo) => (
            <li 
              key={todo._id}
              className="p-3 bg-gray-100 dark:bg-gray-700 rounded-md flex justify-between items-center"
            >
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => handleToggleTodo(todo._id)}
                  className="h-5 w-5 text-blue-500 focus:ring-blue-400 dark:focus:ring-blue-500 rounded"
                />
                <span 
                  className={`ml-3 ${todo.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}
                >
                  {todo.text}
                </span>
              </div>
              <button
                onClick={() => handleDeleteTodo(todo._id)}
                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                aria-label="Delete todo"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}