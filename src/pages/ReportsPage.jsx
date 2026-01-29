import React, { useEffect, useState } from 'react';

// ====================================================================
// PAGE DE GESTION DES RAPPORTS ET SIGNALEMENTS
// Accessible par : Emprunteurs (pour voir leurs rapports) et Admins (pour tout gérer)
// ====================================================================

export const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('reports'); // 'reports' ou 'notifications'
  const [selectedReport, setSelectedReport] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [notification, setNotification] = useState(null);

  // Récupération de l'utilisateur connecté
  const [currentUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : { id: null, name: "Invité", role: 'emprunteur' };
  });

  const isAdmin = currentUser.role === 'admin';

  useEffect(() => {
    fetchReportsAndNotifications();
  }, [currentUser]);

  // ====================================================================
  // RÉCUPÉRATION DES DONNÉES
  // ====================================================================
  const fetchReportsAndNotifications = async () => {
    try {
      setLoading(true);

      // Récupérer les signalements
      let reportsUrl = 'https://biblioflow-production-022b.up.railway.app/reports';
      if (!isAdmin) {
        // Les emprunteurs voient seulement leurs signalements
        reportsUrl += `?reportedByUserId=${currentUser.id}`;
      }
      
      const reportsResponse = await fetch(reportsUrl);
      const reportsData = await reportsResponse.json();
      setReports(reportsData);

      // Récupérer les notifications
      let notificationsUrl = 'http://localhost:5000/notifications';
      if (!isAdmin) {
        // Les emprunteurs voient seulement leurs notifications
        notificationsUrl += `?recipientId=${currentUser.id}`;
      }
      
      const notificationsResponse = await fetch(notificationsUrl);
      const notificationsData = await notificationsResponse.json();
      setNotifications(notificationsData);

      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      setLoading(false);
    }
  };

  // ====================================================================
  // ADMIN : METTRE À JOUR LE STATUT D'UN SIGNALEMENT
  // ====================================================================
  const handleUpdateReportStatus = async (reportId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/reports/${reportId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: newStatus,
          adminNote: adminNote 
        })
      });

      if (response.ok) {
        setNotification(`✅ Statut mis à jour: ${newStatus}`);
        setSelectedReport(null);
        setAdminNote('');
        fetchReportsAndNotifications();
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (error) {
      console.error('Erreur mise à jour:', error);
      setNotification('❌ Erreur lors de la mise à jour');
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // ====================================================================
  // MARQUER UNE NOTIFICATION COMME LUE
  // ====================================================================
  const handleMarkAsRead = async (notificationId) => {
    try {
      await fetch(`http://localhost:5000/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });
      fetchReportsAndNotifications();
    } catch (error) {
      console.error('Erreur marquage lecture:', error);
    }
  };

  // ====================================================================
  // HELPERS POUR L'AFFICHAGE
  // ====================================================================
  const getStatusBadge = (status) => {
    const styles = {
      en_attente: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300',
      traite: 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300',
      resolu: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
    };
    
    const labels = {
      en_attente: '⏳ En attente',
      traite: '🔄 En traitement',
      resolu: '✅ Résolu'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getReasonLabel = (reason) => {
    const labels = {
      non_rendu: '📕 Livre non restitué',
      abime: '💔 Livre détérioré',
      absence: '👻 Rendez-vous manqué',
      comportement: '⚠️ Comportement inapproprié'
    };
    return labels[reason] || reason;
  };

  if (loading) {
    return <div className="p-10 text-center font-bold text-gray-400 dark:text-gray-500 italic">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 relative transition-colors duration-200">
      {/* NOTIFICATION */}
      {notification && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-indigo-600 dark:bg-indigo-500 text-white px-8 py-4 rounded-2xl shadow-2xl z-50 font-bold animate-bounce">
          {notification}
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight italic uppercase transition-colors">
            {isAdmin ? '🛡️ Tableau de bord Admin' : '📋 Mes Rapports & Notifications'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
            {isAdmin 
              ? 'Gérez tous les signalements et notifications de la plateforme' 
              : 'Suivez vos signalements et vos rappels'}
          </p>
        </div>

        {/* TABS */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-6 py-3 rounded-2xl font-black uppercase text-sm transition ${
              activeTab === 'reports'
                ? 'bg-rose-600 dark:bg-rose-700 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            🚨 Signalements ({reports.length})
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-6 py-3 rounded-2xl font-black uppercase text-sm transition ${
              activeTab === 'notifications'
                ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            🔔 Notifications ({notifications.filter(n => !n.readAt).length})
          </button>
        </div>

        {/* CONTENU - SIGNALEMENTS */}
        {activeTab === 'reports' && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
            {reports.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-xl font-bold text-gray-400 dark:text-gray-500">Aucun signalement</h3>
                <p className="text-gray-400 dark:text-gray-500 mt-2">Tous les échanges se passent bien !</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600 transition-colors">
                    <tr>
                      <th className="p-5 font-bold text-gray-400 dark:text-gray-300 uppercase text-xs tracking-widest">Date</th>
                      <th className="p-5 font-bold text-gray-400 dark:text-gray-300 uppercase text-xs tracking-widest">Livre</th>
                      <th className="p-5 font-bold text-gray-400 dark:text-gray-300 uppercase text-xs tracking-widest">Raison</th>
                      {isAdmin && <th className="p-5 font-bold text-gray-400 dark:text-gray-300 uppercase text-xs tracking-widest">Signalé par</th>}
                      {isAdmin && <th className="p-5 font-bold text-gray-400 dark:text-gray-300 uppercase text-xs tracking-widest">Utilisateur visé</th>}
                      <th className="p-5 font-bold text-gray-400 dark:text-gray-300 uppercase text-xs tracking-widest">Statut</th>
                      <th className="p-5 font-bold text-gray-400 dark:text-gray-300 uppercase text-xs tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                    {reports.map((report) => (
                      <tr key={report.id} className="hover:bg-rose-50/20 dark:hover:bg-rose-900/10 transition-colors">
                        <td className="p-5">
                          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                            {new Date(report.createdAt).toLocaleDateString('fr-FR')}
                          </span>
                        </td>
                        <td className="p-5">
                          <span className="font-bold text-gray-900 dark:text-gray-100">{report.bookTitle}</span>
                        </td>
                        <td className="p-5">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{getReasonLabel(report.reason)}</span>
                        </td>
                        {isAdmin && (
                          <td className="p-5">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{report.reportedBy}</span>
                          </td>
                        )}
                        {isAdmin && (
                          <td className="p-5">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{report.targetUser}</span>
                          </td>
                        )}
                        <td className="p-5">
                          {getStatusBadge(report.status)}
                        </td>
                        <td className="p-5 text-right">
                          <button
                            onClick={() => setSelectedReport(report)}
                            className="bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-700 dark:hover:bg-indigo-600 transition"
                          >
                            Détails
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* CONTENU - NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-12 text-center transition-colors">
                <div className="text-6xl mb-4">🔕</div>
                <h3 className="text-xl font-bold text-gray-400 dark:text-gray-500">Aucune notification</h3>
                <p className="text-gray-400 dark:text-gray-500 mt-2">Vous êtes à jour !</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`bg-white dark:bg-gray-800 rounded-3xl shadow-lg border p-6 transition-all ${
                    notif.readAt 
                      ? 'border-gray-100 dark:border-gray-700 opacity-60' 
                      : 'border-indigo-200 dark:border-indigo-700 shadow-indigo-100 dark:shadow-indigo-900/30'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">
                          {notif.type === 'reminder' ? '🔔' : '📢'}
                        </span>
                        <div>
                          <h3 className="font-black text-gray-900 dark:text-gray-100">{notif.subject}</h3>
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {new Date(notif.sentAt).toLocaleString('fr-FR')}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 font-medium ml-11">{notif.message}</p>
                      {notif.senderName && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 ml-11">
                          Envoyé par <span className="font-bold">{notif.senderName}</span>
                        </p>
                      )}
                    </div>
                    {!notif.readAt && !isAdmin && (
                      <button
                        onClick={() => handleMarkAsRead(notif.id)}
                        className="bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-200 dark:hover:bg-indigo-800 transition"
                      >
                        Marquer comme lu
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* MODAL DÉTAILS DU SIGNALEMENT */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto transition-colors">
            {/* HEADER */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-black text-rose-600 dark:text-rose-400 uppercase tracking-tighter">
                  🚨 Détails du signalement
                </h2>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">ID: {selectedReport.id}</p>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* INFORMATIONS PRINCIPALES */}
            <div className="space-y-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-4 transition-colors">
                <h4 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase mb-2">Livre concerné</h4>
                <p className="font-bold text-gray-900 dark:text-gray-100">{selectedReport.bookTitle}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-4 transition-colors">
                  <h4 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase mb-2">Signalé par</h4>
                  <p className="font-bold text-gray-900 dark:text-gray-100">{selectedReport.reportedBy}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Rôle: {selectedReport.reportedByRole}</p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-4 transition-colors">
                  <h4 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase mb-2">Utilisateur visé</h4>
                  <p className="font-bold text-gray-900 dark:text-gray-100">{selectedReport.targetUser}</p>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-4 transition-colors">
                <h4 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase mb-2">Raison</h4>
                <p className="font-medium text-gray-700 dark:text-gray-300">{getReasonLabel(selectedReport.reason)}</p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-4 transition-colors">
                <h4 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase mb-2">Description</h4>
                <p className="font-medium text-gray-700 dark:text-gray-300">{selectedReport.description}</p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-4 transition-colors">
                <h4 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase mb-2">Statut actuel</h4>
                {getStatusBadge(selectedReport.status)}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-4 transition-colors">
                  <h4 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase mb-2">Créé le</h4>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {new Date(selectedReport.createdAt).toLocaleString('fr-FR')}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-4 transition-colors">
                  <h4 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase mb-2">Mis à jour le</h4>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {new Date(selectedReport.updatedAt).toLocaleString('fr-FR')}
                  </p>
                </div>
              </div>

              {selectedReport.adminNote && (
                <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl p-4 border-2 border-indigo-200 dark:border-indigo-700 transition-colors">
                  <h4 className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase mb-2">Note de l'admin</h4>
                  <p className="font-medium text-indigo-900 dark:text-indigo-300">{selectedReport.adminNote}</p>
                </div>
              )}
            </div>

            {/* ACTIONS ADMIN */}
            {isAdmin && selectedReport.status !== 'resolu' && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h4 className="text-sm font-black text-gray-700 dark:text-gray-300 uppercase mb-4">Actions administrateur</h4>
                
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Ajouter une note administrative (optionnel)..."
                  className="w-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-none rounded-2xl p-4 h-24 outline-none text-sm font-medium mb-4"
                />

                <div className="flex gap-3">
                  {selectedReport.status === 'en_attente' && (
                    <button
                      onClick={() => handleUpdateReportStatus(selectedReport.id, 'traite')}
                      className="flex-1 bg-orange-500 dark:bg-orange-600 text-white py-3 rounded-2xl font-black uppercase text-xs hover:bg-orange-600 dark:hover:bg-orange-700 transition"
                    >
                      🔄 Marquer "En traitement"
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleUpdateReportStatus(selectedReport.id, 'resolu')}
                    className="flex-1 bg-green-600 dark:bg-green-700 text-white py-3 rounded-2xl font-black uppercase text-xs hover:bg-green-700 dark:hover:bg-green-800 transition"
                  >
                    ✅ Marquer "Résolu"
                  </button>
                </div>
              </div>
            )}

            {/* BOUTON FERMER */}
            {!isAdmin || selectedReport.status === 'resolu' && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <button
                  onClick={() => setSelectedReport(null)}
                  className="w-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 py-3 rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                >
                  Fermer
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
