import React from 'react';

interface FormattedJsonListProps {
  jsonList: string[];
  expandedIndex: number | null;
  onToggleExpand: (index: number) => void;
  onCopy: (text: string) => void;
}

export function FormattedJsonList({
  jsonList,
  expandedIndex,
  onToggleExpand,
  onCopy,
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
                  </div>
                </div>
                <pre className="whitespace-pre-wrap break-all bg-gray-800 p-3 rounded-md">
                  {displayText}
                </pre>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
