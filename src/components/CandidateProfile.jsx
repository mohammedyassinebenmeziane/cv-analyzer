import React from 'react';

const CandidateProfile = ({ profile }) => {
  if (!profile) {
    return null;
  }

  const Section = ({ title, children, icon = null, gradient = false }) => (
    <div className={`${gradient ? 'bg-gradient-to-br from-blue-50 to-indigo-50' : 'bg-white'} rounded-xl shadow-lg border border-gray-100 p-6 mb-6 transition-all duration-300 hover:shadow-xl`}>
      <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center border-b border-gray-200 pb-3">
        {icon && <span className="mr-3 text-3xl">{icon}</span>}
        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          {title}
        </span>
      </h3>
      {children}
    </div>
  );

  const Badge = ({ children, color = "blue" }) => {
    const colors = {
      blue: "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md hover:shadow-lg",
      green: "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md hover:shadow-lg",
      purple: "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md hover:shadow-lg",
      orange: "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md hover:shadow-lg",
      gray: "bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-md hover:shadow-lg",
      indigo: "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md hover:shadow-lg"
    };
    return (
      <span className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 transform hover:scale-105 ${colors[color]}`}>
        {children}
      </span>
    );
  };

  const Card = ({ children, className = "" }) => (
    <div className={`bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`}>
      {children}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* SCORE DE CORRESPONDANCE - Carte moderne en premier */}
      {profile.score_correspondance !== null && profile.score_correspondance !== undefined && (
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-2xl p-8 text-white mb-8">
          {/* Effet de brillance */}
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-40 h-40 bg-purple-300 opacity-10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
              <div className="mb-4 md:mb-0">
                <h3 className="text-3xl font-bold mb-2 flex items-center">
                  <span className="mr-3">🎯</span>
                  Score de correspondance global
                </h3>
                <p className="text-blue-100 text-lg">Évaluation basée sur le profil complet du candidat</p>
              </div>
              <div className="text-center md:text-right">
                <div className="text-6xl md:text-7xl font-bold mb-1 drop-shadow-lg">
                  {profile.score_correspondance}
                </div>
                <div className="text-blue-100 text-xl font-medium">/ 100</div>
              </div>
            </div>
            
            {/* Barre de progression moderne */}
            <div className="mt-6 bg-white bg-opacity-25 rounded-full h-6 shadow-inner overflow-hidden">
              <div 
                className="bg-gradient-to-r from-white to-blue-100 rounded-full h-6 transition-all duration-1000 ease-out shadow-lg flex items-center justify-end pr-2"
                style={{ width: `${profile.score_correspondance}%` }}
              >
                {profile.score_correspondance >= 10 && (
                  <span className="text-blue-900 text-xs font-bold">
                    {profile.score_correspondance}%
                  </span>
                )}
              </div>
            </div>
            
            {/* Indicateur de performance */}
            <div className="mt-4 flex items-center">
              {profile.score_correspondance >= 70 ? (
                <span className="bg-white bg-opacity-30 px-4 py-2 rounded-full text-sm font-semibold">
                  ✅ Excellente correspondance
                </span>
              ) : profile.score_correspondance >= 50 ? (
                <span className="bg-white bg-opacity-30 px-4 py-2 rounded-full text-sm font-semibold">
                  ⚡ Bonne correspondance
                </span>
              ) : profile.score_correspondance >= 30 ? (
                <span className="bg-white bg-opacity-30 px-4 py-2 rounded-full text-sm font-semibold">
                  📊 Correspondance moyenne
                </span>
              ) : (
                <span className="bg-white bg-opacity-30 px-4 py-2 rounded-full text-sm font-semibold">
                  🔍 Correspondance faible
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 1. IDENTITÉ DU CANDIDAT */}
      {profile.identite && (
        <Section title="Identité du candidat" icon="👤">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.identite.nom && (
              <Card>
                <div className="text-gray-600 font-medium mb-1">Nom</div>
                <div className="text-gray-900 text-lg font-semibold">{profile.identite.nom}</div>
              </Card>
            )}
            {profile.identite.prenom && (
              <Card>
                <div className="text-gray-600 font-medium mb-1">Prénom</div>
                <div className="text-gray-900 text-lg font-semibold">{profile.identite.prenom}</div>
              </Card>
            )}
            {profile.identite.email && (
              <Card>
                <div className="text-gray-600 font-medium mb-1">Email</div>
                <a href={`mailto:${profile.identite.email}`} className="text-blue-600 hover:text-blue-800 hover:underline font-semibold">
                  {profile.identite.email}
                </a>
              </Card>
            )}
            {profile.identite.telephone && (
              <Card>
                <div className="text-gray-600 font-medium mb-1">Téléphone</div>
                <div className="text-gray-900 text-lg font-semibold">{profile.identite.telephone}</div>
              </Card>
            )}
            {profile.identite.ville && (
              <Card>
                <div className="text-gray-600 font-medium mb-1">Localisation</div>
                <div className="text-gray-900 text-lg font-semibold">
                  {profile.identite.ville}
                  {profile.identite.pays && <span>, {profile.identite.pays}</span>}
                </div>
              </Card>
            )}
            {profile.identite.titre_profil && (
              <Card className="md:col-span-2">
                <div className="text-gray-600 font-medium mb-1">Titre professionnel</div>
                <div className="text-gray-900 text-xl font-bold">{profile.identite.titre_profil}</div>
              </Card>
            )}
            {profile.identite.linkedin && (
              <Card>
                <div className="text-gray-600 font-medium mb-1">LinkedIn</div>
                <a href={`https://${profile.identite.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline font-semibold">
                  {profile.identite.linkedin}
                </a>
              </Card>
            )}
            {profile.identite.github && (
              <Card>
                <div className="text-gray-600 font-medium mb-1">GitHub</div>
                <a href={`https://${profile.identite.github}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline font-semibold">
                  {profile.identite.github}
                </a>
              </Card>
            )}
          </div>
        </Section>
      )}

      {/* 2. RÉSUMÉ PROFESSIONNEL */}
      {profile.resume_professionnel && (
        <Section title="Résumé professionnel" icon="📋" gradient>
          {profile.resume_professionnel.resume && (
            <div className="bg-white rounded-lg p-5 mb-4 border-l-4 border-blue-500 shadow-sm">
              <p className="text-gray-700 leading-relaxed text-lg">{profile.resume_professionnel.resume}</p>
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            {profile.resume_professionnel.domaine_principal && (
              <Badge color="blue">Domaine: {profile.resume_professionnel.domaine_principal}</Badge>
            )}
            {profile.resume_professionnel.niveau && (
              <Badge color="green">Niveau: {profile.resume_professionnel.niveau}</Badge>
            )}
            {profile.resume_professionnel.objectif_professionnel && (
              <Badge color="purple">Objectif: {profile.resume_professionnel.objectif_professionnel}</Badge>
            )}
          </div>
        </Section>
      )}

      {/* 3. COMPÉTENCES TECHNIQUES */}
      {profile.competences_techniques && (
        <Section title="Compétences techniques" icon="💻">
          <div className="space-y-6">
            {Object.entries(profile.competences_techniques).map(([category, skills]) => {
              if (!Array.isArray(skills) || skills.length === 0) return null;
              
              const categoryColors = {
                langages: "blue",
                frameworks: "green",
                outils: "purple",
                cloud: "orange",
                ia_data: "indigo",
                securite: "orange",
                techniques: "blue",
                methodologies: "green"
              };
              
              const categoryLabels = {
                langages: "Langages",
                frameworks: "Frameworks",
                outils: "Outils",
                cloud: "Cloud",
                ia_data: "IA / Data",
                securite: "Sécurité",
                techniques: "Techniques",
                methodologies: "Méthodologies"
              };
              
              return (
                <div key={category}>
                  <h4 className="font-semibold text-gray-700 mb-3 text-lg">{categoryLabels[category] || category}:</h4>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, idx) => (
                      <Badge key={idx} color={categoryColors[category] || "gray"}>{skill}</Badge>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* 4. EXPÉRIENCES PROFESSIONNELLES */}
      {profile.experiences_professionnelles && profile.experiences_professionnelles.length > 0 && (
        <Section title="Expériences professionnelles" icon="💼">
          <div className="space-y-6">
            {profile.experiences_professionnelles.map((exp, idx) => (
              <Card key={idx} className="border-l-4 border-blue-500">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                  <h4 className="font-bold text-gray-900 text-xl">{exp.intitule_poste || "Poste non spécifié"}</h4>
                  {exp.periode && (
                    <span className="text-gray-600 text-sm font-medium bg-gray-100 px-3 py-1 rounded-full">{exp.periode}</span>
                  )}
                </div>
                {exp.entreprise && (
                  <p className="text-gray-700 font-semibold mb-3 text-lg">{exp.entreprise}</p>
                )}
                {exp.missions && exp.missions.length > 0 && (
                  <ul className="list-none space-y-2 mb-3">
                    {exp.missions.map((mission, mIdx) => (
                      <li key={mIdx} className="flex items-start">
                        <span className="text-blue-500 mr-2 mt-1">▸</span>
                        <span className="text-gray-700">{mission}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {exp.technologies && exp.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-200">
                    {exp.technologies.map((tech, tIdx) => (
                      <Badge key={tIdx} color="gray">{tech}</Badge>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </Section>
      )}

      {/* 5. STAGES & ALTERNANCES */}
      {profile.stages_alternances && profile.stages_alternances.length > 0 && (
        <Section title="Stages & Alternances" icon="🎓">
          <div className="space-y-4">
            {profile.stages_alternances.map((stage, idx) => (
              <Card key={idx} className="border-l-4 border-green-500">
                <h4 className="font-semibold text-gray-900 mb-2 text-lg">{stage.intitule || "Stage"}</h4>
                {stage.duree && <p className="text-gray-600 text-sm mb-3 font-medium">{stage.duree}</p>}
                {stage.missions && stage.missions.length > 0 && (
                  <ul className="list-none space-y-2">
                    {stage.missions.map((mission, mIdx) => (
                      <li key={mIdx} className="flex items-start">
                        <span className="text-green-500 mr-2 mt-1">▸</span>
                        <span className="text-gray-700">{mission}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            ))}
          </div>
        </Section>
      )}

      {/* 6. PROJETS */}
      {profile.projets && profile.projets.length > 0 && (
        <Section title="Projets" icon="🚀">
          <div className="space-y-4">
            {profile.projets.map((projet, idx) => (
              <Card key={idx} className="border-l-4 border-purple-500">
                <h4 className="font-semibold text-gray-900 mb-2 text-lg">{projet.nom || "Projet"}</h4>
                {projet.description && (
                  <p className="text-gray-700 mb-3 leading-relaxed">{projet.description}</p>
                )}
                {projet.technologies && projet.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {projet.technologies.map((tech, tIdx) => (
                      <Badge key={tIdx} color="purple">{tech}</Badge>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </Section>
      )}

      {/* 7. FORMATION */}
      {profile.formation && profile.formation.length > 0 && (
        <Section title="Formation" icon="🎓">
          <div className="space-y-4">
            {profile.formation.map((edu, idx) => (
              <Card key={idx}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 text-lg">{edu.diplome || "Diplôme"}</h4>
                    {edu.etablissement && (
                      <p className="text-gray-600 mt-1">{edu.etablissement}</p>
                    )}
                    {edu.domaine && (
                      <p className="text-gray-500 text-sm mt-1">{edu.domaine}</p>
                    )}
                  </div>
                  {edu.annees && (
                    <span className="text-gray-600 text-sm mt-2 md:mt-0 font-medium bg-gray-100 px-3 py-1 rounded-full">{edu.annees}</span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </Section>
      )}

      {/* 8. CERTIFICATIONS */}
      {profile.certifications && profile.certifications.length > 0 && (
        <Section title="Certifications" icon="🏆">
          <div className="space-y-4">
            {profile.certifications.map((cert, idx) => (
              <Card key={idx}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 text-lg">{cert.nom || "Certification"}</h4>
                    {cert.organisme && (
                      <p className="text-gray-600 mt-1">{cert.organisme}</p>
                    )}
                  </div>
                  {cert.annee && (
                    <span className="text-gray-600 text-sm mt-2 md:mt-0 font-medium bg-gray-100 px-3 py-1 rounded-full">{cert.annee}</span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </Section>
      )}

      {/* 9. LANGUES */}
      {profile.langues && profile.langues.length > 0 && (
        <Section title="Langues" icon="🌐">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.langues.map((lang, idx) => (
              <Card key={idx}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900 text-lg">{lang.langue || "Langue"}</span>
                  <Badge color="green">{lang.niveau || "Non spécifié"}</Badge>
                </div>
              </Card>
            ))}
          </div>
        </Section>
      )}

      {/* 10. SOFT SKILLS */}
      {profile.soft_skills && profile.soft_skills.length > 0 && (
        <Section title="Soft Skills" icon="🤝">
          <div className="flex flex-wrap gap-3">
            {profile.soft_skills.map((skill, idx) => (
              <Badge key={idx} color="blue">{skill}</Badge>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
};

export default CandidateProfile;
