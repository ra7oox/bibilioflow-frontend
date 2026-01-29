import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Notification } from '../components/Notification';

export const AddBookPage = () => {
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Récupération de l'utilisateur complet depuis le localStorage
  const [currentUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [bookData, setBookData] = useState({
    title: '',
    author: '',
    category: 'Informatique',
    status: 'available',
    rating: 5.0,
    image: '' // Nouvelle propriété pour l'image
  });

  // Protection de route : US-03/04 - Seul un prêteur identifié peut poster
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'preteur') {
      navigate('/');
    }
  }, [currentUser, navigate]);

  // ====================================================================
  // GESTION DE L'UPLOAD D'IMAGE
  // ====================================================================
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        setNotification({ message: "Veuillez sélectionner une image valide", type: "error" });
        return;
      }

      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setNotification({ message: "L'image ne doit pas dépasser 5MB", type: "error" });
        return;
      }

      // Convertir l'image en base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setImagePreview(base64String);
        setBookData({ ...bookData, image: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  // Supprimer l'image
  const handleRemoveImage = () => {
    setImagePreview(null);
    setBookData({ ...bookData, image: '' });
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  const newBook = {
    ...bookData,
    owner: currentUser.name,
    ownerName: currentUser.name,
    ownerId: currentUser.id
  };

  // Petit test pour voir le poids des données en console
  const sizeInMB = (JSON.stringify(newBook).length / (1024 * 1024)).toFixed(2);
  console.log(`Tentative d'envoi : ${sizeInMB} MB`);

  try {
    const response = await fetch('https://biblioflow-production-022b.up.railway.app/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBook)
    });

    if (response.ok) {
      setNotification({ message: "Livre publié !", type: "success" });
      setTimeout(() => navigate('/'), 2000);
    } else if (response.status === 413) {
      setNotification({ message: "L'image est trop lourde pour le serveur.", type: "error" });
    } else {
      throw new Error("Erreur serveur");
    }
  } catch (error) {
    console.error("Erreur lors du fetch:", error);
    setNotification({ message: "Erreur lors de la publication", type: "error" });
  }
};

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 relative transition-colors duration-200">
      {notification && (
        <Notification 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification(null)} 
        />
      )}

      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 transition-colors">
        <div className="bg-indigo-600 dark:bg-indigo-700 p-8 text-center transition-colors">
          <h1 className="text-3xl font-black text-white italic tracking-tight uppercase">Mettre un livre en ligne</h1>
          <p className="text-indigo-100 dark:text-indigo-200 mt-2 font-medium">Connecté en tant que : {currentUser?.name}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {/* ====================================================================
              SECTION UPLOAD D'IMAGE
              ==================================================================== */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-6 border-2 border-dashed border-gray-200 dark:border-gray-600 transition-colors">
            <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">
              Photo du livre (optionnelle)
            </label>

            {imagePreview ? (
              // Aperçu de l'image
              <div className="relative">
                <img 
                  src={imagePreview} 
                  alt="Aperçu du livre" 
                  className="w-full h-64 object-cover rounded-2xl shadow-lg"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg transition-all active:scale-95"
                  title="Supprimer l'image"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              // Zone de dépôt
              <label className="flex flex-col items-center justify-center h-48 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600/50 rounded-2xl transition-colors">
                <div className="text-center">
                  <div className="text-6xl mb-4">📸</div>
                  <p className="text-gray-600 dark:text-gray-400 font-bold mb-2">
                    Cliquez pour ajouter une photo
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    PNG, JPG ou WEBP (max 5MB)
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* ====================================================================
              CHAMPS DU FORMULAIRE
              ==================================================================== */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1">
                Titre du livre *
              </label>
              <input 
                type="text" 
                required 
                className="w-full px-5 py-4 rounded-2xl border-2 border-gray-50 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-indigo-500 dark:focus:border-indigo-400 focus:bg-white dark:focus:bg-gray-600 outline-none transition-all font-bold placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="Ex: Apprendre React en 24h"
                onChange={(e) => setBookData({...bookData, title: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1">
                Auteur *
              </label>
              <input 
                type="text" 
                required 
                className="w-full px-5 py-4 rounded-2xl border-2 border-gray-50 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-indigo-500 dark:focus:border-indigo-400 focus:bg-white dark:focus:bg-gray-600 outline-none transition-all font-bold placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="Nom de l'auteur"
                onChange={(e) => setBookData({...bookData, author: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1">
                Catégorie *
              </label>
              <select 
                className="w-full px-5 py-4 rounded-2xl border-2 border-gray-50 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-indigo-500 dark:focus:border-indigo-400 focus:bg-white dark:focus:bg-gray-600 outline-none transition-all font-bold cursor-pointer"
                onChange={(e) => setBookData({...bookData, category: e.target.value})}
              >
                <option value="Informatique">💻 Informatique</option>
                <option value="Littérature">📖 Littérature</option>
                <option value="Sciences">🧪 Sciences</option>
                <option value="Économie">📈 Économie</option>
              </select>
            </div>
          </div>

          {/* ====================================================================
              ACTIONS
              ==================================================================== */}
          <div className="pt-6 border-t border-gray-100 dark:border-gray-700 flex gap-4 transition-colors">
            <button 
              type="button" 
              onClick={() => navigate('/')}
              className="flex-1 py-4 text-gray-400 dark:text-gray-500 font-bold hover:bg-gray-50 dark:hover:bg-gray-700 rounded-2xl transition"
            >
              Annuler
            </button>
            <button 
              type="submit"
              className="flex-[2] bg-indigo-600 dark:bg-indigo-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-indigo-700 dark:hover:bg-indigo-600 shadow-lg shadow-indigo-100 dark:shadow-indigo-900/30 transition-all active:scale-95"
            >
              Confirmer la publication
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
