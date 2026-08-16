import React, { useState, useEffect } from 'react';
import { Plus, Search, MoreVertical, X } from 'lucide-react';
import { backendApi } from '../api';
import { Collaborateur, Projet, Client, Affectation } from '../types';

interface ProjectsViewProps {
  currentUser: Collaborateur;
}

export default function ProjectsView({ currentUser }: ProjectsViewProps) {
  const isManager = currentUser.role === 'MANAGER';
  const [projets, setProjets] = useState<Projet[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [affectations, setAffectations] = useState<Affectation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    nomProjet: '',
    description: '',
    budget: 0,
    status: 'EN_ATTENTE' as const,
    clientId: 1
  });

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [projs, clts] = await Promise.all([
        backendApi.getAllProjets().catch(() => []),
        backendApi.getAllClients().catch(() => [])
      ]);
      setProjets(projs || []);
      setClients(clts || []);
      
      if (!isManager) {
        const affs = await backendApi.getAffectationsByCollaborateur(currentUser.id).catch(() => []);
        setAffectations(affs || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const displayProjects = isManager 
    ? projets
    : projets.filter(p => affectations.some(a => a.projetId === p.id && a.collaborateurId === currentUser.id));

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.nomProjet.trim()) return;

    try {
      await backendApi.createProjet({
        nomProjet: newProject.nomProjet,
        description: newProject.description,
        budget: Number(newProject.budget),
        status: newProject.status,
        clientId: Number(newProject.clientId)
      });
      setIsModalOpen(false);
      setNewProject({
        nomProjet: '',
        description: '',
        budget: 0,
        status: 'EN_ATTENTE',
        clientId: clients.length > 0 ? clients[0].id_client : 1
      });
      loadData();
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">Chargement...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Projets</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Gérez tous les projets et leurs budgets.</p>
        </div>
        {isManager && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau Projet
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Rechercher un projet..." 
              className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-white"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-900/50 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                <th className="p-4 font-medium">Nom du Projet</th>
                <th className="p-4 font-medium">Client</th>
                {isManager && <th className="p-4 font-medium">Budget</th>}
                <th className="p-4 font-medium">Statut</th>
                {isManager && <th className="p-4 font-medium text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {displayProjects.map(projet => {
                const client = clients.find(c => c.id_client === projet.clientId);
                return (
                  <tr key={projet.id} className="hover:bg-gray-50 dark:hover:bg-gray-750/50 transition-colors">
                    <td className="p-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{projet.nomProjet}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs mt-0.5">{projet.description}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-gray-900 dark:text-gray-300">{client?.nom_client || 'N/A'}</p>
                    </td>
                    {isManager && (
                      <td className="p-4 text-sm text-gray-900 dark:text-gray-300 font-medium">
                        {projet.budget.toLocaleString()} MAD
                      </td>
                    )}
                    <td className="p-4">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${
                        projet.status === 'EN_COURS' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                        projet.status === 'TERMINE' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                      }`}>
                        {projet.status.replace('_', ' ')}
                      </span>
                    </td>
                    {isManager && (
                      <td className="p-4 text-right">
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-xl border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Nouveau Projet</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nom du projet
                </label>
                <input 
                  type="text"
                  required
                  value={newProject.nomProjet}
                  onChange={(e) => setNewProject({ ...newProject, nomProjet: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea 
                  required
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Client
                  </label>
                  <select 
                    value={newProject.clientId}
                    onChange={(e) => setNewProject({ ...newProject, clientId: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm dark:text-white"
                  >
                    {clients.map(c => (
                      <option key={c.id_client} value={c.id_client}>{c.nom_client}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Budget (MAD)
                  </label>
                  <input 
                    type="number"
                    required
                    min="0"
                    value={newProject.budget}
                    onChange={(e) => setNewProject({ ...newProject, budget: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Statut initial
                </label>
                <select 
                  value={newProject.status}
                  onChange={(e) => setNewProject({ ...newProject, status: e.target.value as Projet['status'] })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm dark:text-white"
                >
                  <option value="EN_ATTENTE">En attente</option>
                  <option value="EN_COURS">En cours</option>
                  <option value="TERMINE">Terminé</option>
                </select>
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!newProject.nomProjet.trim() || !newProject.description.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Créer le projet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
