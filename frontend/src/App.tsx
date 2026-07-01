import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

const API_URL = 'http://localhost:8000';

interface SvgResults {
  potrace: string | null;
  vtracer: string | null;
  production: string | null;
}

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [svgResults, setSvgResults] = useState<SvgResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setSvgResults(null);
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
      setSvgResults(response.data.svgs);
    } catch (err) {
      console.error('Error converting image:', err);
      setError('Failed to convert image. Please make sure the backend is running and all dependencies are installed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setSvgResults(null);
    setError(null);
  };

  const ResultCard = ({ title, svg, loading }: { title: string, svg: string | null | undefined, loading: boolean }) => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-200">{title}</h3>
      <div className="aspect-square bg-zinc-900 rounded-xl overflow-hidden flex items-center justify-center border border-zinc-800 shadow-inner p-4 relative group">
        {loading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-zinc-500">Converting...</p>
          </div>
        ) : svg ? (
          <div 
            className="w-full h-full flex items-center justify-center bg-white rounded-lg" // Keeping white bg for SVG visibility as many SVGs assume light bg
            dangerouslySetInnerHTML={{ __html: svg }} 
          />
        ) : (
          <div className="text-zinc-600 text-center px-4">
            <p>{svg === null ? 'Failed to generate' : 'Waiting...'}</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-500">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black text-white tracking-tighter sm:text-7xl mb-4">
            SUGO<span className="text-blue-500">.</span>SVG
          </h1>
          <p className="mt-4 text-xl text-zinc-400 font-medium">
            High-performance image vectorization engine.
          </p>
        </div>

        <div className="bg-zinc-900/50 backdrop-blur-xl rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden">
          {!preview ? (
            <div
              {...getRootProps()}
              className={`p-20 border-4 border-dashed rounded-3xl transition-all duration-300 cursor-pointer text-center
                ${isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/30'}`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-zinc-800 rounded-2xl flex items-center justify-center mb-6 border border-zinc-700">
                  <svg
                    className="w-10 h-10 text-zinc-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <p className="text-2xl font-bold text-white">
                  {isDragActive ? 'Release to upload' : 'Drop your image'}
                </p>
                <p className="mt-3 text-zinc-500">
                  Supports PNG, JPG, WEBP up to 10MB
                </p>
                <button className="mt-8 px-8 py-3 bg-white text-black rounded-full font-bold hover:bg-blue-500 hover:text-white transition-all transform hover:scale-105">
                  Browse Files
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 lg:p-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-200">Source</h3>
                  <div className="aspect-square bg-zinc-800 rounded-xl overflow-hidden flex items-center justify-center border border-zinc-700 shadow-inner">
                    <img
                      src={preview}
                      alt="Preview"
                      className="max-w-full max-h-full object-contain p-4"
                    />
                  </div>
                </div>

                <ResultCard title="Potrace" svg={svgResults?.potrace} loading={isLoading} />
                <ResultCard title="VTracer" svg={svgResults?.vtracer} loading={isLoading} />
                <ResultCard title="Production" svg={svgResults?.production} loading={isLoading} />
              </div>

              {error && (
                <div className="mb-8 p-4 bg-red-500/10 text-red-400 rounded-2xl border border-red-500/20 flex items-center gap-3">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              <div className="flex justify-between items-center pt-8 border-t border-zinc-800">
                <button
                  onClick={handleReset}
                  className="px-6 py-2 text-zinc-500 font-bold hover:text-white transition-colors"
                >
                  Clear All
                </button>
                <div className="flex gap-4">
                  <button
                    onClick={handleConvert}
                    disabled={isLoading || !!svgResults}
                    className={`px-10 py-4 rounded-full font-black text-lg transition-all shadow-xl
                      ${isLoading || !!svgResults 
                        ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' 
                        : 'bg-blue-600 text-white hover:bg-blue-500 hover:-translate-y-1 active:translate-y-0 shadow-blue-900/20'}`}
                  >
                    {isLoading ? 'Processing...' : svgResults ? 'Complete' : 'Start Vectorization'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <footer className="mt-16 text-center text-zinc-600 text-sm font-medium tracking-widest uppercase">
          Powered by Sugo Engine v1.0
        </footer>
      </div>
    </div>
  );
}

export default App;
