import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Loading from '../components/Loading';
import api from '../api/axios';

const UploadCV = () => {
  const [cvFile, setCvFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validation du type de fichier
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
      ];
      const allowedExtensions = ['.pdf', '.docx', '.doc'];

      const fileExtension = file.name
        .substring(file.name.lastIndexOf('.'))
        .toLowerCase();

      if (
        !allowedTypes.includes(file.type) &&
        !allowedExtensions.includes(fileExtension)
      ) {
        setError('Format de fichier non supporté. Veuillez uploader un PDF ou DOCX.');
        setCvFile(null);
        return;
      }

      // Validation de la taille (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('Le fichier est trop volumineux. Taille maximale : 10MB');
        setCvFile(null);
        return;
      }

      setCvFile(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!cvFile) {
      setError('Veuillez sélectionner un fichier CV');
      setLoading(false);
      return;
    }

    if (!jobDescription.trim()) {
      setError('Veuillez entrer une description de poste');
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('cv_file', cvFile);
      formData.append('job_description', jobDescription);

      const response = await api.post('/cv/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Supposons que l'API retourne { analysis_id: "..." }
      const analysisId = response.data.analysis_id || response.data.id;
      navigate(`/results/${analysisId}`);
    } catch (error) {
      setError(
        error.response?.data?.detail ||
          'Erreur lors de l\'upload. Veuillez réessayer.'
      );
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Loading message="Analyse du CV en cours..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Uploader un CV pour analyse
          </h1>

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
            {error && (
              <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <div className="mb-6">
              <label
                htmlFor="cv_file"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Fichier CV (PDF ou DOCX)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-400 transition-colors">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="cv_file"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>Télécharger un fichier</span>
                      <input
                        id="cv_file"
                        name="cv_file"
                        type="file"
                        className="sr-only"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">ou glisser-déposer</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PDF, DOCX jusqu'à 10MB
                  </p>
                  {cvFile && (
                    <p className="text-sm text-green-600 mt-2">
                      ✓ {cvFile.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label
                htmlFor="job_description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Description du poste
              </label>
              <textarea
                id="job_description"
                name="job_description"
                rows={8}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md p-3"
                placeholder="Entrez la description du poste pour lequel vous souhaitez analyser le CV..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
              >
                Analyser le CV
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadCV;





