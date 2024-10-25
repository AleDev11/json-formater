"use client";
import { useState, useEffect, useRef } from 'react';
import { JsonInputForm } from '@/components/JsonInputForm';
import { FormattedJsonList } from '@/components/FormattedJsonList';
import { ErrorDialog } from '@/components/ErrorDialog';

export default function Home() {
  const [formattedJsonList, setFormattedJsonList] = useState<string[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');
  const [isError, setIsError] = useState(true);
  const formattedListRef = useRef<HTMLDivElement | null>(null);

  // Cargar datos desde el localStorage al iniciar
  useEffect(() => {
    const savedJsonList = localStorage.getItem('formattedJsonList');
    if (savedJsonList) {
      setFormattedJsonList(JSON.parse(savedJsonList));
    }
  }, []);

  // Guardar datos en localStorage cuando la lista cambia
  useEffect(() => {
    localStorage.setItem('formattedJsonList', JSON.stringify(formattedJsonList));
  }, [formattedJsonList]);

  const handleFormatJson = (jsonInput: string) => {
    try {
      const parsedJson = JSON.parse(jsonInput);
      const formattedJson = JSON.stringify(parsedJson, null, 2);
      setFormattedJsonList((prevList) => [formattedJson, ...prevList]);

      // Scroll automático al último JSON formateado
      setTimeout(() => {
        if (formattedListRef.current) {
          formattedListRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (error) {
      setDialogTitle('Error de Formato JSON');
      setDialogMessage('El JSON ingresado no es válido. Por favor, verifica la sintaxis.');
      setIsError(true);
      setShowDialog(true);
    }
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setDialogTitle('Copiado al Portapapeles');
    setDialogMessage('El contenido JSON se ha copiado correctamente.');
    setIsError(false);
    setShowDialog(true);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          JSON Formatter
        </h1>
        
        <JsonInputForm onFormat={handleFormatJson} />

        {formattedJsonList.length > 0 && (
          <div className="mb-8 p-4 bg-gray-700 text-white rounded-md shadow-md">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold text-blue-300">Último JSON Formateado:</h2>
              <button
                onClick={() => handleCopyToClipboard(formattedJsonList[0])}
                className="text-sm px-3 py-1 bg-green-600 rounded-md hover:bg-green-500"
              >
                Copiar
              </button>
            </div>
            <pre className="whitespace-pre-wrap break-all bg-gray-800 p-3 rounded-md max-h-64 overflow-y-auto">
              {formattedJsonList[0]}
            </pre>
          </div>
        )}

        <FormattedJsonList
          jsonList={formattedJsonList}
          expandedIndex={expandedIndex}
          onToggleExpand={(index: number) => setExpandedIndex(expandedIndex === index ? null : index)}
          onCopy={handleCopyToClipboard}
        />
      </div>

      <ErrorDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        title={dialogTitle}
        message={dialogMessage}
        isError={isError}
      />
    </div>
  );
}
