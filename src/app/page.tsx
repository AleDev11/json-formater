"use client";
import { useState, useEffect, useRef } from 'react';
import { JsonInputForm } from '@/components/JsonInputForm';
import { FormattedJsonList } from '@/components/FormattedJsonList';
import { ErrorDialog } from '@/components/ErrorDialog';
import { GeneratedInterfaces } from '@/components/GeneratedInterfaces';
import { GeneratedPythonModels } from '@/components/GeneratedPythonModels';
import ScrollToTopButton from '@/components/ScrollToTopButton';
import Footer from '@/components/Footer';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { quicktype, InputData, jsonInputForTargetLanguage } from 'quicktype-core';
import jsonToTS from 'json-to-ts';

export default function Home() {
  const [formattedJsonList, setFormattedJsonList] = useState<string[]>([]);
  const [generatedInterfaces, setGeneratedInterfaces] = useState<string[]>([]);
  const [generatedPythonModels, setGeneratedPythonModels] = useState<string[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');
  const [isError, setIsError] = useState(true);
  const [wasRepaired, setWasRepaired] = useState(false);
  const formattedListRef = useRef<HTMLDivElement | null>(null);
  const interfacesSectionRef = useRef<HTMLDivElement | null>(null);
  const pythonModelsSectionRef = useRef<HTMLDivElement | null>(null);

  // Cargar el último JSON formateado desde localStorage al iniciar
  useEffect(() => {
    const lastFormattedJson = localStorage.getItem('lastFormattedJson');
    if (lastFormattedJson) {
      setFormattedJsonList([lastFormattedJson]);
    }
  }, []);

  // Guardar solo el último JSON formateado en localStorage
  useEffect(() => {
    if (formattedJsonList.length > 0) {
      localStorage.setItem('lastFormattedJson', formattedJsonList[0]);
    }
  }, [formattedJsonList]);

  // Formatear JSON y agregarlo a la lista (historial en sesión)
  const handleFormatJson = (jsonInput: string, wasRepaired: boolean) => {
    try {
      const parsedJson = JSON.parse(jsonInput);
      const formattedJson = JSON.stringify(parsedJson, null, 2);
      setFormattedJsonList((prevList) => [formattedJson, ...prevList.slice(0, 9)]); // Historial solo en memoria (máx. 10)
      setWasRepaired(wasRepaired);

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

  // Borrar historial almacenado en la sesión
  const handleClearHistory = () => {
    setFormattedJsonList([]);
    setGeneratedInterfaces([]);
    setGeneratedPythonModels([]);
    localStorage.removeItem('lastFormattedJson'); // Limpia el último JSON guardado
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

  // Función para generar modelos Python usando `quicktype-core`
  const generatePythonModels = async (jsonString?: string) => {
    const jsonToParse = jsonString || formattedJsonList[0];
    if (!jsonToParse) return;

    try {
      const parsedJson = JSON.parse(jsonToParse);
      const inputData = new InputData();
      const jsonInput = jsonInputForTargetLanguage('python');
      await jsonInput.addSource({ name: "GeneratedModel", samples: [JSON.stringify(parsedJson)] });
      inputData.addInput(jsonInput);

      const { lines } = await quicktype({
        inputData,
        lang: 'python',
        rendererOptions: {
          'just-types': 'true'
        }
      });

      setGeneratedPythonModels([lines.join('\n')]);

      // Scroll automático a la sección de modelos Python generados
      setTimeout(() => {
        if (pythonModelsSectionRef.current) {
          pythonModelsSectionRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (error) {
      console.error(error);
      setDialogTitle('Error al Generar Modelos Python');
      setDialogMessage('No se pudieron generar los modelos. Asegúrate de que el JSON esté bien formateado.');
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

        {/* Botón para borrar historial */}
        <div className="flex justify-end my-4">
          <button
            onClick={handleClearHistory}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Borrar Historial
          </button>
        </div>

        {/* Formulario de entrada JSON */}
        <JsonInputForm onFormat={handleFormatJson} />

        {formattedJsonList.length > 0 && (
          <div className="mb-8 p-4 bg-gray-700 text-white rounded-md shadow-md">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold text-blue-300">Último JSON Formateado:</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => generateTypescriptInterfaces()}
                  className="text-sm px-3 py-1 bg-blue-600 rounded-md hover:bg-blue-500"
                >
                  Generar Interfaces TypeScript
                </button>
                <button
                  onClick={() => generatePythonModels()}
                  className="text-sm px-3 py-1 bg-yellow-600 rounded-md hover:bg-yellow-500"
                >
                  Generar Modelos Python
                </button>
                <button
                  onClick={() => handleCopyToClipboard(formattedJsonList[0])}
                  className="text-sm px-3 py-1 bg-green-600 rounded-md hover:bg-green-500"
                >
                  Copiar
                </button>
              </div>
            </div>

            {/* Notificación */}
            {wasRepaired && (
              <div className="bg-yellow-600 text-white px-3 py-2 rounded-md mb-4 mt-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 6a1 1 0 012 0v5a1 1 0 01-2 0V6zm1 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                <strong>El JSON fue reparado:</strong> Se han corregido errores de formato.
              </div>
            )}

            {/* JSON formateado */}
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
          </div>
        )}

        <FormattedJsonList
          jsonList={formattedJsonList}
          expandedIndex={expandedIndex}
          onToggleExpand={(index) => setExpandedIndex(expandedIndex === index ? null : index)}
          onCopy={handleCopyToClipboard}
          onGenerateInterface={generateTypescriptInterfaces}
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

        {/* Sección de modelos Python generados con referencia */}
        <div ref={pythonModelsSectionRef}>
          {generatedPythonModels.length > 0 && (
            <GeneratedPythonModels
              models={generatedPythonModels}
              onCopy={handleCopyToClipboard}
            />
          )}
        </div>
      </div>

      <ScrollToTopButton />

      <ErrorDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        title={dialogTitle}
        message={dialogMessage}
        isError={isError}
      />

      <Footer />
    </div>
  );
}
