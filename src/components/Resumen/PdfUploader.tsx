"use client";
import { useState } from 'react';

const PdfUploader = () => {
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) return;

    setLoading(true);
    try {
      // Crear un FormData para enviar el archivo
      const formData = new FormData();
      formData.append('pdf', file);

      // Enviar el PDF al endpoint de tu API
      const response = await fetch('/api/analyze-pdf', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (error) {
      console.error('Error al analizar el PDF:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="w-full max-w-xl p-8 bg-white rounded-lg shadow-md dark:bg-gray-dark">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center justify-center w-full">
            <label
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Click para subir</span> o arrastra y suelta
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">PDF (MAX. 10MB)</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="application/pdf"
                onChange={handleFileChange}
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={!file || loading}
            className="w-full px-4 py-2 text-white bg-primary rounded hover:bg-primary/80 disabled:opacity-50"
          >
            {loading ? 'Analizando...' : 'Analizar PDF'}
          </button>
        </form>

        {analysis && (
          <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded">
            <h3 className="text-lg font-semibold mb-2">Análisis:</h3>
            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
              {analysis}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PdfUploader; 