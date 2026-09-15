"use client";

import { useEffect, useState } from 'react';
import { useImageClassification } from '@/hooks/useImageClassification';
import Link from 'next/link';

export default function HistoryList() {
  const { listImages } = useImageClassification();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        const data = await listImages(50); // Traer últimas 50
        setImages(data.images || []);
      } catch (err) {
        console.error("Error fetching history:", err);
        setError("No se pudo cargar el historial.");
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []); // Run once on mount

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-red-50 text-red-700 rounded-lg">
        <p>{error}</p>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="text-center p-12 bg-gray-50 rounded-lg border border-gray-100">
        <p className="text-gray-500">No hay análisis registrados aún.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {images.map((img) => (
        <Link href={`/history/${img.image_id}`} key={img.image_id} className="block group">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200 h-full">
            <div className="relative h-48 bg-gray-100 group-hover:opacity-90 transition-opacity">
              {img.image_url ? (
                <img
                  src={img.image_url}
                  alt="Cultivo analizado"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/400x300?text=Imagen+No+Disponible';
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  Sin imagen
                </div>
              )}

              <div className="absolute top-2 right-2">
                {img.is_healthy ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 shadow-sm">
                    🌿 Sano
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 shadow-sm">
                    ⚠️ Enfermo
                  </span>
                )}
              </div>
            </div>

            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-xs text-gray-400 mb-1">
                    {new Date(img.created_at).toLocaleDateString()} {new Date(img.created_at).toLocaleTimeString()}
                  </p>
                  {/* Mostrar la predicción principal si existe */}
                  {img.predictions && img.predictions.length > 0 && !img.is_healthy && (
                    <p className="text-sm font-bold text-gray-800 capitalize group-hover:text-blue-600 transition-colors">
                      {img.predictions[0].disease_name.replace(/_/g, ' ')}
                    </p>
                  )}
                  {img.predictions && img.predictions.length > 0 && img.is_healthy && (
                    <p className="text-sm font-bold text-gray-600 group-hover:text-green-600 transition-colors">
                      Sin anomalías
                    </p>
                  )}
                </div>

                {img.predictions && img.predictions.length > 0 && (
                  <div className="text-xs font-mono bg-gray-50 px-2 py-1 rounded text-gray-500">
                    {(img.predictions[0].confidence_score * 100).toFixed(0)}%
                  </div>
                )}
              </div>

              <div className="mt-3 pt-3 border-t border-gray-50 text-xs text-gray-400 flex justify-between items-center">
                <span>ID: {img.image_id.substring(0, 8)}</span>
                <span className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity font-medium">Ver detalle →</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
