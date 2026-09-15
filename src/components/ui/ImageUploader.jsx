import { IMAGE_CONFIG } from '../../config/constants';
import { ImageValidator } from '../../utils/validation/imageValidation';

const ImageUploader = ({ file, preview, onFileChange, onClear, validationConfig = IMAGE_CONFIG, error }) => {
  const handleInternalFileChange = e => {
    const selectedFile = e.target.files[0];
    const validationResult = ImageValidator.validate(selectedFile, validationConfig);
    if (validationResult.isValid) {
      const reader = new FileReader();
      reader.onload = () => onFileChange(selectedFile, reader.result);
      reader.readAsDataURL(selectedFile);
    } else {
      onFileChange(null, null, validationResult.errors[0].message);
    }
  };

  return (
    <div className="mb-6">
      <label htmlFor="imageUpload" className="block mb-2 text-lg font-medium">Subir imagen</label>
      <div className="space-y-4">
        <div className="flex items-center justify-center w-full">
          <label htmlFor="imageUpload" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-700 border-dashed rounded-lg cursor-pointer bg-gray-900 hover:bg-gray-800 transition-colors">
            {preview ? (
              <div className="relative w-full h-full p-2">
                <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                <button type="button" onClick={e => { e.stopPropagation(); e.preventDefault(); onClear(); }} className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white rounded-full w-8 h-8 flex items-center justify-center">×</button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="mb-2 text-sm text-gray-400"><span className="font-semibold">Click para subir</span> o arrastra y suelta</p>
                <p className="text-xs text-gray-400">JPEG, PNG, WebP (MAX. {validationConfig.MAX_SIZE / (1024 * 1024)}MB)</p>
              </div>
            )}
          </label>
          <input id="imageUpload" type="file" className="hidden" accept={validationConfig.ALLOWED_TYPES.join(',')} onChange={handleInternalFileChange} />
        </div>
        {error && <div className="p-3 bg-red-900 bg-opacity-50 border border-red-700 rounded text-white">{error}</div>}
      </div>
    </div>
  );
};

export default ImageUploader;
