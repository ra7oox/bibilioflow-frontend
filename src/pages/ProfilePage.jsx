import React, { useEffect, useState } from 'react';

// ====================================================================
// PAGE DE PROFIL UTILISATEUR
// Affiche les informations de l'utilisateur et ses notes/avis
// ====================================================================

export const ProfilePage = () => {
  const [currentUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : { id: null, name: "Invité", role: 'emprunteur' };
  });

  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser.id) {
      fetchUserRating();
    }
  }, [currentUser.id]);

  // ====================================================================
  // TÂCHE 2 & 3 : CALCULER ET AFFICHER LA NOTE MOYENNE
  // ====================================================================
  const fetchUserRating = async () => {
  try {
    const response = await fetch(`https://biblioflow-production-022b.up.railway.app/${currentUser.id}/rating`);
    const data = await response.json();
    
    console.log('📊 Statistiques utilisateur:', data);
    setUserStats(data);
    setLoading(false);
  } catch (error) {
    console.error('Erreur chargement notes:', error);
    setLoading(false);
  }
};

// Fonction pour créer l'affichage des étoiles
const renderStars = (rating) => {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-200 dark:text-gray-600'}`}
        >
          ★
        </span>
      ))}
    </div>
  );
};

// Fonction pour créer l'affichage de la répartition des notes
const renderRatingDistribution = (distribution) => {
  const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
  
  return (
    <div className="space-y-2">
      {[5, 4, 3, 2, 1].map((star) => {
        const count = distribution[star] || 0;
        const percentage = total > 0 ? (count / total) * 100 : 0;
        
        return (
          <div key={star} className="flex items-center gap-3">
            <span className="text-sm font-bold text-gray-600 dark:text-gray-400 w-8">{star} ★</span>
            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className="bg-yellow-400 dark:bg-yellow-500 h-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-12 text-right">{count}</span>
          </div>
        );
      })}
    </div>
  );
};

if (loading) {
  return <div className="p-10 text-center font-bold text-gray-400 dark:text-gray-500 italic">Chargement...</div>;
}

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 transition-colors duration-200">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER DU PROFIL */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700 rounded-3xl shadow-2xl p-8 mb-8 text-white transition-colors">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-white dark:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
              <span className="text-5xl">👤</span>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-black mb-2">{currentUser.name}</h1>
              <p className="text-indigo-100 dark:text-indigo-200 font-medium">{currentUser.email}</p>
              <span className="inline-block mt-2 px-4 py-1 bg-white/20 dark:bg-white/30 rounded-full text-sm font-bold uppercase">
                {currentUser.role}
              </span>
            </div>
          </div>
        </div>

        {/* SECTION DES NOTES */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden mb-8 transition-colors">
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-6 border-b border-yellow-100 dark:border-yellow-800 transition-colors">
            <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-3">
              ⭐ Évaluations et Avis
            </h2>
          </div>

          {userStats && userStats.totalRatings > 0 ? (
            <div className="p-8">
              {/* RÉSUMÉ DES NOTES */}
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                {/* NOTE MOYENNE */}
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-2xl p-6 border-2 border-yellow-200 dark:border-yellow-700 transition-colors">
                  <div className="text-center">
                    <div className="text-6xl font-black text-yellow-600 dark:text-yellow-500 mb-2">
                      {userStats.averageRating}
                    </div>
                    <div className="flex justify-center mb-2">
                      {renderStars(Math.round(userStats.averageRating))}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 font-bold">
                      Basé sur {userStats.totalRatings} avis
                    </p>
                  </div>
                </div>

                {/* DISTRIBUTION */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6 transition-colors">
                  <h3 className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase mb-4">
                    Distribution des notes
                  </h3>
                  {renderRatingDistribution(userStats.ratingDistribution)}
                </div>
              </div>

              {/* LISTE DES AVIS */}
              <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 mb-6">
                  📝 Tous les avis ({userStats.ratings.length})
                </h3>
                <div className="space-y-4">
                  {userStats.ratings.map((review, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6 border border-gray-100 dark:border-gray-600 hover:border-indigo-200 dark:hover:border-indigo-700 transition-all"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span
                                key={star}
                                className={`text-xl ${
                                  star <= review.rating ? 'text-yellow-400' : 'text-gray-200 dark:text-gray-600'
                                }`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                          <span className="font-black text-gray-900 dark:text-gray-100">
                            {review.rating}/5
                          </span>
                        </div>
                        <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                          {new Date(review.ratedAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>

                      {review.comment && (
                        <p className="text-gray-700 dark:text-gray-300 font-medium mb-3">
                          "{review.comment}"
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>📖 {review.bookTitle}</span>
                        <span>•</span>
                        <span>Par {review.ratedBy}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">⭐</div>
              <h3 className="text-xl font-bold text-gray-400 dark:text-gray-500 mb-2">
                Aucune évaluation pour le moment
              </h3>
              <p className="text-gray-400 dark:text-gray-500">
                Complétez des échanges pour recevoir vos premières notes !
              </p>
            </div>
          )}
        </div>

        {/* STATISTIQUES SUPPLÉMENTAIRES */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 text-center transition-colors">
            <div className="text-4xl mb-2">📚</div>
            <div className="text-2xl font-black text-gray-900 dark:text-gray-100">
              {userStats?.totalRatings || 0}
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">Échanges notés</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 text-center transition-colors">
            <div className="text-4xl mb-2">⭐</div>
            <div className="text-2xl font-black text-yellow-600 dark:text-yellow-500">
              {userStats?.averageRating || 0}
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">Note moyenne</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 text-center transition-colors">
            <div className="text-4xl mb-2">🏆</div>
            <div className="text-2xl font-black text-green-600 dark:text-green-500">
              {userStats && userStats.averageRating >= 4.5 ? 'Excellent' : 
               userStats && userStats.averageRating >= 4 ? 'Très bien' :
               userStats && userStats.averageRating >= 3 ? 'Bien' : 'En cours'}
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">Réputation</p>
          </div>
        </div>

      </div>
    </div>
  );
};
