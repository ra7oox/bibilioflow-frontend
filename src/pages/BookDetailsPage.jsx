import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export const BookDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Gestion de l'utilisateur actuel (Récupéré du localStorage)
  const [currentUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : { id: null, name: "Invité", role: 'emprunteur' };
  });

  const [book, setBook] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [myRequests, setMyRequests] = useState([]);
  const [formData, setFormData] = useState({ date: '', location: '', message: '' });
  const [editFormData, setEditFormData] = useState({
    title: '',
    author: '',
    category: 'Informatique',
    status: 'available'
  });

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await fetch(`https://biblioflow-production-022b.up.railway.app/${id}`);
        if (!res.ok) throw new Error("Échec de la récupération du livre");
        const bookData = await res.json();
        setBook(bookData);
        // Initialiser le formulaire d'édition avec les données du livre
        setEditFormData({
          title: bookData.title,
          author: bookData.author,
          category: bookData.category,
          status: bookData.status
        });
      } catch (err) {
        console.error("Erreur lors du chargement du livre :", err);
      }
    };

    const fetchRequests = async () => {
      if (!currentUser.id) return;
      try {
        const response = await fetch(`http://localhost:5000/requests?requesterId=${currentUser.id}`);
        const data = await response.json();
        setMyRequests(data);
      } catch (error) {
        console.error("Erreur requêtes:", error);
      }
    };

    fetchBook();
    fetchRequests();
  }, [id, currentUser.id]);

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!currentUser.id) {
      setNotification("Veuillez vous connecter pour emprunter.");
      return;
    }

    const newRequest = {
      bookId: book.id,
      bookTitle: book.title,
      requesterId: currentUser.id,
      requesterName: currentUser.name,
      ownerName: book.owner,
      status: "pending",
      requestDate: formData.date,
      meetingDetails: {
        date: formData.date,
        location: formData.location,
        message: formData.message
      }
    };

    try {
      const response = await fetch('http://localhost:5000/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRequest)
      });

      if (response.ok) {
        const data = await response.json();
        setMyRequests([...myRequests, data]);
        setIsModalOpen(false);
        setNotification("✅ Demande envoyée avec succès! Le prêteur a été notifié.");
        setTimeout(() => setNotification(null), 4000);
      }
    } catch (error) {
      console.error("Erreur envoi demande:", error);
    }
  };

  // ====================================================================
  // MODIFIER LE LIVRE
  // ====================================================================
  const handleEditBook = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`http://localhost:5000/books/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      });

      if (response.ok) {
        const updatedBook = await response.json();
        setBook(updatedBook);
        setIsEditModalOpen(false);
        setNotification("✅ Livre modifié avec succès !");
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (error) {
      console.error("Erreur modification livre:", error);
      setNotification("❌ Erreur lors de la modification");
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // ====================================================================
  // SUPPRIMER LE LIVRE
  // ====================================================================
  const handleDeleteBook = async () => {
    try {
      const response = await fetch(`http://localhost:5000/books/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setNotification("✅ Livre supprimé avec succès !");
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (error) {
      console.error("Erreur suppression livre:", error);
      setNotification("❌ Erreur lors de la suppression");
      setTimeout(() => setNotification(null), 3000);
    }
  };

  if (!book) return <div className="p-10 text-center font-bold text-gray-500 dark:text-gray-400">Chargement du livre...</div>;

  // ====================================================================
  // VÉRIFIER SI L'UTILISATEUR ACTUEL EST LE PROPRIÉTAIRE DU LIVRE
  // ====================================================================
  const isOwner = currentUser.id && (
    currentUser.id === book.ownerId || 
    currentUser.name === book.owner || 
    currentUser.name === book.ownerName
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 relative transition-colors duration-200">
      {notification && (
        <div className="fixed top-5 right-5 bg-indigo-600 dark:bg-indigo-500 text-white px-8 py-4 rounded-2xl shadow-2xl z-50 animate-bounce font-bold">
          {notification}
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate(-1)} className="mb-6 text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
          ← Retour à la recherche
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row mb-12 border border-gray-100 dark:border-gray-700 transition-colors">
          
          {/* IMAGE DU LIVRE */}
          <div className="md:w-2/5 relative overflow-hidden">
            {book.image ? (
              <img 
                src={book.image} 
                alt={book.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-white dark:from-indigo-900/30 dark:to-gray-800 flex items-center justify-center p-12 text-9xl transition-colors">
                📖
              </div>
            )}
          </div>
          
          <div className="p-8 md:p-12 flex-1">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <span className="text-indigo-600 dark:text-indigo-400 font-bold uppercase text-xs tracking-widest">
                  Propriétaire : {book.owner}
                </span>
                {isOwner && (
                  <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full text-[10px] font-black uppercase">
                    Votre livre
                  </span>
                )}
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                book.status === 'available' 
                  ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' 
                  : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
              }`}>
                {book.status === 'available' ? '● Disponible' : '● Emprunté'}
              </span>
            </div>

            <h1 className="text-4xl font-black text-gray-900 dark:text-gray-100 mt-4 leading-tight transition-colors">{book.title}</h1>
            <p className="text-xl text-gray-500 dark:text-gray-400 mb-4 italic">par {book.author}</p>

            {/* NOTATION DU PRÊTEUR */}
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100 dark:border-gray-700 transition-colors">
              <div className="flex text-yellow-400 text-xl">
                {Array.from({ length: 5 }).map((_, index) => (
                  <span key={index}>
                    {index < Math.round(book.rating ?? 5) ? "★" : "☆"}
                  </span>
                ))}
              </div>

              <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 px-2 py-0.5 rounded-lg text-sm font-extrabold">
                {(book.rating ?? 5).toFixed(1)}
              </span>

              <span className="text-gray-400 dark:text-gray-500 text-xs font-medium">
                (Fiabilité du prêteur)
              </span>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-2xl mb-8 border border-gray-100 dark:border-gray-600 transition-colors">
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    Ce livre est proposé à l'échange par un étudiant de votre campus. 
                    En faisant une demande, vous pourrez convenir d'un rendez-vous pour récupérer l'ouvrage.
                </p>
            </div>

            {/* BOUTONS D'ACTION */}
            {isOwner ? (
              // L'utilisateur est le propriétaire - boutons de gestion
              <div className="space-y-4">
                <div className="bg-indigo-50 dark:bg-indigo-900/30 border-2 border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 py-3 rounded-2xl text-center font-bold transition-colors">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xl">👤</span>
                    <span>C'est votre livre</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="bg-blue-600 dark:bg-blue-500 text-white py-3 rounded-2xl font-bold hover:bg-blue-700 dark:hover:bg-blue-600 transition flex items-center justify-center gap-2"
                  >
                    <span>✏️</span>
                    <span>Modifier</span>
                  </button>

                  <button
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="bg-red-600 dark:bg-red-500 text-white py-3 rounded-2xl font-bold hover:bg-red-700 dark:hover:bg-red-600 transition flex items-center justify-center gap-2"
                  >
                    <span>🗑️</span>
                    <span>Supprimer</span>
                  </button>
                </div>
              </div>
            ) : book.status === 'available' ? (
              // Livre disponible et utilisateur n'est pas le propriétaire
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full bg-indigo-600 dark:bg-indigo-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition duration-300 shadow-lg shadow-indigo-100 dark:shadow-indigo-900/30"
              >
                Faire une demande d'emprunt
              </button>
            ) : (
              // Livre non disponible
              <div className="w-full bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 py-4 rounded-2xl text-center font-bold border-2 border-dashed border-gray-200 dark:border-gray-600">
                Livre actuellement indisponible
              </div>
            )}
          </div>
        </div>

        {/* SIGNALER UN PROBLÈME */}
        <div className="mt-10 pt-5 border-t border-gray-200 dark:border-gray-700 flex items-center justify-center transition-colors">
          <button
            onClick={() => setNotification("⚠️ Merci, le signalement a bien été pris en compte.")}
            className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-tight text-gray-400 dark:text-gray-500 transition hover:text-pink-500 dark:hover:text-pink-400"
          >
            <span>🚨</span>
            Signaler un problème
          </button>
        </div>

        {/* HISTORIQUE DES DEMANDES */}
        {!isOwner && (
          <div className="mt-10">
            <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2 transition-colors">
              <span>📋</span> Mes demandes en cours
            </h2>
            {myRequests.length > 0 ? (
              <div className="grid gap-4">
                {myRequests.map(req => (
                  <div key={req.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-center hover:shadow-md transition-all">
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-gray-100">{req.bookTitle}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Rendez-vous proposé : <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{req.requestDate}</span></p>
                    </div>
                    <span className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-tighter ${
                      req.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300' : 
                      req.status === 'accepted' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : 
                      'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                    }`}>
                      {req.status === 'pending' ? 'En attente' : req.status === 'accepted' ? 'Acceptée' : 'Refusée'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 dark:text-gray-500 italic">Vous n'avez pas encore fait de demande pour ce livre.</p>
            )}
          </div>
        )}
      </div>

      {/* MODAL DEMANDE D'EMPRUNT */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in duration-200 transition-colors">
            <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-2">Modalités d'échange</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 font-medium">Proposez un lieu et une date à {book.owner}.</p>
            
            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase ml-1">Date souhaitée</label>
                <input 
                  type="date" 
                  required 
                  className="w-full border-2 border-gray-50 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl p-4 outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition" 
                  onChange={(e) => setFormData({...formData, date: e.target.value})} 
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase ml-1">Lieu (Campus/BU)</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Où souhaitez-vous vous voir ?" 
                  className="w-full border-2 border-gray-50 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-xl p-4 outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition" 
                  onChange={(e) => setFormData({...formData, location: e.target.value})} 
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase ml-1">Message au prêteur</label>
                <textarea 
                  placeholder="Un petit mot gentil..." 
                  className="w-full border-2 border-gray-50 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-xl p-4 h-28 outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition resize-none" 
                  onChange={(e) => setFormData({...formData, message: e.target.value})} 
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 py-4 text-gray-400 dark:text-gray-500 font-bold hover:text-gray-600 dark:hover:text-gray-300 transition"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-4 bg-indigo-600 dark:bg-indigo-500 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 dark:shadow-indigo-900/30 hover:bg-indigo-700 dark:hover:bg-indigo-600 transition"
                >
                  Confirmer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL MODIFIER LE LIVRE */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in duration-200 transition-colors">
            <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-2">✏️ Modifier le livre</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 font-medium">Modifiez les informations de votre livre.</p>
            
            <form onSubmit={handleEditBook} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase ml-1">Titre</label>
                <input 
                  type="text" 
                  required 
                  value={editFormData.title}
                  className="w-full border-2 border-gray-50 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl p-4 outline-none focus:border-blue-500 dark:focus:border-blue-400 transition font-bold" 
                  onChange={(e) => setEditFormData({...editFormData, title: e.target.value})} 
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase ml-1">Auteur</label>
                <input 
                  type="text" 
                  required 
                  value={editFormData.author}
                  className="w-full border-2 border-gray-50 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl p-4 outline-none focus:border-blue-500 dark:focus:border-blue-400 transition font-bold" 
                  onChange={(e) => setEditFormData({...editFormData, author: e.target.value})} 
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase ml-1">Catégorie</label>
                <select 
                  value={editFormData.category}
                  className="w-full border-2 border-gray-50 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl p-4 outline-none focus:border-blue-500 dark:focus:border-blue-400 transition font-bold cursor-pointer"
                  onChange={(e) => setEditFormData({...editFormData, category: e.target.value})}
                >
                  <option value="Informatique">💻 Informatique</option>
                  <option value="Littérature">📖 Littérature</option>
                  <option value="Sciences">🧪 Sciences</option>
                  <option value="Économie">📈 Économie</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase ml-1">Statut</label>
                <select 
                  value={editFormData.status}
                  className="w-full border-2 border-gray-50 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl p-4 outline-none focus:border-blue-500 dark:focus:border-blue-400 transition font-bold cursor-pointer"
                  onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                >
                  <option value="available">✅ Disponible</option>
                  <option value="unavailable">❌ Indisponible</option>
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsEditModalOpen(false)} 
                  className="flex-1 py-4 text-gray-400 dark:text-gray-500 font-bold hover:text-gray-600 dark:hover:text-gray-300 transition"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-4 bg-blue-600 dark:bg-blue-500 text-white rounded-2xl font-bold shadow-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMATION SUPPRESSION */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in duration-200 transition-colors">
            <h2 className="text-2xl font-black text-red-600 dark:text-red-400 mb-2">🗑️ Supprimer le livre ?</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 font-medium">
              Êtes-vous sûr de vouloir supprimer "<span className="font-bold text-gray-900 dark:text-gray-100">{book.title}</span>" ? 
              Cette action est irréversible.
            </p>
            
            <div className="flex gap-4">
              <button 
                onClick={() => setIsDeleteModalOpen(false)} 
                className="flex-1 py-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              >
                Annuler
              </button>
              <button 
                onClick={handleDeleteBook}
                className="flex-1 py-4 bg-red-600 dark:bg-red-500 text-white rounded-2xl font-bold shadow-lg hover:bg-red-700 dark:hover:bg-red-600 transition"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
