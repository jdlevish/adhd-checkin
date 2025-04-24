import { useState } from 'react';

export default function ThoughtRecord() {
  const [form, setForm] = useState({
    situation: '',
    automaticThought: '',
    emotionIntensity: '',
    evidenceFor: '',
    evidenceAgainst: '',
    balancedThought: '',
    newEmotionIntensity: '',
    saved: false,
    error: null,
  });

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    // For now, just show a saved message. You can expand to save to backend if desired.
    setForm(prev => ({ ...prev, saved: true, error: null }));
    // Optionally, send to API here
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8 w-full max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Thought Record</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1 text-gray-700 dark:text-gray-200">Situation</label>
          <textarea
            name="situation"
            value={form.situation}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white"
            placeholder="Describe what happened..."
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1 text-gray-700 dark:text-gray-200">Automatic Thought</label>
          <textarea
            name="automaticThought"
            value={form.automaticThought}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white"
            placeholder="What thought popped into your mind?"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1 text-gray-700 dark:text-gray-200">Emotional Intensity (%)</label>
          <input
            type="number"
            name="emotionIntensity"
            value={form.emotionIntensity}
            onChange={handleChange}
            min="0"
            max="100"
            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white"
            placeholder="0-100"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1 text-gray-700 dark:text-gray-200">Evidence For</label>
          <textarea
            name="evidenceFor"
            value={form.evidenceFor}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white"
            placeholder="What facts support this thought?"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1 text-gray-700 dark:text-gray-200">Evidence Against</label>
          <textarea
            name="evidenceAgainst"
            value={form.evidenceAgainst}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white"
            placeholder="What facts refute this thought?"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1 text-gray-700 dark:text-gray-200">Balanced Thought</label>
          <textarea
            name="balancedThought"
            value={form.balancedThought}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white"
            placeholder="What is a more balanced or realistic thought?"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1 text-gray-700 dark:text-gray-200">New Emotional Intensity (%)</label>
          <input
            type="number"
            name="newEmotionIntensity"
            value={form.newEmotionIntensity}
            onChange={handleChange}
            min="0"
            max="100"
            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white"
            placeholder="0-100"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors"
        >
          Save Thought Record
        </button>
        {form.saved && (
          <div className="mt-2 text-green-600">Thought record saved! (not yet persisted)</div>
        )}
        {form.error && (
          <div className="mt-2 text-red-600">{form.error}</div>
        )}
      </form>
    </div>
  );
}
