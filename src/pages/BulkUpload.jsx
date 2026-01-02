import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Loading from '../components/Loading';
import api from '../api/axios';

const BulkUpload = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [jobDescription, setJobDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
  const [filterCompatible, setFilterCompatible] = useState(false);
  const navigate = useNavigate();

  const MAX_FILES = 10;
  const COMPATIBILITY_THRESHOLD = 70;

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (selectedFiles.length + files.length > MAX_FILES) {
      setError(`Maximum ${MAX_FILES} fichiers autorisés. Veuillez sélectionner moins de fichiers.`);
      return;
    }

    const allowedExtensions = ['.pdf', '.docx', '.doc'];
    const validFiles = [];

    files.forEach((file) => {
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      
      if (!allowedExtensions.includes(fileExtension)) {
        setError(`${file.name}: Format non supporté. Utilisez PDF ou DOCX.`);
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError(`${file.name}: Fichier trop volumineux (max 10MB).`);
        return;
      }

      validFiles.push(file);
    });

    setSelectedFiles([...selectedFiles, ...validFiles]);
    setError('');
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.multiple = true;
    fileInput.files = e.dataTransfer.files;
    
    const event = {
      target: { files: e.dataTransfer.files }
    };
    
    handleFileChange(event);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResults(null);

    if (selectedFiles.length === 0) {
      setError('Veuillez sélectionner au moins un fichier CV.');
      return;
    }

    if (!jobDescription.trim()) {
      setError('Veuillez entrer une description du poste.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append('cv_files', file);
      });
      formData.append('job_description', jobDescription);

      const response = await api.post('/cv/bulk-upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 300000, // 5 minutes pour plusieurs fichiers
      });

      setResults(response.data);
      setLoading(false);
    } catch (error) {
      setError(
        error.response?.data?.detail ||
          'Erreur lors de l\'analyse des CVs. Veuillez réessayer.'
      );
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getScoreColor = (score) => {
    if (!score) return 'gray';
    if (score >= 70) return 'green';
    if (score >= 50) return 'blue';
    if (score >= 30) return 'orange';
    return 'red';
  };

  const getScoreBadge = (score) => {
    if (score === null || score === undefined) return 'N/A';
    return `${score.toFixed(1)}%`;
  };

  // Filtrer et trier les résultats
  const filteredResults = results ? (() => {
    let filtered = [...results.analyses];
    
    if (filterCompatible) {
      filtered = filtered.filter(a => a.score !== null && a.score >= COMPATIBILITY_THRESHOLD);
    }
    
    // Déjà trié par score décroissant depuis le backend
    return filtered;
  })() : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <Navbar />
        <Loading message="Analyse des CVs en cours..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          {/* En-tête */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              📤 Upload Multiple de CVs
            </h1>
            <p className="text-gray-600 text-lg">
              Analysez plusieurs CVs simultanément avec une description de poste
            </p>
          </div>

          {!results ? (
            /* Formulaire d'upload */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Zone de drag & drop */}
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors bg-white"
              >
                <input
                  type="file"
                  multiple
                  accept=".pdf,.docx,.doc"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <svg
                    className="w-16 h-16 text-blue-500 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="text-lg font-semibold text-gray-700 mb-2">
                    Glissez-déposez vos fichiers CV ici
                  </p>
                  <p className="text-gray-500 mb-4">
                    ou cliquez pour sélectionner (max {MAX_FILES} fichiers)
                  </p>
                  <span className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Sélectionner des fichiers
                  </span>
                </label>
              </div>

              {/* Liste des fichiers sélectionnés */}
              {selectedFiles.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    Fichiers sélectionnés ({selectedFiles.length}/{MAX_FILES})
                  </h3>
                  <div className="space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">📄</span>
                          <span className="text-gray-700 font-medium">
                            {file.name}
                          </span>
                          <span className="text-gray-500 text-sm ml-2">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(index)}
                          className="text-red-600 hover:text-red-800 font-semibold"
                        >
                          ✕ Retirer
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description du poste */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <label
                  htmlFor="job-description"
                  className="block text-xl font-bold text-gray-800 mb-4"
                >
                  Description du poste
                </label>
                <textarea
                  id="job-description"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Entrez la description du poste pour lequel vous souhaitez analyser les CVs..."
                />
              </div>

              {/* Message d'erreur */}
              {error && (
                <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              {/* Bouton de soumission */}
              <button
                type="submit"
                disabled={selectedFiles.length === 0 || !jobDescription.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
              >
                🚀 Analyser tous les CVs ({selectedFiles.length})
              </button>
            </form>
          ) : (
            /* Résultats */
            <div className="space-y-6">
              {/* Statistiques */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-800">{results.total}</div>
                    <div className="text-gray-600">Total analysés</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{results.successful}</div>
                    <div className="text-gray-600">Réussis</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">{results.failed}</div>
                    <div className="text-gray-600">Échoués</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {filteredResults.filter(a => a.score !== null && a.score >= COMPATIBILITY_THRESHOLD).length}
                    </div>
                    <div className="text-gray-600">Compatibles (≥70%)</div>
                  </div>
                </div>
              </div>

              {/* Contrôles */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filterCompatible}
                      onChange={(e) => setFilterCompatible(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-gray-700 font-medium">
                      Afficher seulement ≥ {COMPATIBILITY_THRESHOLD}%
                    </span>
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      viewMode === 'cards'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    🎴 Cartes
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      viewMode === 'table'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    📊 Tableau
                  </button>
                </div>
                <button
                  onClick={() => {
                    setResults(null);
                    setSelectedFiles([]);
                    setJobDescription('');
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg"
                >
                  🔄 Nouvelle analyse
                </button>
              </div>

              {/* Affichage des résultats */}
              {filteredResults.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    Aucun CV compatible
                  </h3>
                  <p className="text-gray-600">
                    Aucun CV ne correspond aux critères de filtrage
                  </p>
                </div>
              ) : viewMode === 'cards' ? (
                /* Vue Cartes */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredResults.map((analysis) => {
                    const scoreColor = getScoreColor(analysis.score);
                    const colorClasses = {
                      green: 'from-green-500 to-green-600',
                      blue: 'from-blue-500 to-blue-600',
                      orange: 'from-orange-500 to-orange-600',
                      red: 'from-red-500 to-red-600',
                      gray: 'from-gray-500 to-gray-600'
                    };

                    return (
                      <div
                        key={analysis.id}
                        className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <span className="text-3xl mr-3">📄</span>
                              <h3 className="text-lg font-bold text-gray-800 truncate">
                                {analysis.cv_filename}
                              </h3>
                            </div>
                            <p className="text-sm text-gray-500">
                              {formatDate(analysis.created_at)}
                            </p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-600">
                              Score
                            </span>
                            <span
                              className={`bg-gradient-to-r ${colorClasses[scoreColor]} text-white px-4 py-2 rounded-full text-lg font-bold shadow-md`}
                            >
                              {getScoreBadge(analysis.score)}
                            </span>
                          </div>
                          {analysis.score !== null && analysis.score !== undefined && (
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                              <div
                                className={`bg-gradient-to-r ${colorClasses[scoreColor]} h-2 rounded-full transition-all duration-500`}
                                style={{ width: `${analysis.score}%` }}
                              ></div>
                            </div>
                          )}
                        </div>

                        {analysis.score !== null && analysis.score !== undefined && (
                          <div className="mb-4">
                            {analysis.score >= 70 ? (
                              <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                                ✅ Excellente correspondance
                              </span>
                            ) : analysis.score >= 50 ? (
                              <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                                ⚡ Bonne correspondance
                              </span>
                            ) : analysis.score >= 30 ? (
                              <span className="inline-block bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-semibold">
                                📊 Correspondance moyenne
                              </span>
                            ) : (
                              <span className="inline-block bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                                🔍 Correspondance faible
                              </span>
                            )}
                          </div>
                        )}

                        <button
                          onClick={() => navigate(`/results/${analysis.id}`)}
                          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                        >
                          Voir les détails →
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Vue Tableau */
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Nom du fichier
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Score
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Statut
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredResults.map((analysis) => {
                        const scoreColor = getScoreColor(analysis.score);
                        const colorClasses = {
                          green: 'from-green-500 to-green-600',
                          blue: 'from-blue-500 to-blue-600',
                          orange: 'from-orange-500 to-orange-600',
                          red: 'from-red-500 to-red-600',
                          gray: 'from-gray-500 to-gray-600'
                        };

                        return (
                          <tr key={analysis.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <span className="text-2xl mr-3">📄</span>
                                <span className="text-sm font-medium text-gray-900">
                                  {analysis.cv_filename}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`bg-gradient-to-r ${colorClasses[scoreColor]} text-white px-3 py-1 rounded-full text-sm font-bold`}
                              >
                                {getScoreBadge(analysis.score)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {analysis.score !== null && analysis.score !== undefined ? (
                                analysis.score >= 70 ? (
                                  <span className="text-sm text-green-600 font-semibold">
                                    ✅ Excellent
                                  </span>
                                ) : analysis.score >= 50 ? (
                                  <span className="text-sm text-blue-600 font-semibold">
                                    ⚡ Bon
                                  </span>
                                ) : analysis.score >= 30 ? (
                                  <span className="text-sm text-orange-600 font-semibold">
                                    📊 Moyen
                                  </span>
                                ) : (
                                  <span className="text-sm text-red-600 font-semibold">
                                    🔍 Faible
                                  </span>
                                )
                              ) : (
                                <span className="text-sm text-gray-500">N/A</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(analysis.created_at)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => navigate(`/results/${analysis.id}`)}
                                className="text-blue-600 hover:text-blue-900 font-semibold"
                              >
                                Voir détails →
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkUpload;

