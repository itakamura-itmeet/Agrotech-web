import { IMAGE_CONFIG } from '../../config/constants';

export class ImageValidator {
  static validate(file, config = IMAGE_CONFIG) {
    const errors = [];

    if (!file) {
      errors.push({ field: 'file', message: 'No file selected' });
      return {
        isValid: false,
        errors
      };
    }

    if (!config.ALLOWED_TYPES.includes(file.type)) {
      errors.push({
        field: 'type',
        message: `Tipo de archivo inválido. Permitidos: ${config.ALLOWED_TYPES.map(t => t.split('/')[1]).join(', ')}`
      });
    }

    if (file.size > config.MAX_SIZE) {
      errors.push({
        field: 'size',
        message: `Archivo demasiado grande. Tamaño máximo: ${config.MAX_SIZE / (1024 * 1024)}MB`
      });
    }

    if (file.size < config.MIN_SIZE) {
      errors.push({
        field: 'size',
        message: `Archivo demasiado pequeño. Tamaño mínimo: ${config.MIN_SIZE / 1024}KB`
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
