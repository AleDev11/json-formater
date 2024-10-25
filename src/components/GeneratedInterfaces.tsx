import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface GeneratedInterfacesProps {
  interfaces: string[];
}

export function GeneratedInterfaces({ interfaces }: GeneratedInterfacesProps) {
  return (
    <div className="bg-gray-800 p-6 rounded-md shadow-md mt-8">
      <h2 className="text-2xl font-bold text-white mb-4">Interfaces Generadas (TypeScript)</h2>
      <div className="max-h-96 overflow-y-auto space-y-4">
        {interfaces.length === 0 ? (
          <p className="text-gray-400">No hay interfaces generadas aún.</p>
        ) : (
          interfaces.map((interfaceStr, index) => (
            <div
              key={index}
              className="p-4 bg-gray-700 text-white rounded-md shadow-md"
            >
              <SyntaxHighlighter
                language="typescript"
                style={atomDark}
                wrapLines={true}
                customStyle={{ backgroundColor: 'transparent' }}
              >
                {interfaceStr}
              </SyntaxHighlighter>
            </div>
          ))
        )}
      </div>
    </div>
  );
}