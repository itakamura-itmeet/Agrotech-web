"use client";

import { useEffect, useState } from 'react';
import { useImageClassification } from '@/hooks/useImageClassification';

export default function ClassificationDetail({ imageId }) {
  const { getImageDetails } = useImageClassification();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!imageId) return;

    const fetchDetail = async () => {
      try {
        setLoading(true);
        const data = await getImageDetails(imageId);
        setDetail(data);
      } catch (err) {
        console.error("Error fetching details:", err);
        setError("No se pudo cargar el detalle del análisis.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [imageId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="text-center p-8 bg-red-50 text-red-700 rounded-lg">
        <p>{error || "Análisis no encontrado"}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Columna Imagen */}
        <div className="bg-gray-100 relative min-h-[400px]">
          {detail.image_url ? (
            <img
              src={detail.image_url}
              alt="Detalle cultivo"
              className="absolute inset-0 w-full h-full object-contain"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              Sin imagen disponible
            </div>
          )}
        </div>

        {/* Columna Información */}
        <div className="p-8">
          <div className="mb-6 border-b border-gray-100 pb-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">{detail.is_healthy ? '🌿' : '⚠️'}</span>
              <div>
                <h2 className={`text-2xl font-bold ${detail.is_healthy ? 'text-green-800' : 'text-red-800'}`}>
                  {detail.is_healthy ? 'Planta Sana' : 'Enfermedad Detectada'}
                </h2>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-1 ${detail.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                  Estado: {detail.status}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Análisis de Enfermedades</h3>
            <div className="space-y-4">
              {detail.predictions && detail.predictions.map((pred, idx) => (
                <div key={idx} className="block">
                  <div className="flex justify-between items-end mb-1">
                    <span className="font-medium text-gray-700 capitalize text-lg">
                      {pred.disease_name.replace(/_/g, ' ')}
                    </span>
                    <span className="font-mono text-gray-500 font-bold">
                      {(pred.confidence_score * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${pred.disease_name === 'healthy' ? 'bg-green-500' : 'bg-orange-500'}`}
                      style={{ width: `${pred.confidence_score * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 border-t border-gray-100 pt-6">
            <div>
              <p className="mb-1 text-gray-400 text-xs uppercase">Fecha de Análisis</p>
              <p>{new Date(detail.created_at).toLocaleString()}</p>
            </div>
            <div>
              <p className="mb-1 text-gray-400 text-xs uppercase">ID de Imagen</p>
              <p className="font-mono truncate" title={detail.image_id}>{detail.image_id}</p>
            </div>
            {detail.metadata && (
              <div className="col-span-2 mt-2">
                <p className="mb-1 text-gray-400 text-xs uppercase">Metadatos</p>
                <pre className="bg-gray-50 p-2 rounded text-xs overflow-x-auto">
                  {JSON.stringify(detail.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
