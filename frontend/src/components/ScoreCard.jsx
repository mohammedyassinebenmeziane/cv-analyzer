const ScoreCard = ({ score }) => {
  // Déterminer la couleur selon le score
  const getScoreColor = (score) => {
    if (score < 50) return 'bg-red-500';
    if (score < 70) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getScoreEmoji = (score) => {
    if (score < 50) return '🔴';
    if (score < 70) return '🟠';
    return '🟢';
  };

  const colorClass = getScoreColor(score);
  const emoji = getScoreEmoji(score);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Score de correspondance</h2>
        <span className="text-3xl">{emoji}</span>
      </div>
      <div className="mb-2">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">{score}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-6">
          <div
            className={`${colorClass} h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-2`}
            style={{ width: `${score}%` }}
          >
            {score >= 10 && (
              <span className="text-white text-xs font-bold">{score}%</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreCard;





