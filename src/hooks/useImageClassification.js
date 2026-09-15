import { useState } from 'react';

const API_BASE = 'https://y6hrywps1b.execute-api.us-east-1.amazonaws.com';

export function useImageClassification() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Upload image y obtener clasificación
   * @param {File} imageFile
   * @param {Object} metadata
   * @returns {Promise<Object>} ClassificationResult
   */
  const classifyImage = async (imageFile, metadata = {}) => {
    setLoading(true);
    setError(null);

    try {
      // 1. Solicitar presigned URL
      const uploadResponse = await fetch(`${API_BASE}/images/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metadata }),
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { image_id, upload_url } = await uploadResponse.json();

      // 2. Upload imagen a S3
      const uploadResult = await fetch(upload_url, {
        method: 'PUT',
        headers: { 'Content-Type': 'image/jpeg' }, // Asumiendo JPEG por simplicidad de la doc, idealmente usar el tipo del archivo
        body: imageFile,
      });

      if (!uploadResult.ok) {
        throw new Error('Failed to upload image');
      }

      // 3. Polling: esperar a que termine la clasificación
      return await pollForResult(image_id);
    } catch (err) {
      const message = err.message || 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Poll hasta que la imagen esté procesada
   */
  const pollForResult = async (imageId, maxAttempts = 30, interval = 2000) => {
    for (let i = 0; i < maxAttempts; i++) {
      const response = await fetch(`${API_BASE}/images/${imageId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch classification result');
      }

      const result = await response.json();

      if (result.status === 'COMPLETED' || result.status === 'FAILED') {
        return result;
      }

      // Esperar antes del siguiente intento
      await new Promise(resolve => setTimeout(resolve, interval));
    }

    throw new Error('Timeout waiting for classification');
  };

  /**
   * Listar imágenes procesadas
   */
  const listImages = async (limit = 20, nextToken = null) => {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (nextToken) params.append('next_token', nextToken);

    const response = await fetch(`${API_BASE}/images?${params}`);

    if (!response.ok) {
      throw new Error('Failed to list images');
    }

    return await response.json();
  };

  /**
   * Obtener detalle de una imagen por ID
   */
  const getImageDetails = async (imageId) => {
    const response = await fetch(`${API_BASE}/images/${imageId}`);

    if (!response.ok) {
      throw new Error('Failed to get image details');
    }

    return await response.json();
  };

  return {
    classifyImage,
    listImages,
    getImageDetails,
    loading,
    error,
  };
}
