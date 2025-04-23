/**
 * CheckInModal Component
 * 
 * A modal component for creating or editing daily check-ins.
 * Allows users to set their goals and intentions for the day.
 * 
 * @module components/CheckInModal
 */

import { useState, useEffect } from 'react';

/**
 * CheckInModal Component
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is currently open
 * @param {Function} props.onClose - Function to call when closing the modal
 * @param {Function} props.onSubmit - Function to call when submitting the form
 * @param {boolean} props.isEditMode - Whether the modal is in edit mode (default: false)
 * @param {Object|null} props.initialData - Initial data for editing (default: null)
 * @returns {JSX.Element|null} The modal component or null if not open
 */
export default function CheckInModal({ isOpen, onClose, onSubmit, isEditMode = false, initialData = null }) {
  // State for an array of goals
  const [goals, setGoals] = useState(['']);
  // State for intentions
  const [intentions, setIntentions] = useState('');

  /**
   * Effect to load initial data when in edit mode
   * 
   * This populates the form fields with existing data when editing a check-in.
   * It handles both the new array format for goals and the older individual field format
   * for backward compatibility.
   */
  useEffect(() => {
    if (isEditMode && initialData) {
      if (Array.isArray(initialData.goals)) {
        setGoals(initialData.goals.length > 0 ? initialData.goals : ['']);
      } else {
        // Fallback for older data format
        const fallbackGoals = [initialData.goal1, initialData.goal2, initialData.goal3, initialData.goal4].filter(Boolean);
        setGoals(fallbackGoals.length > 0 ? fallbackGoals : ['']);
      }
      setIntentions(initialData.intentions || '');
    }
  }, [isEditMode, initialData]);

  /**
   * Handles form submission
   * 
   * Prevents default form submission, packages the form data,
   * and calls the onSubmit callback with the data. Preserves the original
   * date when editing an existing check-in.
   * 
   * @param {Event} e - The form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Filter out empty goals
    const validGoals = goals.map(g => g.trim()).filter(Boolean);
    if (validGoals.length < 1) {
      alert('Please enter at least one goal.');
      return;
    }
    const date = isEditMode && initialData ? initialData.date : new Date();
    await onSubmit({ goals: validGoals, intentions, date });
    setGoals(['']);
    setIntentions('');
    onClose();
  };

  if (!isOpen) return null;

  // Handlers for dynamic goals
  const handleGoalChange = (idx, value) => {
    setGoals(goals => goals.map((g, i) => (i === idx ? value : g)));
  };
  const handleAddGoal = () => setGoals(goals => [...goals, '']);
  const handleRemoveGoal = (idx) => {
    if (goals.length === 1) return; // always keep at least one
    setGoals(goals => goals.filter((_, i) => i !== idx));
  };

  /**
   * Render the modal with form for check-in data
   */
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {/* Modal container with dark mode support */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md transition-colors">
        {/* Modal header with title and close button */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {isEditMode ? 'Edit Check-in' : 'Morning Check-in'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* Check-in form */}
        <form onSubmit={handleSubmit}>
          {/* Goals section */}
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
              What are your main goals for today?
            </label>
            {goals.map((goal, idx) => (
              <div key={idx} className="flex items-start mb-2">
                <textarea
                  value={goal}
                  onChange={e => handleGoalChange(idx, e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 min-h-[60px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder={`Goal ${idx + 1}`}
                  required={idx === 0} // Only require the first goal
                />
                {goals.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveGoal(idx)}
                    className="ml-2 mt-1 text-red-500 hover:text-red-700"
                    aria-label="Remove goal"
                  >
                    &times;
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddGoal}
              className="mt-2 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
            >
              + Add Another Goal
            </button>
          </div>
          {/* Intentions section */}
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
              What are your intentions for the day?
            </label>
            {/* Intentions input - for setting focus, mindset, and approach for the day */}
            <textarea
              value={intentions}
              onChange={(e) => setIntentions(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 min-h-[100px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Set your intentions (e.g., stay focused, take breaks when needed)..."
              required
            />
          </div>
          {/* Form action buttons */}
          <div className="flex justify-end space-x-3">
            {/* Cancel button */}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
            >
              Cancel
            </button>
            {/* Submit button - text changes based on mode */}
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              {isEditMode ? 'Update Check-in' : 'Save Check-in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
