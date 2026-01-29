import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Notification } from '../components/Notification';

export const AuthPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [notification, setNotification] = useState(null);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    accountType: 'emprunteur'
  });

  // ====================================================================
  // CORRECTION : Nettoyer le localStorage à chaque fois qu'on arrive sur cette page
  // ====================================================================
  React.useEffect(() => {
    console.log("🔄 Page d'authentification chargée - Nettoyage des sessions précédentes");
    // Effacer toute session précédente pour éviter les conflits
    localStorage.removeItem('user');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Tentative d'authentification...", isLogin ? "Connexion" : "Inscription");
    console.log("📧 Email saisi:", formData.email);
    console.log("🔑 Mot de passe saisi:", formData.password);

    try {
      if (isLogin) {
        // ============================================================
        // LOGIQUE DE CONNEXION - VERSION SÉCURISÉE AVEC ENDPOINT DÉDIÉ
        // ============================================================
        
        // ÉTAPE 1 : NETTOYER le localStorage avant toute connexion
        localStorage.removeItem('user');
        console.log("🧹 localStorage nettoyé");
        
        // ÉTAPE 2 : Appeler l'endpoint de login dédié
        const response = await fetch('https://biblioflow-production-022b.up.railway.app/auth/login', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          })
        });
        
        const data = await response.json();
        
        console.log("📡 Réponse du serveur:", data);

        if (response.ok && data.success) {
          const user = data.user;
          
          console.log("✅ Connexion réussie pour l'utilisateur:", user);
          
          // ÉTAPE 3 : Stocker les infos EXACTES de l'utilisateur connecté
          const userSession = {
            id: user.id,
            name: user.name || user.email.split('@')[0],
            email: user.email,
            role: user.role
          };
          
          console.log("📦 Session à stocker:", userSession);
          
          localStorage.setItem('user', JSON.stringify(userSession));
          
          // Vérifier que le stockage a bien fonctionné
          const verifyStorage = localStorage.getItem('user');
          console.log("✔️ Vérification stockage:", JSON.parse(verifyStorage));
          
          setNotification({ message: `Bienvenue ${userSession.name} !`, type: "success" });
          
          // ÉTAPE 4 : Redirection après un court délai
          setTimeout(() => {
            console.log("🚀 Redirection vers la page d'accueil");
            window.location.href = "/";
          }, 1500);
        } else {
          console.log("❌ Échec de connexion:", data.error);
          setNotification({ 
            message: data.error || "Email ou mot de passe incorrect", 
            type: "error" 
          });
        }

      } else {
        // ============================================================
        // LOGIQUE D'INSCRIPTION
        // ============================================================
        
        // ÉTAPE 1 : Vérifier si l'email existe déjà
        console.log("🔍 Vérification si l'email existe déjà...");
        const checkRes = await fetch(`http://localhost:5000/users?email=${formData.email}`);
        const existingUsers = await checkRes.json();

        if (existingUsers.length > 0) {
          console.log("⚠️ Email déjà utilisé");
          setNotification({ message: "Cet utilisateur existe déjà", type: "error" });
          return;
        }

        // ÉTAPE 2 : Création de l'utilisateur
        const newUser = {
          email: formData.email,
          password: formData.password,
          role: formData.accountType,
          name: formData.email.split('@')[0]
        };

        console.log("📝 Création du nouvel utilisateur:", newUser);

        const response = await fetch('http://localhost:5000/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newUser)
        });

        if (response.ok) {
          const createdUser = await response.json();
          console.log("✅ Utilisateur créé:", createdUser);
          
          // Réinitialiser le formulaire après inscription
          setFormData({ email: '', password: '', accountType: 'emprunteur' });
          setNotification({ message: "Compte créé ! Connectez-vous.", type: "success" });
          setIsLogin(true); // Basculer vers le mode connexion
        } else {
          console.error("❌ Erreur création:", await response.text());
          throw new Error("Impossible de créer le compte");
        }
      }
    } catch (error) {
      console.error("❌ Erreur Auth:", error);
      setNotification({ message: "Le serveur backend (port 5000) ne répond pas", type: "error" });
    }
  };

  // ====================================================================
  // FONCTION POUR CHANGER DE MODE (Connexion/Inscription)
  // ====================================================================
  const toggleMode = () => {
    setIsLogin(!isLogin);
    // Réinitialiser le formulaire lors du changement de mode
    setFormData({ email: '', password: '', accountType: 'emprunteur' });
    setNotification(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-indigo-600 dark:bg-indigo-900 p-4 transition-colors duration-200">
      {notification && (
        <Notification 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification(null)} 
        />
      )}

      <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl shadow-2xl p-8 transition-colors">
        <h1 className="text-3xl font-black text-center text-gray-900 dark:text-gray-100 mb-2 transition-colors">
          {isLogin ? 'Connexion' : 'Inscription'}
        </h1>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-8 font-medium">
          {isLogin ? 'Accédez à votre compte étudiant' : 'Créez votre profil sur la plateforme'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">Email Universitaire</label>
            <input 
              type="email" 
              required 
              value={formData.email}
              className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
              placeholder="ex: jean.dupont@univ.fr"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">Mot de passe</label>
            <input 
              type="password" 
              required 
              value={formData.password}
              className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
              placeholder="••••••••"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          {!isLogin && (
            <div className="py-2">
              <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-3">Je suis un :</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, accountType: 'emprunteur'})}
                  className={`py-3 rounded-xl font-bold border-2 transition-all ${
                    formData.accountType === 'emprunteur' 
                      ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' 
                      : 'border-gray-100 dark:border-gray-700 text-gray-400 dark:text-gray-500'
                  }`}
                >
                  Emprunteur
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, accountType: 'preteur'})}
                  className={`py-3 rounded-xl font-bold border-2 transition-all ${
                    formData.accountType === 'preteur' 
                      ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' 
                      : 'border-gray-100 dark:border-gray-700 text-gray-400 dark:text-gray-500'
                  }`}
                >
                  Prêteur
                </button>
              </div>
            </div>
          )}

          <button 
            type="submit"
            className="w-full bg-indigo-600 dark:bg-indigo-500 text-white py-5 rounded-2xl font-bold text-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-100 dark:shadow-indigo-900/30"
          >
            {isLogin ? 'Se connecter' : 'Créer mon compte'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={toggleMode}
            className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
          >
            {isLogin ? "Nouveau ? Créer un compte" : "Déjà inscrit ? Se connecter"}
          </button>
        </div>
      </div>
    </div>
  );
};
