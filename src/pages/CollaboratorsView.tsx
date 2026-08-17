import React, { useState, useEffect } from 'react';
import { Search, Mail, UserPlus, Shield, User, X } from 'lucide-react';
import { backendApi } from '../api';
import { Collaborateur } from '../types';
import CollaboratorProfileModal from '../components/CollaboratorProfileModal';

export default function CollaboratorsView() {
  const [collaborateurs, setCollaborateurs] = useState<Collaborateur[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCollabData, setNewCollabData] = useState({
    nom: '',
    prenom: '',
    email: '',
    role: 'EMPLOYE' as Collaborateur['role']
  });

  const loadCollaborateurs = () => {
    backendApi.getAllCollaborateurs()
      .then(data => setCollaborateurs(data))
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadCollaborateurs();
  }, []);

  const handleAddCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollabData.nom || !newCollabData.prenom || !newCollabData.email) return;
    try {
      await backendApi.createCollaborateur(newCollabData);
      setIsAddModalOpen(false);
      setNewCollabData({ nom: '', prenom: '', email: '', role: 'EMPLOYE' });
      loadCollaborateurs();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleRole = (id: number) => {
    // Note: The provided Spring Boot backend doesn't currently expose a role update endpoint.
    // We update local state to maintain the visual interaction in the UI for now.
    setCollaborateurs(collaborateurs.map(collab => {
      if (collab.id === id) {
        if (collab.role === 'MANAGER') return collab;
        
        let newRole: Collaborateur['role'] = 'EMPLOYE';
        if (collab.role === 'EMPLOYE') newRole = 'MANAGER';
        else if (collab.role === 'SPECTATEUR') newRole = 'EMPLOYE';

        return {
          ...collab,
          role: newRole
        };
      }
      return collab;
    }));
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Chargement des collaborateurs...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Collaborateurs</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Gérez l'équipe, les rôles et les affectations.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Ajouter Collaborateur
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Rechercher un collaborateur..." 
              className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {collaborateurs.map(collab => (
            <div key={collab.id} className="p-5 border border-gray-100 dark:border-gray-700 rounded-xl hover:shadow-md transition-shadow bg-gray-50/30 dark:bg-gray-800/50">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 font-semibold text-lg overflow-hidden border border-orange-200 dark:border-orange-800">
                    {collab.avatar ? (
                      <img src={collab.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <>{collab.prenom[0]}{collab.nom[0]}</>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {collab.prenom} {collab.nom}
                    </h3>
                    <span className={`inline-flex px-2 py-0.5 mt-1 text-[10px] font-semibold rounded-md ${
                      collab.role === 'MANAGER' 
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' 
                        : collab.role === 'SPECTATEUR'
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {collab.role}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                <Mail className="w-4 h-4 mr-2" />
                <a href={`mailto:${collab.email}`} className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                  {collab.email}
                </a>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                {collab.role !== 'MANAGER' ? (
                  <button 
                    onClick={() => toggleRole(collab.id)}
                    className="flex items-center text-xs font-medium text-gray-600 hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-400 transition-colors"
                    title="Changer le rôle"
                  >
                    {collab.role === 'SPECTATEUR' ? (
                      <><User className="w-4 h-4 mr-1.5" /> Approuver (Employé)</>
                    ) : (
                      <><Shield className="w-4 h-4 mr-1.5" /> Passer Manager</>
                    )}
                  </button>
                ) : (
                  <span className="flex items-center text-xs font-medium text-gray-400 dark:text-gray-500 cursor-not-allowed" title="Le rôle d'un manager ne peut pas être modifié">
                    <Shield className="w-4 h-4 mr-1.5" /> Manager
                  </span>
                )}
                <button 
                  onClick={() => setSelectedProfileId(collab.id)}
                  className="text-sm font-medium text-orange-600 dark:text-orange-400 hover:underline"
                >
                  Voir Profil
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full shadow-xl border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ajouter un collaborateur</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddCollaborator} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prénom</label>
                  <input
                    type="text"
                    required
                    value={newCollabData.prenom}
                    onChange={e => setNewCollabData({ ...newCollabData, prenom: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom</label>
                  <input
                    type="text"
                    required
                    value={newCollabData.nom}
                    onChange={e => setNewCollabData({ ...newCollabData, nom: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={newCollabData.email}
                  onChange={e => setNewCollabData({ ...newCollabData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rôle</label>
                <select
                  value={newCollabData.role}
                  onChange={e => setNewCollabData({ ...newCollabData, role: e.target.value as Collaborateur['role'] })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm dark:text-white"
                >
                  <option value="EMPLOYE">Employé</option>
                  <option value="MANAGER">Manager</option>
                  <option value="SPECTATEUR">Spectateur</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 dark:focus:ring-offset-gray-900"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedProfileId && (
        <CollaboratorProfileModal
          collaborateur={collaborateurs.find(c => c.id === selectedProfileId)!}
          onClose={() => setSelectedProfileId(null)}
        />
      )}
    </div>
  );
}
