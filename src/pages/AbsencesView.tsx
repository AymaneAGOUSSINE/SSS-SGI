import React, { useState, useEffect } from 'react';
import { CalendarX, Plus, MoreVertical, CheckCircle2, XCircle, Clock, X } from 'lucide-react';
import { Collaborateur, Absence } from '../types';
import { backendApi } from '../api';

interface AbsencesViewProps {
  currentUser: Collaborateur;
}

export default function AbsencesView({ currentUser }: AbsencesViewProps) {
  const isManager = currentUser.role === 'MANAGER';
  
  const [activeTab, setActiveTab] = useState<'mes_absences' | 'equipe'>('mes_absences');
  const [myAbsences, setMyAbsences] = useState<Absence[]>([]);
  const [teamAbsences, setTeamAbsences] = useState<Absence[]>([]);
  const [collaborateurs, setCollaborateurs] = useState<Collaborateur[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [newAbsence, setNewAbsence] = useState({
    motif: 'Congé annuel',
    dateDebut: '',
    dateFin: ''
  });

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [collabs, myData] = await Promise.all([
        backendApi.getAllCollaborateurs().catch(() => []),
        backendApi.getAbsencesByEmploye(currentUser.id).catch(() => [])
      ]);
      setCollaborateurs(collabs);
      setMyAbsences(myData);

      if (isManager) {
        const teamData = await backendApi.getAllAbsencesEnAttente().catch(() => []);
        setTeamAbsences(teamData);
      }
    } catch (e) {
      console.error("Failed to load absences", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser, isManager]);

  const displayAbsences = activeTab === 'mes_absences' ? myAbsences : teamAbsences;

  const calculateDays = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const totalApprovedDays = displayAbsences
    .filter(a => a.statut === 'APPROUVEE' && a.collaborateurId === currentUser.id)
    .reduce((total, a) => total + calculateDays(a.dateDebut, a.dateFin), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAbsence.dateDebut || !newAbsence.dateFin) return;

    try {
      await backendApi.createAbsence(currentUser.id, {
        dateDebut: newAbsence.dateDebut,
        dateFin: newAbsence.dateFin,
        motif: newAbsence.motif as any
      });
      setIsModalOpen(false);
      setNewAbsence({ motif: 'Congé annuel', dateDebut: '', dateFin: '' });
      loadData();
    } catch (error) {
      console.error("Failed to create absence", error);
    }
  };

  const validerAbsence = async (id: number) => {
    try {
      await backendApi.validerAbsence(id, currentUser.id);
      loadData();
    } catch (e) { console.error(e); }
  };

  const rejeterAbsence = async (id: number) => {
    try {
      await backendApi.rejeterAbsence(id, currentUser.id, "Refusé par manager");
      loadData();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Absences & Congés</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Consultez et gérez les jours d'absence.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          Demander un congé
        </button>
      </div>

      {isManager && (
        <div className="flex space-x-1 bg-gray-100/50 dark:bg-gray-800/50 p-1 rounded-lg w-fit border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('mes_absences')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'mes_absences'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
            }`}
          >
            Mes Absences
          </button>
          <button
            onClick={() => setActiveTab('equipe')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'equipe'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
            }`}
          >
            Demandes d'équipe
          </button>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-xl border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Nouvelle demande de congé</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Motif
                </label>
                <select 
                  value={newAbsence.motif}
                  onChange={(e) => setNewAbsence({ ...newAbsence, motif: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm dark:text-white"
                >
                  <option value="Congé annuel">Congé annuel</option>
                  <option value="Maladie">Maladie</option>
                  <option value="Maternité/Paternité">Maternité/Paternité</option>
                  <option value="Sans solde">Sans solde</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date de début
                  </label>
                  <input 
                    type="date"
                    required
                    value={newAbsence.dateDebut}
                    onChange={(e) => setNewAbsence({ ...newAbsence, dateDebut: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date de fin
                  </label>
                  <input 
                    type="date"
                    required
                    value={newAbsence.dateFin}
                    onChange={(e) => setNewAbsence({ ...newAbsence, dateFin: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm dark:text-white"
                  />
                </div>
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  Soumettre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
          <div className="flex items-center text-gray-500 dark:text-gray-400 mb-2">
            <CheckCircle2 className="w-5 h-5 mr-2 text-green-500" />
            <h3 className="text-sm font-medium">Jours approuvés (Année)</h3>
          </div>
          <p className="text-3xl font-semibold text-gray-900 dark:text-white">{totalApprovedDays} <span className="text-lg text-gray-500 font-normal">jours</span></p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-900/50 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                <th className="p-4 font-medium">Collaborateur</th>
                <th className="p-4 font-medium">Motif</th>
                <th className="p-4 font-medium">Date de début</th>
                <th className="p-4 font-medium">Date de fin</th>
                <th className="p-4 font-medium">Durée</th>
                <th className="p-4 font-medium">Statut</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {displayAbsences.map(absence => {
                const days = calculateDays(absence.dateDebut, absence.dateFin);
                const employe = collaborateurs.find(c => c.id === absence.collaborateurId);
                return (
                  <tr key={absence.id} className="hover:bg-gray-50 dark:hover:bg-gray-750/50 transition-colors">
                    <td className="p-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{employe?.prenom} {employe?.nom}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{absence.motif}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-gray-900 dark:text-gray-300">
                        {new Date(absence.dateDebut).toLocaleDateString('fr-FR')}
                      </p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-gray-900 dark:text-gray-300">
                        {new Date(absence.dateFin).toLocaleDateString('fr-FR')}
                      </p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-gray-900 dark:text-gray-300">{days} jour{days > 1 ? 's' : ''}</p>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${
                        absence.statut === 'EN_ATTENTE' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                        absence.statut === 'APPROUVEE' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {absence.statut === 'EN_ATTENTE' && <Clock className="w-3 h-3 mr-1" />}
                        {absence.statut === 'APPROUVEE' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                        {absence.statut === 'REFUSEE' && <XCircle className="w-3 h-3 mr-1" />}
                        {absence.statut.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {isManager && activeTab === 'equipe' && absence.statut === 'EN_ATTENTE' ? (
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={async () => {
                              await backendApi.validerAbsence(absence.id, currentUser.id);
                              loadData();
                            }}
                            className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                            title="Approuver"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={async () => {
                              await backendApi.rejeterAbsence(absence.id, currentUser.id, 'Refusé');
                              loadData();
                            }}
                            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Refuser"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {displayAbsences.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    Aucune absence trouvée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
