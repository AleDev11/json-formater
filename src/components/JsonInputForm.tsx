"use client";
import React, { useState } from 'react';

interface JsonInputFormProps {
  onFormat: (jsonInput: string) => void;
}

export function JsonInputForm({ onFormat }: JsonInputFormProps) {
  const [jsonInput, setJsonInput] = useState('');

  const handleFormatClick = () => {
    onFormat(jsonInput);
    setJsonInput('');
  };

  return (
    <div className="mb-6">
      <textarea
        value={jsonInput}
        onChange={(e) => setJsonInput(e.target.value)}
        placeholder="Ingresa tu JSON aquí..."
        className="w-full h-40 p-4 bg-gray-800 text-white rounded-md resize-none mb-4"
      />
      <button
        onClick={handleFormatClick}
        className="w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Formatear y Validar JSON
      </button>
    </div>
  );
}
