import { useState } from 'react';

export default function BehaviouralExperimentModal({ open, onClose }) {
  const [form, setForm] = useState({
    negativePrediction: '',
    experimentPlan: '',
    outcome: '',
    compare: '',
    saved: false,
    error: null,
  });

  if (!open) return null;

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    setForm(prev => ({ ...prev, saved: true, error: null }));
    // Optionally, send to API here
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-2xl relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xl"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Behavioural Experiment</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1 text-gray-700 dark:text-gray-200">Negative Prediction</label>
            <textarea
              name="negativePrediction"
              value={form.negativePrediction}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white"
              placeholder="e.g. 'I'll never finish this'"
              required
            />
          </div>
          <div>
            <label className="block font-medium mb-1 text-gray-700 dark:text-gray-200">Experiment Plan</label>
            <textarea
              name="experimentPlan"
              value={form.experimentPlan}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white"
              placeholder="e.g. 'Spend 10 min on it today—see what happens'"
              required
            />
          </div>
          <div>
            <label className="block font-medium mb-1 text-gray-700 dark:text-gray-200">Outcome</label>
            <textarea
              name="outcome"
              value={form.outcome}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white"
              placeholder="What happened when you tried the experiment?"
              required
            />
          </div>
          <div>
            <label className="block font-medium mb-1 text-gray-700 dark:text-gray-200">Compare to Original Fear</label>
            <textarea
              name="compare"
              value={form.compare}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white"
              placeholder="How did the outcome compare to your original fear?"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
          >
            Save Experiment
          </button>
          {form.saved && (
            <div className="mt-2 text-green-600">Experiment saved! (not yet persisted)</div>
          )}
          {form.error && (
            <div className="mt-2 text-red-600">{form.error}</div>
          )}
        </form>
      </div>
    </div>
  );
}
