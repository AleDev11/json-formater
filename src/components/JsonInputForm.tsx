"use client";
import React, { useState } from 'react';
import { jsonrepair } from 'jsonrepair'; // Importa jsonrepair

interface JsonInputFormProps {
  onFormat: (jsonInput: string, wasRepaired: boolean) => void;
}

export function JsonInputForm({ onFormat }: JsonInputFormProps) {
  const [jsonInput, setJsonInput] = useState('');

  const handleFormatClick = () => {
    try {
      // Intenta reparar el JSON malformado antes de formatearlo
      const repairedJson = jsonrepair(jsonInput);
      const wasRepaired = repairedJson !== jsonInput; // Verifica si se hizo alguna reparación
      onFormat(repairedJson, wasRepaired); // Envía el JSON reparado y el estado de reparación
    } catch (error) {
      console.error('Error al intentar reparar el JSON:', error);
      onFormat(jsonInput, false); // En caso de fallo, intenta formatear el original sin reparación
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
