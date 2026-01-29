import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';

import { BookDetailsPage } from './pages/BookDetailsPage';
import { RequestsPage } from './pages/RequestsPage';
import { SearchPage } from './pages/searchPage';
import { AuthPage } from './pages/AuthPage';
import { AddBookPage } from './pages/AddBookPage';
import { ProfilePage } from './pages/ProfilePage';
import { ReportsPage } from './pages/ReportsPage';

export function AppRouter() {
  const [user, setUser] = useState(null);
  const [currentUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : { id: null, name: "Invité", role: 'emprunteur' };
  });

  // ====================================================================
  // ÉTAT POUR LE MENU MOBILE
  // ====================================================================
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ====================================================================
  // ÉTAT POUR LE MODE SOMBRE
  // ====================================================================
  const [darkMode, setDarkMode] = useState(() => {
    // Charger la préférence depuis localStorage
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  // Appliquer le mode sombre au document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Vérifier l'utilisateur au chargement
  useEffect(() => {
    const checkUser = () => {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      setUser(storedUser);
    };

    checkUser();
    window.addEventListener('storage', checkUser);
    return () => window.removeEventListener('storage', checkUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setMobileMenuOpen(false); // Fermer le menu mobile
    window.location.href = '/auth';
  };

  // Fermer le menu mobile lors du clic sur un lien
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <BrowserRouter>
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 py-4 px-4 md:px-8 flex justify-between items-center sticky top-0 z-50 shadow-sm transition-colors duration-200">
        
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">📚</span>
          <span className="font-bold text-xl tracking-tight text-indigo-600 dark:text-indigo-400">
            BiblioFlow
          </span>
        </Link>

        {/* NAVIGATION CENTRALE - Desktop uniquement */}
        <div className="hidden md:flex space-x-8 font-medium text-gray-600 dark:text-gray-300">
          <Link to="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
            Explorer
          </Link>
          {user && (
            <Link to="/requests" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
              Mes Demandes
            </Link>
          )}
          <Link to="/reports" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
            {currentUser.role === 'admin' ? '🛡️ Admin' : '📋 Signalements'}
          </Link>
        </div>

        {/* ACTIONS UTILISATEUR - Desktop */}
        <div className="hidden md:flex items-center gap-4">
          
          {/* BOUTON DARK MODE */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title={darkMode ? 'Mode clair' : 'Mode sombre'}
          >
            {darkMode ? (
              <span className="text-xl">☀️</span>
            ) : (
              <span className="text-xl">🌙</span>
            )}
          </button>

          {user ? (
            <>
              {user.role === 'preteur' && (
                <Link 
                  to="/AddBook"  
                  className="bg-green-500 dark:bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-600 dark:hover:bg-green-700 transition shadow-md"
                >
                  + Ajouter un livre
                </Link>
              )}
              
              <div className="flex items-center gap-3 ml-4 border-l border-gray-200 dark:border-gray-700 pl-4">
                <div className="text-right">
                  <Link 
                    to="/profile" 
                    className="text-xs font-bold text-gray-900 dark:text-gray-100 leading-none hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    {user.email.split('@')[0]}
                  </Link>
                  <p className="text-[10px] text-indigo-500 dark:text-indigo-400 uppercase font-extrabold tracking-tighter">
                    {user.role}
                  </p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-50 dark:hover:bg-red-900 hover:text-red-600 dark:hover:text-red-400 transition"
                >
                  Déconnexion
                </button>
              </div>
            </>
          ) : (
            <div className="space-x-2">
              <Link 
                to="/auth" 
                className="text-indigo-600 dark:text-indigo-400 font-bold px-4 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition"
              >
                Connexion
              </Link>
              <Link 
                to="/auth" 
                className="bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700 dark:hover:bg-indigo-600 transition shadow-lg"
              >
                S'inscrire
              </Link>
            </div>
          )}
        </div>

        {/* ACTIONS MOBILE - Boutons Dark Mode + Menu Hamburger */}
        <div className="flex md:hidden items-center gap-2">
          
          {/* BOUTON DARK MODE - Mobile */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title={darkMode ? 'Mode clair' : 'Mode sombre'}
          >
            {darkMode ? (
              <span className="text-lg">☀️</span>
            ) : (
              <span className="text-lg">🌙</span>
            )}
          </button>

          {/* BOUTON MENU HAMBURGER */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* ====================================================================
          MENU MOBILE DÉROULANT
          ==================================================================== */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-lg transition-colors duration-200">
          <div className="px-4 py-4 space-y-3">
            
            {/* Navigation Links */}
            <Link 
              to="/" 
              onClick={closeMobileMenu}
              className="block px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition"
            >
              🏠 Explorer
            </Link>

            {user && (
              <Link 
                to="/requests" 
                onClick={closeMobileMenu}
                className="block px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition"
              >
                📋 Mes Demandes
              </Link>
            )}

            <Link 
              to="/reports" 
              onClick={closeMobileMenu}
              className="block px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition"
            >
              {currentUser.role === 'admin' ? '🛡️ Admin' : '📋 Signalements'}
            </Link>

            {user ? (
              <>
                {/* Profil */}
                <Link 
                  to="/profile" 
                  onClick={closeMobileMenu}
                  className="block px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition"
                >
                  👤 Profil ({user.email.split('@')[0]})
                </Link>

                {/* Ajouter un livre (Prêteur uniquement) */}
                {user.role === 'preteur' && (
                  <Link 
                    to="/AddBook" 
                    onClick={closeMobileMenu}
                    className="block px-4 py-3 rounded-lg bg-green-500 dark:bg-green-600 text-white hover:bg-green-600 dark:hover:bg-green-700 font-bold transition text-center"
                  >
                    + Ajouter un livre
                  </Link>
                )}

                {/* Déconnexion */}
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 font-bold transition text-center"
                >
                  🚪 Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/auth" 
                  onClick={closeMobileMenu}
                  className="block px-4 py-3 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 font-bold transition text-center"
                >
                  🔑 Connexion
                </Link>
                <Link 
                  to="/auth" 
                  onClick={closeMobileMenu}
                  className="block px-4 py-3 rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 font-bold transition text-center shadow-lg"
                >
                  ✨ S'inscrire
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* ROUTES */}
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/book/:id" element={<BookDetailsPage />} />
          <Route path="/requests" element={<RequestsPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/addBook" element={<AddBookPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/reports" element={<ReportsPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}