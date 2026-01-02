const SkillsList = ({ title, skills, type = 'default' }) => {
  if (!skills || skills.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
        <p className="text-gray-500">Aucune compétence à afficher</p>
      </div>
    );
  }

  const bgColor = type === 'missing' ? 'bg-red-50' : 'bg-green-50';
  const borderColor = type === 'missing' ? 'border-red-300' : 'border-green-300';
  const textColor = type === 'missing' ? 'text-red-800' : 'text-green-800';

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, index) => (
          <span
            key={index}
            className={`px-3 py-1 rounded-full text-sm font-medium ${bgColor} ${borderColor} border ${textColor}`}
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
};

export default SkillsList;





