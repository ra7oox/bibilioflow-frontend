import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export const SearchPage = () => {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('Toutes');

  useEffect(() => {
    // US-01 : Afficher la liste des résultats (Fetch initial)
    const fetchBooks = async () => {
      try {
        const response = await fetch('https://biblioflow-production-022b.up.railway.app/books');
        if (response.ok) {
          const data = await response.json();
          setBooks(data);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des livres:", error);
      }
    };
    fetchBooks();
  }, []);

  // US-01 : Implémenter la logique de recherche (Titre/Auteur) et Catégorie
  const filteredBooks = books.filter(book => {
    const matchesSearch = 
      book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = category === 'Toutes' || book.category === category;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* --- HERO SECTION & RECHERCHE --- */}
      <div className="bg-indigo-600 dark:bg-indigo-800 py-16 px-4 shadow-inner transition-colors duration-200">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl mb-4">
            Trouvez vos prochains supports de cours
          </h1>
          <p className="text-indigo-100 dark:text-indigo-200 text-lg mb-8">
            Recherchez parmi des centaines de livres partagés par la communauté étudiante.
          </p>
          
          <div className="mt-8 flex flex-col md:flex-row justify-center gap-4">
            {/* US-01 : Champ de recherche par texte */}
            <div className="relative w-full max-w-lg">
              <input
                type="text"
                placeholder="Titre, auteur, mot-clé..."
                className="w-full px-6 py-4 rounded-2xl shadow-xl focus:outline-none focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-500 text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-700 transition-all font-medium"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="absolute right-5 top-4.5 text-xl opacity-50">🔍</span>
            </div>

            {/* US-01 : Filtre par catégorie */}
            <select 
              className="px-6 py-4 rounded-2xl shadow-xl bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 outline-none focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-500 font-semibold cursor-pointer transition-all"
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Toutes">📚 Toutes les matières</option>
              <option value="Informatique">💻 Informatique</option>
              <option value="Littérature">📖 Littérature</option>
              <option value="Sciences">🧪 Sciences</option>
              <option value="Économie">📈 Économie</option>
            </select>
          </div>
        </div>
      </div>

      {/* --- GRILLE DE RÉSULTATS --- */}
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100 tracking-tight italic transition-colors">
            {category === 'Toutes' ? 'Derniers ajouts' : `Rayon ${category}`}
          </h2>
          <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">{filteredBooks.length}</span>
            <span className="text-gray-400 dark:text-gray-500 text-sm ml-2 font-medium">ouvrages trouvés</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredBooks.map((book) => (
            <div key={book.id} className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
              
              {/* ====================================================================
                  IMAGE DU LIVRE (avec image par défaut si pas d'image)
                  ==================================================================== */}
              <div className="h-48 relative overflow-hidden">
                {book.image ? (
                  // Image uploadée par l'utilisateur
                  <img 
                    src={book.image} 
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  // Image par défaut avec gradient
                  <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/20 dark:to-gray-800 flex items-center justify-center transition-colors">
                    <span className="text-6xl group-hover:scale-110 transition-transform duration-300">📖</span>
                  </div>
                )}

                {/* Badge de disponibilité */}
                <div className="absolute top-4 right-4">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-tight shadow-sm ${
                      book.status === "available"
                        ? "bg-green-500 dark:bg-green-600 text-white"
                        : "bg-orange-500 dark:bg-orange-600 text-white"
                    }`}
                  >
                    {book.status === "available" ? "Disponible" : "Emprunté"}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <p className="text-xs font-bold text-indigo-400 dark:text-indigo-300 uppercase tracking-widest mb-1">{book.category}</p>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{book.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Par {book.author}</p>
                
                <div className="pt-4 border-t border-gray-50 dark:border-gray-700 flex items-center justify-between transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-[10px] font-bold text-white shadow-inner">
                      {book.owner?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{book.owner}</span>
                  </div>
                  {/* US-02 : Navigation vers le détail */}
                  <Link 
                    to={`/book/${book.id}`}
                    className="bg-gray-900 dark:bg-gray-700 text-white p-2 rounded-xl hover:bg-indigo-600 dark:hover:bg-indigo-500 transition-colors"
                  >
                    <span className="text-sm font-bold px-2">Voir</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* US-01 : Gérer le cas "aucun résultat" */}
        {filteredBooks.length === 0 && (
          <div className="text-center py-32 bg-white dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 transition-colors">
            <span className="text-6xl block mb-4">📚</span>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              Aucun résultat disponible
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Modifiez vos critères de recherche ou vos filtres pour continuer.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setCategory('Toutes');
              }}
              className="mt-6 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              Réinitialiser la recherche
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
