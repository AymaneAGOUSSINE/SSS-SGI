import React, { useState, useEffect } from 'react';
import { Search, Mail, UserPlus, Shield, User } from 'lucide-react';
import { backendApi } from '../api';
import { Collaborateur } from '../types';

export default function CollaboratorsView() {
  const [collaborateurs, setCollaborateurs] = useState<Collaborateur[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    backendApi.getAllCollaborateurs()
      .then(data => setCollaborateurs(data))
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

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
        <button className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
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
                <button className="text-sm font-medium text-orange-600 dark:text-orange-400 hover:underline">
                  Voir Profil
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
