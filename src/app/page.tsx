"use client";
import { useState, useEffect, useRef } from 'react';
import { JsonInputForm } from '@/components/JsonInputForm';
import { FormattedJsonList } from '@/components/FormattedJsonList';
import { ErrorDialog } from '@/components/ErrorDialog';
import { GeneratedInterfaces } from '@/components/GeneratedInterfaces';
import { GeneratedPythonModels } from '@/components/GeneratedPythonModels';
import ScrollToTopButton from '@/components/ScrollToTopButton';
import Footer from '@/components/Footer';
import { quicktype, InputData, jsonInputForTargetLanguage } from 'quicktype-core';
import jsonToTS from 'json-to-ts';
import Python from '@/components/icons/python';
import TypeScript from '@/components/icons/ts';
import Editor from '@monaco-editor/react';

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
  const [repairDetails, setRepairDetails] = useState<string | null>(null);
  const formattedListRef = useRef<HTMLDivElement | null>(null);
  const interfacesSectionRef = useRef<HTMLDivElement | null>(null);
  const pythonModelsSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const lastFormattedJson = localStorage.getItem('lastFormattedJson');
    if (lastFormattedJson) {
      setFormattedJsonList([lastFormattedJson]);
    }
  }, []);

  useEffect(() => {
    if (formattedJsonList.length > 0) {
      localStorage.setItem('lastFormattedJson', formattedJsonList[0]);
    }
  }, [formattedJsonList]);

  const handleFormatJson = (jsonInput: string, wasRepaired: boolean, differences: string | null) => {
    try {
      const parsedJson = JSON.parse(jsonInput);
      const formattedJson = JSON.stringify(parsedJson, null, 2);
      setFormattedJsonList((prevList) => [formattedJson, ...prevList.slice(0, 9)]);
      setWasRepaired(wasRepaired);
      setRepairDetails(differences);
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

  const handleClearHistory = () => {
    setFormattedJsonList([]);
    setGeneratedInterfaces([]);
    setGeneratedPythonModels([]);
    localStorage.removeItem('lastFormattedJson');
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setDialogTitle('Copiado al Portapapeles');
    setDialogMessage('El contenido se ha copiado correctamente.');
    setIsError(false);
    setShowDialog(true);
  };

  const generateTypescriptInterfaces = (jsonString?: string) => {
    const jsonToParse = jsonString || formattedJsonList[0];
    if (!jsonToParse) return;

    try {
      const parsedJson = JSON.parse(jsonToParse);
      const interfacesArray = jsonToTS(parsedJson);
      const interfaces = interfacesArray.map((typeInterface) => typeInterface).join('\n\n');
      setGeneratedInterfaces([interfaces]);

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
      <div className="max-w-3xl mx-auto space-y-8" style={{ width: '90%' }}>
        <h1 className="text-4xl font-bold text-white text-center mb-4">
          JSON Formatter
        </h1>

        <div className="flex justify-end my-4">
          <button
            onClick={handleClearHistory}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Borrar Historial
          </button>
        </div>

        <JsonInputForm onFormat={handleFormatJson} />

        {formattedJsonList.length > 0 && (
          <div className="p-5 bg-gray-800 text-white rounded-lg shadow-md" style={{ width: '100%' }}>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-blue-300">Último JSON Formateado</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => generateTypescriptInterfaces()}
                  className="text-sm px-3 py-1 border-blue-600 border-2 rounded-lg hover:bg-blue-500/20"
                >
                  <TypeScript className="h-5 w-5" />
                </button>
                <button
                  onClick={() => generatePythonModels()}
                  className="text-sm px-3 py-1 border-yellow-600 border-2 rounded-lg hover:bg-yellow-500/20"
                >
                  <Python className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleCopyToClipboard(formattedJsonList[0])}
                  className="text-sm px-3 py-1 bg-green-600 rounded-lg hover:bg-green-500"
                >
                  Copiar
                </button>
              </div>
            </div>

            {wasRepaired && (
              <div className="bg-yellow-600 text-white px-4 py-2 rounded-lg my-4 text-sm">
                <strong>El JSON fue reparado:</strong> Se han corregido errores de formato.
              </div>
            )}

            {wasRepaired && repairDetails && (
              <div className="bg-gray-700 text-white px-4 py-2 rounded-lg mb-4 overflow-auto text-sm">
                <div dangerouslySetInnerHTML={{ __html: repairDetails }} />
              </div>
            )}

            <div className="bg-gray-900 p-3 rounded-lg overflow-x-auto mt-4">
              <Editor
                height="1000px"
                width="100%"
                defaultLanguage="json"
                value={formattedJsonList[0]}
                onChange={(newValue) => {
                  if (newValue !== undefined) {
                    setFormattedJsonList([newValue]);
                  }
                }}
                options={{
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  fontSize: 14,
                }}
                theme="vs-dark"
              />
            </div>
          </div>
        )}

        <FormattedJsonList
          jsonList={formattedJsonList}
          expandedIndex={expandedIndex}
          onToggleExpand={(index) => setExpandedIndex(expandedIndex === index ? null : index)}
          onCopy={handleCopyToClipboard}
          onGenerateInterface={generateTypescriptInterfaces}
          onGeneratePythonModel={generatePythonModels}
        />

        <div ref={interfacesSectionRef} className="mt-8">
          {generatedInterfaces.length > 0 && (
            <div className="relative p-4 bg-gray-800 text-white rounded-lg shadow-md">
              <GeneratedInterfaces interfaces={generatedInterfaces} />
              <button
                onClick={() => handleCopyToClipboard(generatedInterfaces.join('\n\n'))}
                className="absolute top-4 right-4 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500"
              >
                Copiar Interfaces
              </button>
            </div>
          )}
        </div>

        <div ref={pythonModelsSectionRef} className="mt-8">
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
