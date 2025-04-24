import { useState } from 'react';

const distortions = [
  { key: 'allOrNothing', label: 'All-or-Nothing Thinking' },
  { key: 'mindReading', label: 'Mind Reading' },
  { key: 'catastrophizing', label: 'Catastrophizing' },
];

const scenario = {
  text: 'You missed a deadline at work. You think, "I always screw up. My boss is going to fire me. Everyone will think I’m incompetent."',
  correct: ['allOrNothing', 'catastrophizing', 'mindReading'],
  feedback: {
    allOrNothing: 'That’s all-or-nothing thinking—believing one mistake means total failure.',
    mindReading: 'That’s mind reading—assuming you know what others think without evidence.',
    catastrophizing: 'That’s catastrophizing—imagining the worst possible outcome.',
  },
  rephrasePrompt: 'How might you rephrase your thought in a more balanced way?'
};

export default function CognitiveDistortionsQuiz() {
  const [selected, setSelected] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [rephrase, setRephrase] = useState('');
  const [showRephrase, setShowRephrase] = useState(false);

  const handleToggle = key => {
    setSelected(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const handleSubmit = e => {
    e.preventDefault();
    setSubmitted(true);
    setShowRephrase(true);
  };

  const isCorrect = key => scenario.correct.includes(key);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8 w-full max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Cognitive Distortions Quiz</h2>
      <div className="mb-4 text-gray-800 dark:text-gray-200">
        <strong>Scenario:</strong> {scenario.text}
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="mb-2 font-medium text-gray-700 dark:text-gray-200">Which distortions apply? (Select all that fit)</div>
          {distortions.map(d => (
            <label key={d.key} className="block mb-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selected.includes(d.key)}
                onChange={() => handleToggle(d.key)}
                className="mr-2"
                disabled={submitted}
              />
              {d.label}
              {submitted && selected.includes(d.key) && (
                <span className={
                  isCorrect(d.key)
                    ? 'ml-2 text-green-600'
                    : 'ml-2 text-red-600'
                }>
                  {isCorrect(d.key)
                    ? `✓ ${scenario.feedback[d.key]}`
                    : '✗ Not quite'}
                </span>
              )}
            </label>
          ))}
        </div>
        {!submitted && (
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Submit
          </button>
        )}
      </form>
      {showRephrase && (
        <div className="mt-6">
          <div className="mb-2 font-medium text-gray-700 dark:text-gray-200">{scenario.rephrasePrompt}</div>
          <textarea
            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white"
            value={rephrase}
            onChange={e => setRephrase(e.target.value)}
            placeholder="Enter a more balanced thought..."
            rows={2}
          />
          {rephrase && (
            <div className="mt-2 text-green-700 dark:text-green-400">Great! Practicing balanced thinking helps challenge distortions.</div>
          )}
        </div>
      )}
    </div>
  );
}
