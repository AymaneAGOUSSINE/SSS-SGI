import React, { useState, useEffect } from 'react';
import { X, Briefcase, Calendar as CalendarIcon, Clock, CheckCircle2, XCircle, FileText } from 'lucide-react';
import { backendApi } from '../api';
import { Collaborateur, Affectation, Projet, Imputation, Absence } from '../types';

interface CollaboratorProfileModalProps {
  collaborateur: Collaborateur;
  onClose: () => void;
}

export default function CollaboratorProfileModal({ collaborateur, onClose }: CollaboratorProfileModalProps) {
  const [activeTab, setActiveTab] = useState<'projets' | 'imputations' | 'absences'>('projets');
  const [isLoading, setIsLoading] = useState(true);
  
  const [projets, setProjets] = useState<Projet[]>([]);
  const [affectations, setAffectations] = useState<Affectation[]>([]);
  const [imputations, setImputations] = useState<Imputation[]>([]);
  const [absences, setAbsences] = useState<Absence[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [allProjs, allAffectations, userImputations, userAbsences] = await Promise.all([
          backendApi.getAllProjets().catch(() => []),
          backendApi.getAffectationsByCollaborateur(collaborateur.id).catch(() => []),
          backendApi.getImputationsByEmploye(collaborateur.id).catch(() => []),
          backendApi.getAbsencesByEmploye(collaborateur.id).catch(() => [])
        ]);

        setAffectations(allAffectations || []);
        setProjets(allProjs || []);
        setImputations(userImputations || []);
        setAbsences(userAbsences || []);
      } catch (err) {
        console.error("Failed to load collaborator details", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [collaborateur.id]);

  const getUserProjects = () => {
    const projectIds = affectations.map(a => a.projetId);
    return projets.filter(p => projectIds.includes(p.id));
  };

  const getProjectName = (projectId: number) => {
    const p = projets.find(p => p.id === projectId);
    return p ? p.nomProjet : `Projet #${projectId}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-xl relative border border-gray-100 dark:border-gray-800">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-start justify-between shrink-0">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold text-2xl overflow-hidden border-2 border-orange-200 dark:border-orange-800 shadow-sm">
              {collaborateur.avatar ? (
                <img src={collaborateur.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <>{collaborateur.prenom[0]}{collaborateur.nom[0]}</>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                {collaborateur.prenom} {collaborateur.nom}
              </h2>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1">
                <span className={`inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-md w-fit ${
                  collaborateur.role === 'MANAGER' 
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' 
                    : collaborateur.role === 'SPECTATEUR'
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                }`}>
                  {collaborateur.role}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {collaborateur.email}
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 dark:border-gray-800 shrink-0 px-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('projets')}
            className={`px-4 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'projets'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <div className="flex items-center">
              <Briefcase className="w-4 h-4 mr-2" />
              Projets & Affectations
            </div>
          </button>
          <button
            onClick={() => setActiveTab('imputations')}
            className={`px-4 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'imputations'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Imputations
            </div>
          </button>
          <button
            onClick={() => setActiveTab('absences')}
            className={`px-4 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'absences'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <div className="flex items-center">
              <CalendarIcon className="w-4 h-4 mr-2" />
              Absences
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50 dark:bg-gray-900/50">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-pulse text-gray-400 text-sm font-medium">Chargement des données...</div>
            </div>
          ) : (
            <div className="animate-in fade-in duration-300">
              {activeTab === 'projets' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Projets affectés</h3>
                  {getUserProjects().length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {getUserProjects().map(projet => (
                        <div key={projet.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                          <h4 className="font-semibold text-gray-900 dark:text-white">{projet.nomProjet}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{projet.description}</p>
                          <div className="mt-3 inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                            {projet.status.replace('_', ' ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-8 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl text-gray-500">
                      Aucun projet affecté.
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'imputations' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Historique des imputations</h3>
                  {imputations.length > 0 ? (
                    <div className="space-y-3">
                      {imputations.map(imp => (
                        <div key={imp.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-gray-900 dark:text-white">{imp.nom}</h4>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                imp.statut === 'VALIDEE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                imp.statut === 'REJETEE' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                              }`}>
                                {imp.statut === 'EN_ATTENTE' && <Clock className="w-3 h-3 mr-1" />}
                                {imp.statut === 'VALIDEE' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                                {imp.statut === 'REJETEE' && <XCircle className="w-3 h-3 mr-1" />}
                                {imp.statut}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              Projet : {getProjectName(imp.projetId)}
                            </p>
                          </div>
                          <div className="mt-3 sm:mt-0 text-left sm:text-right">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {new Date(imp.date).toLocaleDateString('fr-FR')}
                            </div>
                            <div className="text-sm text-orange-600 dark:text-orange-400 font-semibold">
                              {imp.charge} heures
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-8 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl text-gray-500">
                      Aucune imputation trouvée.
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'absences' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Historique des absences</h3>
                  {absences.length > 0 ? (
                    <div className="space-y-3">
                      {absences.map(abs => (
                        <div key={abs.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-gray-900 dark:text-white">{abs.motif}</h4>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                abs.statut === 'APPROUVEE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                abs.statut === 'REFUSEE' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                              }`}>
                                {abs.statut === 'EN_ATTENTE' && <Clock className="w-3 h-3 mr-1" />}
                                {abs.statut === 'APPROUVEE' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                                {abs.statut === 'REFUSEE' && <XCircle className="w-3 h-3 mr-1" />}
                                {abs.statut}
                              </span>
                            </div>
                          </div>
                          <div className="mt-3 sm:mt-0 text-left sm:text-right">
                            <div className="text-sm text-gray-600 dark:text-gray-300">
                              Du {new Date(abs.dateDebut).toLocaleDateString('fr-FR')} au {new Date(abs.dateFin).toLocaleDateString('fr-FR')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-8 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl text-gray-500">
                      Aucune absence trouvée.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
