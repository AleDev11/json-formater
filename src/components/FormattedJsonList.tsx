import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface FormattedJsonListProps {
  jsonList: string[];
  expandedIndex: number | null;
  onToggleExpand: (index: number) => void;
  onCopy: (text: string) => void;
  onGenerateInterface: (jsonString: string) => void; // Nueva función
}

export function FormattedJsonList({
  jsonList,
  expandedIndex,
  onToggleExpand,
  onCopy,
  onGenerateInterface,
}: FormattedJsonListProps) {
  return (
    <div className="bg-gray-800 p-6 rounded-md shadow-md">
      <h2 className="text-2xl font-bold text-white mb-4">JSONs Formateados</h2>
      <div className="max-h-96 overflow-y-auto space-y-4">
        {jsonList.length === 0 ? (
          <p className="text-gray-400">No hay JSONs formateados aún.</p>
        ) : (
          jsonList.map((formattedJson, index) => {
            const isExpanded = expandedIndex === index;
            const isLongText = formattedJson.length > 300;
            const displayText = isExpanded || !isLongText
              ? formattedJson
              : `${formattedJson.substring(0, 300)}...`;

            return (
              <div
                key={index}
                className="p-4 bg-gray-700 text-white rounded-md shadow-md relative"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-lg font-semibold text-blue-300">
                    JSON #{jsonList.length - index}
                  </span>
                  <div className="flex gap-2">
                    {isLongText && (
                      <button
                        onClick={() => onToggleExpand(index)}
                        className="text-sm px-3 py-1 bg-gray-600 rounded-md hover:bg-gray-500"
                      >
                        {isExpanded ? 'Ver Menos' : 'Ver Más'}
                      </button>
                    )}
                    <button
                      onClick={() => onCopy(formattedJson)}
                      className="text-sm px-3 py-1 bg-green-600 rounded-md hover:bg-green-500"
                    >
                      Copiar
                    </button>
                    <button
                      onClick={() => onGenerateInterface(formattedJson)}
                      className="text-sm px-3 py-1 bg-blue-600 rounded-md hover:bg-blue-500"
                    >
                      Generar Interfaz
                    </button>
                  </div>
                </div>
                <div className="bg-gray-800 p-3 rounded-md overflow-x-auto">
                  <SyntaxHighlighter
                    language="json"
                    style={atomDark}
                    wrapLines={true}
                    customStyle={{ backgroundColor: 'transparent' }}
                  >
                    {displayText}
                  </SyntaxHighlighter>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
