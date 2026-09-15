"use client";

import { useState } from 'react';
import { SensorDashboard } from './SensorDashboard';
import ImageUploader from '../ui/ImageUploader';
import { IMAGE_CONFIG } from '../../config/constants';
import { useImageClassification } from '@/hooks/useImageClassification';

export default function AgrotechContainer({ deviceId = "agrotech-iot-dev-sensor-001" }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const [classificationResult, setClassificationResult] = useState(null);

  const { classifyImage, loading, error: apiError } = useImageClassification();

  const handleFileChange = (selectedFile, previewUrl, errorMessage) => {
    if (errorMessage) {
      setError(errorMessage);
      setFile(null);
      setPreview(null);
      setClassificationResult(null);
      return;
    }
    setFile(selectedFile);
    setPreview(previewUrl);
    setError(null);
    setClassificationResult(null);
  };

  const handleClearFile = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    setClassificationResult(null);
  };

  const handleAnalyze = async () => {
    if (!file) return;

    try {
      const result = await classifyImage(file, {
        crop_type: 'general', // Default metadata
        timestamp: new Date().toISOString()
      });
      setClassificationResult(result);
    } catch (err) {
      console.error("Analysis failed:", err);
    }
  };

  const displayError = error || apiError;

  return (
    <div className="space-y-8">
      {/* Sección del Dashboard de Sensor - Ya existente */}
      <SensorDashboard deviceId={deviceId} />

      {/* Nueva Sección de Subida de Fotos - Estilo Visagism pero simplificado */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-fade-in">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Diagnóstico de Enfermedades de Cultivos</h2>
            <p className="text-sm text-gray-500 mb-6">
              Sube una foto de la planta para detectar posibles enfermedades mediante IA.
            </p>
          </div>
          <a href="/history" className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1">
            Ver Historial →
          </a>
        </div>

        <ImageUploader
          file={file}
          preview={preview}
          onFileChange={handleFileChange}
          onClear={handleClearFile}
          validationConfig={IMAGE_CONFIG}
          error={displayError}
        />

        {file && !loading && !classificationResult && (
          <div className="flex justify-end">
            <button
              onClick={handleAnalyze}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Analizar Planta
            </button>
          </div>
        )}

        {loading && (
          <div className="mt-4 p-8 border border-blue-100 bg-blue-50 text-blue-700 rounded-lg flex flex-col items-center justify-center">
            <svg className="animate-spin h-8 w-8 text-blue-600 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="font-medium text-lg">Procesando imagen...</span>
            <span className="text-sm opacity-80 mt-1">Subiendo a S3 y clasificando enfermedades</span>
          </div>
        )}

        {classificationResult && (
          <div className="mt-6 border border-gray-200 rounded-xl overflow-hidden">
            <div className={`p-4 ${classificationResult.is_healthy ? 'bg-green-50 border-b border-green-100' : 'bg-red-50 border-b border-red-100'}`}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{classificationResult.is_healthy ? '🌿' : '⚠️'}</span>
                <div>
                  <h3 className={`text-lg font-bold ${classificationResult.is_healthy ? 'text-green-800' : 'text-red-800'}`}>
                    {classificationResult.is_healthy ? 'Planta Sana' : 'Enfermedad Detectada'}
                  </h3>
                  <p className={`text-sm ${classificationResult.is_healthy ? 'text-green-600' : 'text-red-600'}`}>
                    {classificationResult.is_healthy ? 'No se detectaron signos de enfermedad.' : 'Se recomienda atención inmediata.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 bg-white">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Detalle del Análisis</h4>
              <div className="space-y-3">
                {classificationResult.predictions && classificationResult.predictions.map((pred, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-gray-700 font-medium capitalize">{pred.disease_name.replace(/_/g, ' ')}</span>
                    <div className="flex items-center gap-3 w-1/2 justify-end">
                      <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${pred.disease_name === 'healthy' ? 'bg-green-500' : 'bg-orange-500'}`}
                          style={{ width: `${pred.confidence_score * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-mono text-gray-500 w-12 text-right">
                        {(pred.confidence_score * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400 flex justify-between">
                <span>ID: {classificationResult.image_id.substring(0, 8)}...</span>
                <span>{new Date(classificationResult.created_at || Date.now()).toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {displayError && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 flex items-start gap-3">
            <span className="text-xl">❌</span>
            <div>
              <p className="font-bold">Error en el análisis</p>
              <p className="text-sm">{displayError}</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
