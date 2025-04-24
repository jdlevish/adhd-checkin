import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useState } from 'react';
import ThoughtRecordModal from '../components/ThoughtRecordModal';
import CognitiveDistortionsQuizModal from '../components/CognitiveDistortionsQuizModal';
import BehaviouralExperimentModal from '../components/BehaviouralExperimentModal';

export default function CBTToolboxPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showThoughtRecord, setShowThoughtRecord] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showExperiment, setShowExperiment] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  if (status === 'loading') return <div>Loading...</div>;
  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 w-full max-w-xl">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">CBT Toolbox</h1>
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          Welcome to your CBT Toolbox! Here you'll find practical exercises and resources to help you manage thoughts and emotions using Cognitive Behavioral Therapy techniques.
        </p>
        <ul className="list-disc pl-5 space-y-2 text-gray-800 dark:text-gray-200">
          <li>Thought Record Worksheet</li>
          <li>Behavioral Activation Planner</li>
          <li>Challenging Negative Thoughts</li>
          <li>Gratitude Journal</li>
          <li>Relaxation & Mindfulness Tools</li>
        </ul>
        <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">(You can expand this page with interactive tools and resources!)</div>
      </div>

      {/* Thought Record Modal Trigger */}
      <ThoughtRecordModal open={showThoughtRecord} onClose={() => setShowThoughtRecord(false)} />
      <button
        className="mt-8 w-full max-w-xs mx-auto bg-purple-600 text-white py-3 px-6 rounded-md hover:bg-purple-700 transition-colors block"
        onClick={() => setShowThoughtRecord(true)}
      >
        Start a Thought Record
      </button>

      {/* Cognitive Distortions Quiz */}
      <CognitiveDistortionsQuizModal open={showQuiz} onClose={() => setShowQuiz(false)} />
      <button
        className="mt-8 w-full max-w-xs mx-auto bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors block"
        onClick={() => setShowQuiz(true)}
      >
        Take Cognitive Distortions Quiz
      </button>

      {/* Behavioural Experiment Modal */}
      <BehaviouralExperimentModal open={showExperiment} onClose={() => setShowExperiment(false)} />
      <button
        className="mt-8 w-full max-w-xs mx-auto bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 transition-colors block"
        onClick={() => setShowExperiment(true)}
      >
        Start a Behavioural Experiment
      </button>
    </div>
  );
}
