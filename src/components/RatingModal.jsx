import React, { useState } from 'react';

export const RatingModal = ({ 
  request, 
  onClose, 
  onSubmit 
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    onSubmit({ rating, comment });
  };

  const handleStarClick = (selectedRating) => {
    setRating(selectedRating);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in duration-200 transition-colors">
        
        {/* En-tête */}
        <header className="mb-6">
          <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-2 transition-colors">
            Noter l'échange
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium italic">
            Livre : {request.bookTitle}
          </p>
        </header>

        {/* Évaluation par étoiles */}
        <div className="flex justify-center gap-3 mb-8">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => handleStarClick(star)}
              className={`text-4xl transition-all duration-150 hover:scale-110 active:scale-95 ${
                rating >= star 
                  ? 'text-yellow-400 drop-shadow-md' 
                  : 'text-gray-200 dark:text-gray-600 hover:text-yellow-300 dark:hover:text-yellow-400'
              }`}
              aria-label={`Donner ${star} étoile${star > 1 ? 's' : ''}`}
            >
              ★
            </button>
          ))}
        </div>

        {/* Champ de commentaire */}
        <div className="mb-6">
          <textarea
            value={comment}
            placeholder="Laissez un commentaire sur l'état du livre ou la ponctualité..."
            onChange={(e) => setComment(e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-700 border-2 border-gray-100 dark:border-gray-600 
                       text-gray-900 dark:text-gray-100 rounded-2xl p-4 h-32 
                       outline-none focus:border-indigo-500 dark:focus:border-indigo-400 
                       transition-colors duration-200 resize-none text-sm 
                       placeholder-gray-400 dark:placeholder-gray-500"
            rows={4}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-4 mt-8">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 text-gray-500 dark:text-gray-400 font-bold rounded-xl 
                       hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
          >
            Plus tard
          </button>
          
          <button
            type="button"
            onClick={handleSubmit}
            disabled={rating === 0}
            className={`flex-[2] py-4 rounded-2xl font-black uppercase tracking-widest 
                       text-xs shadow-xl transition-all duration-200 ${
              rating === 0
                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-600 cursor-not-allowed'
                : 'bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 active:scale-[0.98]'
            }`}
          >
            Envoyer l'avis
          </button>
        </div>
      </div>
    </div>
  );
};