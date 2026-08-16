import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Check, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Collaborateur, Imputation, Projet } from '../types';
import { backendApi } from '../api';

interface ImputationsViewProps {
  currentUser: Collaborateur;
}

export default function ImputationsView({ currentUser }: ImputationsViewProps) {
  if (currentUser.role === 'MANAGER') {
    return <ManagerImputationsView currentUser={currentUser} />;
  }

  return <EmployeImputationsView currentUser={currentUser} />;
}

function ManagerImputationsView({ currentUser }: { currentUser: Collaborateur }) {
  const [imputations, setImputations] = useState<Imputation[]>([]);
  const [allProjects, setAllProjects] = useState<Projet[]>([]);
  const [collaborateurs, setCollaborateurs] = useState<Collaborateur[]>([]);
  
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [selectedImputationId, setSelectedImputationId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [projs, collabs, data] = await Promise.all([
          backendApi.getAllProjets().catch(() => []),
          backendApi.getAllCollaborateurs().catch(() => []),
          backendApi.getImputationsEnAttente(currentUser.id).catch(() => [])
        ]);
        
        setAllProjects(projs || []);
        setCollaborateurs(collabs || []);
        setImputations(data || []);
      } catch (error) {
        console.error("Error loading manager data", error);
      }
    };
    
    loadData();
  }, [currentUser]);

  const handleValidate = async (id: number) => {
    try {
      await backendApi.validerImputation(id, currentUser.id);
      setImputations(prev => prev.filter(i => i.id !== id));
    } catch (error) {
      console.error("Failed to validate imputation", error);
    }
  };

  const openRejectionModal = (id: number) => {
    setSelectedImputationId(id);
    setRejectionReason('');
    setRejectionModalOpen(true);
  };

  const submitRejection = async () => {
    if (!selectedImputationId) return;
    try {
      await backendApi.rejeterImputation(selectedImputationId, currentUser.id);
      setImputations(prev => prev.filter(i => i.id !== selectedImputationId));
      setRejectionModalOpen(false);
    } catch (error) {
      console.error("Failed to reject imputation", error);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Validation des Imputations</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Gérez les imputations en attente de vos collaborateurs.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {imputations.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>Aucune imputation en attente de validation.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-900/50 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Collaborateur</th>
                  <th className="p-4 font-medium">Projet</th>
                  <th className="p-4 font-medium">Description</th>
                  <th className="p-4 font-medium text-center">Charge</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {imputations.map((imputation) => {
                  const projet = allProjects.find(p => p.id === imputation.projetId);
                  const employe = collaborateurs.find(c => c.id === imputation.employeId);
                  return (
                    <tr key={imputation.id} className="hover:bg-gray-50 dark:hover:bg-gray-750/50 transition-colors">
                      <td className="p-4 text-sm text-gray-900 dark:text-gray-300">
                        {new Date(imputation.date).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                            {employe?.avatar ? (
                              <img src={employe.avatar} alt="Avatar" className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300">
                                {employe?.prenom[0]}{employe?.nom[0]}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{employe?.prenom} {employe?.nom}</p>
                            <p className="text-xs text-gray-500">{employe?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-900 dark:text-gray-300">
                        {projet?.nomProjet || 'N/A'}
                      </td>
                      <td className="p-4 text-sm text-gray-600 dark:text-gray-400 max-w-[200px] truncate">
                        {imputation.nom}
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                          {imputation.charge}h
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleValidate(imputation.id)}
                            className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                            title="Valider"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => openRejectionModal(imputation.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Rejeter"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {rejectionModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-xl border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Motif de refus</h3>
            <textarea
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm dark:text-white min-h-[100px]"
              placeholder="Veuillez expliquer pourquoi cette imputation est rejetée..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setRejectionModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={submitRejection}
                disabled={!rejectionReason.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirmer le refus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EmployeImputationsView({ currentUser }: { currentUser: Collaborateur }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [imputations, setImputations] = useState<Imputation[]>([]);
  const [userProjects, setUserProjects] = useState<Projet[]>([]);
  
  const [selectedProject, setSelectedProject] = useState<number>(0);
  const [charge, setCharge] = useState<number>(8);
  const [imputationNom, setImputationNom] = useState<string>('');

  useEffect(() => {
    // Load initial data
    const loadData = async () => {
      try {
        const [projs, affectations, data] = await Promise.all([
          backendApi.getAllProjets().catch(() => []),
          backendApi.getAffectationsByCollaborateur(currentUser.id).catch(() => []),
          backendApi.getImputationsByEmploye(currentUser.id).catch(() => [])
        ]);
        
        const myProjs = (projs || []).filter((p: Projet) => 
          (affectations || []).some((a: any) => a.projetId === p.id && a.collaborateurId === currentUser.id)
        );

        setUserProjects(myProjs);
        if (myProjs.length > 0) {
          setSelectedProject(myProjs[0].id);
        }
        setImputations(data || []);
      } catch (error) {
        console.error("Error loading imputations", error);
      }
    };
    
    loadData();
  }, [currentUser]);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  // Adjust so Monday is 0, Sunday is 6
  const startingDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  const isWeekendOrHoliday = (date: Date) => {
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) return true; // Sunday or Saturday

    const d = date.getDate();
    const m = date.getMonth() + 1;
    const fixedHolidays = [
      { d: 1, m: 1 }, // Nouvel an
      { d: 11, m: 1 }, // Manifeste de l'indépendance
      { d: 1, m: 5 }, // Fête du travail
      { d: 30, m: 7 }, // Fête du trône
      { d: 14, m: 8 }, // Allégeance Oued Ed-Dahab
      { d: 20, m: 8 }, // Révolution du Roi et du Peuple
      { d: 21, m: 8 }, // Fête de la Jeunesse
      { d: 6, m: 11 }, // Marche Verte
      { d: 18, m: 11 }, // Fête de l'Indépendance
    ];
    
    return fixedHolidays.some(h => h.d === d && h.m === m);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDate(null);
  };

  const getImputationForDate = (date: Date) => {
    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return imputations.find(i => i.employeId === currentUser.id && i.date === dateString);
  };

  const handleDateClick = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    
    setSelectedDate(date);
    
    // Pre-fill form if there's an existing imputation
    const existing = getImputationForDate(date);
    if (existing) {
      setSelectedProject(existing.projetId);
      setCharge(existing.charge);
      setImputationNom(existing.nom);
    } else {
      setCharge(8);
      setImputationNom(`Imputation - ${date.toLocaleDateString('fr-FR')}`);
    }
  };

  const handleSaveImputation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedProject) return;

    const dateString = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
    
    try {
      const data = {
        nom: imputationNom,
        projetId: selectedProject,
        employeId: currentUser.id,
        date: dateString,
        charge: charge
      };

      const newImputation = await backendApi.createImputation(data);
      
      setImputations(prev => {
        // Remove existing imputation for this date if it exists (for mock update simulation)
        const filtered = prev.filter(i => !(i.employeId === currentUser.id && i.date === dateString));
        return [...filtered, newImputation];
      });

      // Reset selected date
      setSelectedDate(null);
    } catch (error) {
      console.error("Failed to save imputation", error);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Imputations</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Saisissez vos heures de travail sur les projets.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <CalendarIcon className="w-5 h-5 mr-2 text-orange-500" />
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <div className="flex space-x-2">
              <button 
                onClick={handlePrevMonth}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={handleNextMonth}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: startingDay }).map((_, index) => (
              <div key={`empty-${index}`} className="h-24 rounded-lg bg-gray-50/50 dark:bg-gray-900/20 border border-transparent"></div>
            ))}
            
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
              const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === currentDate.getMonth();
              const isToday = new Date().getDate() === day && new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear();
              const isOffDay = isWeekendOrHoliday(date);
              
              const imputation = getImputationForDate(date);
              
              return (
                <div 
                  key={day} 
                  onClick={() => handleDateClick(day)}
                  className={`
                    h-24 p-2 rounded-lg border flex flex-col
                    ${isSelected 
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 shadow-sm ring-1 ring-orange-500 cursor-pointer transition-all' 
                        : isOffDay
                          ? 'bg-gray-100 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700 cursor-pointer transition-all opacity-80'
                          : 'border-gray-100 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700 hover:bg-gray-50 dark:hover:bg-gray-750/50 cursor-pointer transition-all'}
                  `}
                >
                  <div className="flex justify-between items-start">
                    <span className={`text-sm font-medium ${
                        isOffDay ? 'text-gray-400 dark:text-gray-500' :
                        isToday ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-400 px-2 py-0.5 rounded-full' : 'text-gray-700 dark:text-gray-300'
                      }`}>
                      {day}
                    </span>
                    {imputation && (
                      <span className={`w-2 h-2 rounded-full ${
                        imputation.statut === 'VALIDEE' ? 'bg-green-500' :
                        imputation.statut === 'REJETEE' ? 'bg-red-500' :
                        'bg-orange-500'
                      }`}></span>
                    )}
                  </div>
                  
                  {imputation && (
                    <div className="mt-auto flex flex-col gap-1">
                      <div className="text-xs font-medium text-gray-900 dark:text-white truncate">
                        {userProjects.find(p => p.id === imputation.projetId)?.nomProjet || 'Projet'}
                      </div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-400">
                        {imputation.charge}h • {imputation.statut.replace('_', ' ')}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 sticky top-24">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Saisie d'imputation
            </h3>
            
            {selectedDate ? (
              <form onSubmit={handleSaveImputation} className="space-y-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/50 mb-4">
                  <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
                    Date : {selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Projet
                  </label>
                  <select 
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm dark:text-white"
                  >
                    <option value="" disabled>Sélectionner un projet</option>
                    {userProjects.map(p => (
                      <option key={p.id} value={p.id}>{p.nomProjet}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nom de l'imputation (ex: Tâche spécifique)
                  </label>
                  <input 
                    type="text" 
                    value={imputationNom}
                    onChange={(e) => setImputationNom(e.target.value)}
                    required
                    placeholder="Développement feature X"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Charge (Heures)
                  </label>
                  <input 
                    type="number" 
                    min="0.5" 
                    max="24"
                    step="0.5"
                    value={charge}
                    onChange={(e) => setCharge(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Lieu de travail
                  </label>
                  <select 
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm dark:text-white"
                    defaultValue="Front Office"
                  >
                    <option value="Front Office">Front Office</option>
                    <option value="Back Office">Back Office</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button 
                    type="submit"
                    className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Enregistrer l'imputation
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-10 flex flex-col items-center justify-center h-[300px] border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                <CalendarIcon className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-[200px]">
                  Sélectionnez un jour dans le calendrier pour saisir ou modifier une imputation.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

