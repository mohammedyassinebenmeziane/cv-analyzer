import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          {/* En-tête amélioré */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Bienvenue sur CV Analysis
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              Plateforme d'analyse de CV par intelligence artificielle
            </p>
            <p className="text-gray-500">
              Analysez, comparez et sélectionnez les meilleurs candidats pour vos postes
            </p>
          </div>

          {/* Cartes d'action principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Carte Analyser un CV */}
            <Link
              to="/upload"
              className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group"
            >
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-4 rounded-xl group-hover:scale-110 transition-transform">
                  <svg
                    className="w-8 h-8 text-blue-600"
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
                </div>
                <h2 className="text-xl font-bold text-gray-800 ml-4 group-hover:text-blue-600 transition-colors">
                  Analyser un CV
                </h2>
              </div>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Téléchargez un CV et obtenez une analyse détaillée avec score de correspondance,
                compétences manquantes et recommandations personnalisées.
              </p>
              <div className="flex items-center text-blue-600 font-semibold group-hover:text-blue-700">
                Commencer l'analyse
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>

            {/* Carte Bulk Upload */}
            <Link
              to="/bulk-upload"
              className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group"
            >
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-4 rounded-xl group-hover:scale-110 transition-transform">
                  <svg
                    className="w-8 h-8 text-purple-600"
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
                </div>
                <h2 className="text-xl font-bold text-gray-800 ml-4 group-hover:text-purple-600 transition-colors">
                  Bulk Upload
                </h2>
              </div>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Analysez plusieurs CVs simultanément et filtrez automatiquement ceux compatibles avec votre poste (score ≥ 70%).
              </p>
              <div className="flex items-center text-purple-600 font-semibold group-hover:text-purple-700">
                Analyser plusieurs CVs
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>

            {/* Carte Historique */}
            <Link
              to="/history"
              className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group"
            >
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-br from-green-100 to-green-200 p-4 rounded-xl group-hover:scale-110 transition-transform">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-800 ml-4 group-hover:text-green-600 transition-colors">
                  Historique
                </h2>
              </div>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Consultez toutes vos analyses de CV précédentes avec leurs scores et accédez aux détails complets.
              </p>
              <div className="flex items-center text-green-600 font-semibold group-hover:text-green-700">
                Voir l'historique
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          </div>

          {/* Section Fonctionnalités */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                🚀 Fonctionnalités du système
              </h2>
              <p className="text-gray-600">
                Découvrez toutes les capacités de notre plateforme d'analyse de CV
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Fonctionnalité 1 */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 ml-3">
                    Score de correspondance IA
                  </h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Score précis basé sur l'analyse sémantique IA entre le CV et la description du poste. Évaluation complète des compétences, expériences et compatibilité.
                </p>
              </div>

              {/* Fonctionnalité 2 */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-100 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <span className="text-2xl">💼</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 ml-3">
                    Extraction structurée
                  </h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Extraction automatique des compétences techniques, expériences professionnelles, formations, certifications, langues et soft skills.
                </p>
              </div>

              {/* Fonctionnalité 3 */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-100 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <span className="text-2xl">📊</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 ml-3">
                    Bulk Upload
                  </h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Analysez jusqu'à 10 CVs simultanément. Filtrez automatiquement les candidats compatibles (score ≥ 70%) et triez par pertinence.
                </p>
              </div>

              {/* Fonctionnalité 4 */}
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-6 border border-orange-100 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-3">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <span className="text-2xl">🔍</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 ml-3">
                    Identification des compétences
                  </h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Détection automatique des compétences présentes et manquantes. Comparaison intelligente avec les exigences du poste.
                </p>
              </div>

              {/* Fonctionnalité 5 */}
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-6 border border-indigo-100 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-3">
                  <div className="bg-indigo-100 p-2 rounded-lg">
                    <span className="text-2xl">📈</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 ml-3">
                    Analyse d'expérience
                  </h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Identification des expériences pertinentes pour le poste. Évaluation de la pertinence de chaque mission et projet.
                </p>
              </div>

              {/* Fonctionnalité 6 */}
              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg p-6 border border-teal-100 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-3">
                  <div className="bg-teal-100 p-2 rounded-lg">
                    <span className="text-2xl">💡</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 ml-3">
                    Recommandations HR
                  </h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Suggestions personnalisées pour améliorer le CV. Recommandations basées sur les compétences manquantes identifiées.
                </p>
              </div>

              {/* Fonctionnalité 7 */}
              <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-lg p-6 border border-rose-100 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-3">
                  <div className="bg-rose-100 p-2 rounded-lg">
                    <span className="text-2xl">📋</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 ml-3">
                    Profil structuré complet
                  </h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Affichage structuré et moderne du profil candidat avec toutes les informations extraites : identité, résumé, compétences, expériences, formations.
                </p>
              </div>

              {/* Fonctionnalité 8 */}
              <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-lg p-6 border border-violet-100 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-3">
                  <div className="bg-violet-100 p-2 rounded-lg">
                    <span className="text-2xl">🗂️</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 ml-3">
                    Historique complet
                  </h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Accès à l'historique de toutes vos analyses. Vue en cartes ou tableau avec filtres et tri par score.
                </p>
              </div>

              {/* Fonctionnalité 9 */}
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg p-6 border border-amber-100 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-3">
                  <div className="bg-amber-100 p-2 rounded-lg">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 ml-3">
                    Analyse rapide
                  </h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Analyse optimisée avec calculs locaux intelligents. Résultats en quelques secondes avec une précision élevée.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;





