"use client";
import React, { useState } from 'react';
import { jsonrepair } from 'jsonrepair';
import { diffWords } from 'diff';

// Función para limpiar errores JSON comunes con regex
function cleanJsonString(input: string): string {
  let cleanedInput = input;

  // Elimina comas dobles o múltiples
  cleanedInput = cleanedInput.replace(/,+/g, ',');

  // Añade comas faltantes entre elementos clave-valor
  cleanedInput = cleanedInput.replace(/}(\s*{)/g, '},$1'); // Entre objetos
  cleanedInput = cleanedInput.replace(/"(\s*)"(\s*:\s*)/g, '","$2'); // Entre claves y valores

  // Corrige comillas simples a comillas dobles
  cleanedInput = cleanedInput.replace(/'([^']+)'/g, '"$1"');

  // Añade comas entre propiedades faltantes
  cleanedInput = cleanedInput.replace(/"(\s*[^"]+)"\s*:/g, '"$1":').replace(/}\s*"/g, '}, "');

  return cleanedInput;
}

interface JsonInputFormProps {
  onFormat: (jsonInput: string, wasRepaired: boolean, differences: string | null) => void;
}

export function JsonInputForm({ onFormat }: JsonInputFormProps) {
  const [jsonInput, setJsonInput] = useState('');

  const handleFormatClick = () => {
    try {
      // Limpieza previa usando regex antes de intentar reparar el JSON
      const cleanedJson = cleanJsonString(jsonInput);

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
