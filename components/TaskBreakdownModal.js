/**
 * TaskBreakdownModal Component
 * 
 * A modal component for breaking down a task into multiple subtasks.
 * Allows users to add, edit, and remove subtasks before saving.
 * 
 * @module components/TaskBreakdownModal
 */

import { useState } from 'react';

/**
 * TaskBreakdownModal Component
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is currently open
 * @param {Function} props.onClose - Function to call when closing the modal
 * @param {Function} props.onSubmit - Function to call when submitting the subtasks
 * @param {Object} props.parentTask - The parent task being broken down
 * @returns {JSX.Element|null} The modal component or null if not open
 */
export default function TaskBreakdownModal({ isOpen, onClose, onSubmit, parentTask }) {
  // State for subtasks
  const [subtasks, setSubtasks] = useState(['', '', '']);
  
  /**
   * Handle adding a new empty subtask field
   */
  const handleAddSubtask = () => {
    setSubtasks([...subtasks, '']);
  };
  
  /**
   * Handle updating a subtask's text
   * 
   * @param {number} index - The index of the subtask to update
   * @param {string} value - The new value for the subtask
   */
  const handleSubtaskChange = (index, value) => {
    const updatedSubtasks = [...subtasks];
    updatedSubtasks[index] = value;
    setSubtasks(updatedSubtasks);
  };
  
  /**
   * Handle removing a subtask field
   * 
   * @param {number} index - The index of the subtask to remove
   */
  const handleRemoveSubtask = (index) => {
    const updatedSubtasks = subtasks.filter((_, i) => i !== index);
    setSubtasks(updatedSubtasks);
  };
  
  /**
   * Handle form submission
   * 
   * @param {Event} e - The form submission event
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Filter out empty subtasks
    const validSubtasks = subtasks.filter(task => task.trim() !== '');
    
    // Only submit if there's at least one valid subtask
    if (validSubtasks.length > 0) {
      onSubmit(validSubtasks);
    }
    
    // Reset form and close modal
    setSubtasks(['', '', '']);
    onClose();
  };
  
  // Don't render anything if the modal is not open
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md transition-colors">
        {/* Modal header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Break Down Task
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
        
        {/* Parent task info */}
        <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
          <p className="text-sm text-gray-600 dark:text-gray-400">Breaking down:</p>
          <p className="font-medium text-gray-900 dark:text-white">{parentTask?.text}</p>
        </div>
        
        {/* Subtasks form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
              Enter subtasks:
            </label>
            
            {/* Subtask input fields */}
            <div className="space-y-2">
              {subtasks.map((subtask, index) => (
                <div key={index} className="flex items-center">
                  <input
                    type="text"
                    value={subtask}
                    onChange={(e) => handleSubtaskChange(index, e.target.value)}
                    placeholder={`Subtask ${index + 1}`}
                    className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-l-md focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(index)}
                    className="p-2 bg-red-500 text-white rounded-r-md hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
                    aria-label="Remove subtask"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            
            {/* Add subtask button */}
            <button
              type="button"
              onClick={handleAddSubtask}
              className="mt-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 flex items-center"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Another Subtask
            </button>
          </div>
          
          {/* Form action buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              Save Subtasks
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
