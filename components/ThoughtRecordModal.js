import { useState } from 'react';
import ThoughtRecord from './ThoughtRecord';

export default function ThoughtRecordModal({ open, onClose }) {
  if (!open) return null;
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
        <ThoughtRecord />
      </div>
    </div>
  );
}
