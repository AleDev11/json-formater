"use client";
import React, { useState } from 'react';
import { jsonrepair } from 'jsonrepair';
import { diffWords } from 'diff';

// Función para limpiar errores JSON comunes con regex
function cleanAndFormatJSON(input: string) {
  let cleanedInput = input;

  // Cambia comillas simples a comillas dobles en claves y valores
  cleanedInput = cleanedInput.replace(/'([^']+)'/g, '"$1"');

  // Añade comillas faltantes a claves sin comillas dobles
  cleanedInput = cleanedInput.replace(/([{,]\s*)(\w+)\s*:/g, '$1"$2":');

  // Añade comas entre objetos si están pegados
  cleanedInput = cleanedInput.replace(/}(\s*{)/g, '},$1');

  // Elimina comas dobles o múltiples
  cleanedInput = cleanedInput.replace(/,+/g, ',');

  // Añade comas faltantes entre elementos clave-valor
  cleanedInput = cleanedInput.replace(/}(\s*{)/g, '},$1'); // Entre objetos
  cleanedInput = cleanedInput.replace(/"(\s*)"(\s*:\s*)/g, '","$2'); // Entre claves y valores

  // Elimina comas al final de objetos y arrays
  cleanedInput = cleanedInput.replace(/,(\s*[}\]])/g, '$1');

  // Encapsula el contenido en un array si hay múltiples objetos
  if (!cleanedInput.startsWith('[') && cleanedInput.includes('}{')) {
    cleanedInput = `[${cleanedInput}]`;
  }

  try {
    // Intentamos hacer el parseo a JSON para ver si está bien formateado
    return JSON.parse(cleanedInput);
  } catch (error) {
    console.error("No se pudo procesar el JSON:", error);
    return null;
  }
}

interface JsonInputFormProps {
  onFormat: (jsonInput: string, wasRepaired: boolean, differences: string | null) => void;
}

export function JsonInputForm({ onFormat }: JsonInputFormProps) {
  const [jsonInput, setJsonInput] = useState('');

  const handleFormatClick = () => {
    try {
      // Limpieza previa usando regex antes de intentar reparar el JSON
      const cleanedJson = cleanAndFormatJSON(jsonInput);

      // Intenta reparar el JSON malformado después de la limpieza
      const repairedJson = jsonrepair(cleanedJson);
      const wasRepaired = repairedJson !== jsonInput;

      // Si se reparó, compara el JSON original con el reparado
      let differences: string | null = null;
      if (wasRepaired) {
        const diff = diffWords(jsonInput, repairedJson);
        differences = diff
          .map(part => {
            const color = part.added ? 'green' : part.removed ? 'red' : 'gray';
            return `<span style="color:${color};">${part.value}</span>`;
          })
          .join('');
      }

      onFormat(repairedJson, wasRepaired, differences);
    } catch (error) {
      console.error('Error al intentar reparar el JSON:', error);
      onFormat(jsonInput, false, null);
    }
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
