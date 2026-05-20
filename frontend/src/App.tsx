      import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

const API_URL = 'http://localhost:8000';

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [svgResult, setSvgResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setSvgResult(null);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    multiple: false
  });

  const handleConvert = async () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_URL}/api/convert`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setSvgResult(response.data.svg);
    } catch (err) {
      console.error('Error converting image:', err);
      setError('Failed to convert image. Please make sure the backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setSvgResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
            Sugo <span className="text-blue-600">SVG</span>
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            A simple tool to convert your images to SVG vectors.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {!preview ? (
            <div
              {...getRootProps()}
              className={`p-12 border-4 border-dashed rounded-2xl transition-all cursor-pointer text-center
                ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-400'}`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center">
                <svg
                  className="w-16 h-16 text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-xl font-medium text-gray-700">
                  {isDragActive ? 'Drop your image here' : 'Drag & drop an image'}
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  PNG, JPG, JPEG or WEBP up to 10MB
                </p>
                <button className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  Select File
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Original Image</h3>
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border border-gray-200">
                    <img
                      src={preview}
                      alt="Preview"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">SVG Result</h3>
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border border-gray-200">
                    {isLoading ? (
                      <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-gray-500">Converting...</p>
                      </div>
                    ) : svgResult ? (
                      <div 
                        className="max-w-full max-h-full"
                        dangerouslySetInnerHTML={{ __html: svgResult }} 
                      />
                    ) : (
                      <div className="text-gray-400 text-center px-4">
                        <p>Click "Convert" to see the result</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100">
                  {error}
                </div>
              )}

              <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                <button
                  onClick={handleReset}
                  className="px-6 py-2 text-gray-600 font-medium hover:text-gray-900 transition-colors"
                >
                  Start Over
                </button>
                <button
                  onClick={handleConvert}
                  disabled={isLoading || !!svgResult}
                  className={`px-8 py-3 rounded-xl font-bold text-white transition-all shadow-lg
                    ${isLoading || !!svgResult 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0 shadow-blue-200'}`}
                >
                  {isLoading ? 'Converting...' : svgResult ? 'Converted!' : 'Convert to SVG'}
                </button>
              </div>
            </div>
          )}
        </div>
        
        <footer className="mt-12 text-center text-gray-400 text-sm">
          Built with FastAPI & React
        </footer>
      </div>
    </div>
  );
}

export default App;
