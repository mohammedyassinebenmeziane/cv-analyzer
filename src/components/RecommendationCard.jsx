const RecommendationCard = ({ recommendations }) => {
  if (!recommendations) {
    return null;
  }

  // Si recommendations est une chaîne, la diviser en lignes
  const recommendationLines = typeof recommendations === 'string'
    ? recommendations.split('\n').filter(line => line.trim())
    : Array.isArray(recommendations)
    ? recommendations
    : [];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Recommandations HR</h3>
      <div className="space-y-3">
        {recommendationLines.length > 0 ? (
          recommendationLines.map((rec, index) => (
            <div
              key={index}
              className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500"
            >
              <span className="text-blue-600 font-bold">•</span>
              <p className="text-gray-700 flex-1">{rec.trim()}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">Aucune recommandation disponible</p>
        )}
      </div>
    </div>
  );
};

export default RecommendationCard;





