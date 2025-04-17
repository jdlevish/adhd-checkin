import { useRouter } from 'next/router';
import { useState } from 'react';

/**
 * Check-in Page
 * 
 * This page handles check-in form submissions.
 * It uses the API route instead of directly connecting to MongoDB.
 * 
 * @returns {JSX.Element} The check-in page component
 */
export default function CheckIn() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  /**
   * Handle form submission
   * 
   * @param {Event} e - The form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      // Get form data
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData.entries());
      
      // Send data to API route
      const response = await fetch('/api/checkins/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save check-in');
      }
      
      // Redirect to dashboard on success
      router.push('/dashboard');
    } catch (err) {
      console.error('Error submitting check-in:', err);
      setError('Failed to save your check-in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Daily Check-in</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {/* Form fields would go here */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              What are your main goals for today?
            </label>
            <textarea
              name="goals"
              className="w-full p-2 border border-gray-300 rounded-md"
              rows="4"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Check-in'}
          </button>
        </form>
      </div>
    </div>
  );
}
