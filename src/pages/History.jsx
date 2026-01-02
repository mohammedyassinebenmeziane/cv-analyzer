import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Loading from '../components/Loading';
import api from '../api/axios';

const History = () => {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalyses = async () => {
      try {
        const response = await api.get('/analysis/');
        setAnalyses(response.data);
        setLoading(false);
      } catch (error) {
        setError(
          error.response?.data?.detail ||
            'Erreur lors du chargement de l\'historique'
        );
        setLoading(false);
      }
    };

    fetchAnalyses();
  }, []);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <Navbar />
        <Loading message="Chargement de l'historique..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <Navbar />
        <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-xl shadow-lg">
            {error}
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
          >
            Retour au dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          {/* En-tête */}
          <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                📊 Historique des analyses
              </h1>
              <p className="text-gray-600 text-lg">
                Consultez toutes vos analyses de CV précédentes
              </p>
            </div>
            <button
              onClick={() => navigate('/upload')}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              ✨ Nouvelle analyse
            </button>
          </div>

          {/* Liste des analyses */}
          {analyses.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Aucune analyse pour le moment
              </h3>
              <p className="text-gray-600 mb-6">
                Commencez par analyser un CV pour voir l'historique ici
              </p>
              <button
                onClick={() => navigate('/upload')}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Analyser un CV
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {analyses.map((analysis) => {
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
                    className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
                    onClick={() => navigate(`/results/${analysis.id}`)}
                  >
                    {/* En-tête de la carte */}
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

                    {/* Score */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-600">
                          Score de correspondance
                        </span>
                        <span
                          className={`bg-gradient-to-r ${colorClasses[scoreColor]} text-white px-4 py-2 rounded-full text-lg font-bold shadow-md`}
                        >
                          {getScoreBadge(analysis.score)}
                        </span>
                      </div>
                      {/* Barre de progression */}
                      {analysis.score !== null && analysis.score !== undefined && (
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`bg-gradient-to-r ${colorClasses[scoreColor]} h-2 rounded-full transition-all duration-500`}
                            style={{ width: `${analysis.score}%` }}
                          ></div>
                        </div>
                      )}
                    </div>

                    {/* Indicateur de performance */}
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

                    {/* Bouton pour voir les détails */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/results/${analysis.id}`);
                      }}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      Voir les détails →
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;

