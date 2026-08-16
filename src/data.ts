import { Collaborateur, Projet, Client, Affectation, Imputation, Absence } from './types';

const defaultData = {
  collaborateurs: [
    { id: 1, nom: 'Doe', prenom: 'John', email: 'john@example.com', role: 'EMPLOYE', avatar: 'https://ui-avatars.com/api/?name=John+Doe' },
    { id: 2, nom: 'Smith', prenom: 'Jane', email: 'jane@example.com', role: 'MANAGER', avatar: 'https://ui-avatars.com/api/?name=Jane+Smith' },
    { id: 3, nom: 'Viewer', prenom: 'Test', email: 'test@example.com', role: 'SPECTATEUR', avatar: 'https://ui-avatars.com/api/?name=Test+Viewer' },
  ] as Collaborateur[],
  projets: [
    { id: 1, nomProjet: 'Projet A', description: 'Desc A', budget: 10000, status: 'EN_COURS', clientId: 1 },
    { id: 2, nomProjet: 'Projet B', description: 'Desc B', budget: 20000, status: 'TERMINE', clientId: 1 },
  ] as Projet[],
  clients: [
    { id_client: 1, nom_client: 'Client A' }
  ] as Client[],
  affectations: [
    { id: 1, collaborateurId: 1, projetId: 1, dateDebut: '2023-01-01', dateFin: '2023-12-31', office: 'Front Office' }
  ] as Affectation[],
  imputations: [
    { id: 1, employeId: 1, projetId: 1, date: '2023-10-01', charge: 8, statut: 'EN_ATTENTE', nom: 'Dev' }
  ] as Imputation[],
  absences: [
    { id: 1, collaborateurId: 1, dateDebut: '2023-11-01', dateFin: '2023-11-02', motif: 'MALADIE', statut: 'EN_ATTENTE' }
  ] as Absence[],
};

const getStoredData = () => {
  const stored = localStorage.getItem('app_data');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      return defaultData;
    }
  }
  return defaultData;
};

const data = getStoredData();

export const mockCollaborateurs = data.collaborateurs;
export const mockProjets = data.projets;
export const mockClients = data.clients;
export const mockAffectations = data.affectations;
export const mockImputations = data.imputations;
export const mockAbsences = data.absences;

export const persistData = () => {
  localStorage.setItem('app_data', JSON.stringify({
    collaborateurs: mockCollaborateurs,
    projets: mockProjets,
    clients: mockClients,
    affectations: mockAffectations,
    imputations: mockImputations,
    absences: mockAbsences,
  }));
};
