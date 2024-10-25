import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface GeneratedPythonModelsProps {
  models: string[];
  onCopy: (content: string) => void;
}

export function GeneratedPythonModels({ models, onCopy }: GeneratedPythonModelsProps) {
  return (
    <div className="relative mt-8">
      <div className="bg-gray-800 p-6 rounded-md shadow-md">
        <h2 className="text-2xl font-bold text-white mb-4">Modelos Generados (Python)</h2>
        <div className="max-h-96 overflow-y-auto space-y-4">
          {models.map((model, index) => (
            <div key={index} className="bg-gray-700 p-4 rounded-md">
              <SyntaxHighlighter
                language="python"
                style={atomDark}
                wrapLines={true}
                customStyle={{ backgroundColor: 'transparent' }}
              >
                {model}
              </SyntaxHighlighter>
            </div>
          ))}
        </div>
        {/* Botón de copiar en la parte superior derecha, igual al de interfaces */}
        <button
          onClick={() => onCopy(models.join('\n\n'))}
          className="absolute top-4 right-4 px-3 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-500"
        >
          Copiar Modelos
        </button>
      </div>
    </div>
  );
}
