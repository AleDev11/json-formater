"use client";
import { useState, useEffect, useRef } from 'react';
import { JsonInputForm } from '@/components/JsonInputForm';
import { FormattedJsonList } from '@/components/FormattedJsonList';
import { ErrorDialog } from '@/components/ErrorDialog';
import jsonToTS from 'json-to-ts'; // Importar la librería para generar las interfaces
import { GeneratedInterfaces } from '@/components/GeneratedInterfaces';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

export default function Home() {
  const [formattedJsonList, setFormattedJsonList] = useState<string[]>([]);
  const [generatedInterfaces, setGeneratedInterfaces] = useState<string[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');
  const [isError, setIsError] = useState(true);
  const formattedListRef = useRef<HTMLDivElement | null>(null);
  const interfacesSectionRef = useRef<HTMLDivElement | null>(null); // Ref para las interfaces generadas

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
      console.error(error);
      setDialogTitle('Error de Formato JSON');
      setDialogMessage('El JSON ingresado no es válido. Por favor, verifica la sintaxis.');
      setIsError(true);
      setShowDialog(true);
    }
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setDialogTitle('Copiado al Portapapeles');
    setDialogMessage('El contenido se ha copiado correctamente.');
    setIsError(false);
    setShowDialog(true);
  };

  // Función para generar las interfaces TypeScript
  const generateTypescriptInterfaces = (jsonString?: string) => {
    const jsonToParse = jsonString || formattedJsonList[0];
    if (!jsonToParse) return;

    try {
      const parsedJson = JSON.parse(jsonToParse);
      const interfacesArray = jsonToTS(parsedJson);
      const interfaces = interfacesArray.map((typeInterface) => typeInterface).join('\n\n');
      setGeneratedInterfaces([interfaces]);

      // Scroll automático a la sección de interfaces generadas
      setTimeout(() => {
        if (interfacesSectionRef.current) {
          interfacesSectionRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (error) {
      console.error(error);
      setDialogTitle('Error al Generar Interfaces');
      setDialogMessage('No se pudieron generar las interfaces. Asegúrate de que el JSON esté bien formateado.');
      setIsError(true);
      setShowDialog(true);
    }
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
            <div className="bg-gray-800 p-3 rounded-md overflow-x-auto">
              <SyntaxHighlighter
                language="json"
                style={atomDark}
                wrapLines={true}
                customStyle={{ backgroundColor: 'transparent' }}
              >
                {formattedJsonList[0]}
              </SyntaxHighlighter>
            </div>
            <button
              onClick={() => generateTypescriptInterfaces()}
              className="w-full mt-4 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Generar Interfaces TypeScript
            </button>
          </div>
        )}

        <FormattedJsonList
          jsonList={formattedJsonList}
          expandedIndex={expandedIndex}
          onToggleExpand={(index) => setExpandedIndex(expandedIndex === index ? null : index)}
          onCopy={handleCopyToClipboard}
          onGenerateInterface={generateTypescriptInterfaces} // Nueva función para generar interfaz desde historial
        />

        {/* Sección de interfaces generadas con referencia */}
        <div ref={interfacesSectionRef}>
          {generatedInterfaces.length > 0 && (
            <div className="relative">
              <GeneratedInterfaces interfaces={generatedInterfaces} />
              <button
                onClick={() => handleCopyToClipboard(generatedInterfaces.join('\n\n'))}
                className="absolute top-4 right-4 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-500"
              >
                Copiar Interfaces
              </button>
            </div>
          )}
        </div>
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
