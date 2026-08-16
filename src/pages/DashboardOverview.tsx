import React, { useState, useEffect } from 'react';
import { Users, Briefcase, Building2, TrendingUp, Clock } from 'lucide-react';
import { backendApi } from '../api';
import { Collaborateur, Projet, Affectation, Client } from '../types';

interface DashboardProps {
  currentUser: Collaborateur;
}

export default function DashboardOverview({ currentUser }: DashboardProps) {
  const isManager = currentUser.role === 'MANAGER';
  
  const [projets, setProjets] = useState<Projet[]>([]);
  const [collaborateurs, setCollaborateurs] = useState<Collaborateur[]>([]);
  const [affectations, setAffectations] = useState<Affectation[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (isManager) {
          const [projData, collabData, clientData] = await Promise.all([
            backendApi.getAllProjets().catch(() => []),
            backendApi.getAllCollaborateurs().catch(() => []),
            backendApi.getAllClients().catch(() => [])
          ]);
          setProjets(projData);
          setCollaborateurs(collabData);
          setClients(clientData);
        } else if (currentUser.role === 'EMPLOYE') {
          const [affectData] = await Promise.all([
            backendApi.getAffectationsByCollaborateur(currentUser.id).catch(() => [])
          ]);
          setAffectations(affectData);
          // Load specific projects based on affectations
          // We'll skip fetching each individually here for brevity and just show counts
        }
      } catch (e) {
        console.error("Dashboard data load error:", e);
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser.role !== 'SPECTATEUR') {
      loadData();
    } else {
      setIsLoading(false);
    }
  }, [currentUser, isManager]);

  const activeProjects = isManager 
    ? projets.filter(p => p.status === 'EN_COURS').length
    : affectations.length;

  const totalBudget = projets.reduce((acc, p) => acc + p.budget, 0);

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Chargement du tableau de bord...</div>;
  }

  if (currentUser.role === 'SPECTATEUR') {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Tableau de Bord</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Aperçu général de votre compte.</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 dark:bg-orange-900/20 dark:border-orange-800 rounded-xl p-6 text-center">
          <Clock className="w-12 h-12 text-orange-500 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-orange-800 dark:text-orange-400">Compte en attente d'approbation</h3>
          <p className="text-sm text-orange-600 dark:text-orange-300 mt-2 max-w-md mx-auto">
            Votre compte a été créé avec succès. Veuillez patienter jusqu'à ce qu'un manager approuve votre compte et vous attribue un rôle.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Tableau de Bord</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Aperçu général des activités de 3S-SGI.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-full bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Projets Actifs</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{activeProjects} {isManager && `/ ${projets.length}`}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-full bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400">

            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Clients</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{clients.length}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Collaborateurs</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{collaborateurs.length}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-full bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Budget Total</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{totalBudget.toLocaleString()} MAD</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900 dark:text-white">Projets Récents</h3>
            <button className="text-sm text-orange-600 dark:text-orange-400 hover:underline">Voir tout</button>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {projets.slice(0, 3).map(projet => (
              <div key={projet.id} className="p-5 flex items-start justify-between hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{projet.nomProjet}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{projet.description}</p>
                </div>
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                  projet.status === 'EN_COURS' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                  projet.status === 'TERMINE' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                  'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                }`}>
                  {projet.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900 dark:text-white">Affectations Actuelles</h3>
            <button className="text-sm text-orange-600 dark:text-orange-400 hover:underline">Voir tout</button>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {affectations.slice(0, 3).map(affectation => {
              const collab = collaborateurs.find(c => c.id === affectation.collaborateurId);
              const projet = projets.find(p => p.id === affectation.projetId);
              return (
                <div key={affectation.id} className="p-5 flex items-center space-x-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                  <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 text-gray-600 dark:text-gray-300 font-medium">
                    {collab?.prenom[0]}{collab?.nom[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {collab?.prenom} {collab?.nom}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      Assigné(e) à: <span className="font-medium">{projet?.nomProjet}</span>
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <select 
                      className={`px-2 py-1 text-xs font-medium rounded-md border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 cursor-pointer focus:outline-none focus:ring-1 focus:ring-orange-500 ${
                        affectation.office === 'Front Office' 
                          ? 'text-blue-700 dark:text-blue-400' 
                          : 'text-purple-700 dark:text-purple-400'
                      }`}
                      defaultValue={affectation.office || 'Front Office'}
                    >
                      <option value="Front Office">Front Office</option>
                      <option value="Back Office">Back Office</option>
                    </select>
                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                      <Clock className="w-3 h-3 mr-1" />
                      Jusqu'au {new Date(affectation.dateFin).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
