import { Collaborateur, Imputation, Projet, Affectation, Client, Absence } from './types';
import { mockCollaborateurs, mockProjets, mockClients, mockAffectations, mockImputations, mockAbsences, persistData } from './data';

const API_BASE_URL = '/api';

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  return response.json();
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

// Helper to use mock data for 100% frontend
const useMocksFallback = async <T>(apiCall: () => Promise<T>, mockData: T | (() => T)): Promise<T> => {
  let result;
  if (typeof mockData === 'function') {
    result = (mockData as Function)();
    // Save to localStorage after any mutation
    persistData();
  } else {
    result = mockData;
  }
  
  // Simulate network delay
  return new Promise(resolve => setTimeout(() => resolve(result), 200));
};

export const backendApi = {
  // Collaborateurs
  getAllCollaborateurs: () =>
    useMocksFallback(
      () => fetch(`${API_BASE_URL}/collaborateurs`, { headers: getAuthHeaders() }).then(handleResponse),
      mockCollaborateurs
    ),

  getProfil: (id: number) => 
    useMocksFallback(
      () => fetch(`${API_BASE_URL}/collaborateurs/${id}`, { headers: getAuthHeaders() }).then(handleResponse),
      mockCollaborateurs.find(c => c.id === id) as Collaborateur
    ),
  
  getCollaborateurByEmail: (email: string) =>
    useMocksFallback(
      () => fetch(`${API_BASE_URL}/collaborateurs/email/${email}`, { headers: getAuthHeaders() }).then(handleResponse),
      mockCollaborateurs.find(c => c.email === email) as Collaborateur
    ),
  
  createEmploye: (data: Partial<Collaborateur>) => 
    useMocksFallback(
      () => fetch(`${API_BASE_URL}/collaborateurs/employe`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      }).then(handleResponse),
      () => {
        const newUser = { ...data, id: Math.floor(Math.random() * 10000) } as Collaborateur;
        mockCollaborateurs.push(newUser);
        return newUser;
      }
    ),

  createManager: (data: Partial<Collaborateur>) => 
    useMocksFallback(
      () => fetch(`${API_BASE_URL}/collaborateurs/manager`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      }).then(handleResponse),
      () => {
        const newUser = { ...data, id: Math.floor(Math.random() * 10000) } as Collaborateur;
        mockCollaborateurs.push(newUser);
        return newUser;
      }
    ),

  updateProfile: (id: number, data: any) =>
    useMocksFallback(
      () => fetch(`${API_BASE_URL}/collaborateurs/${id}/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      }).then(handleResponse),
      { ...mockCollaborateurs.find(c => c.id === id), ...data } as Collaborateur
    ),

  deleteCollaborateur: (id: number) =>
    useMocksFallback(
      () => fetch(`${API_BASE_URL}/collaborateurs/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      }).then(handleResponse),
      undefined
    ),

  // Imputations
  getAllImputations: () =>
    useMocksFallback(
      () => fetch(`${API_BASE_URL}/imputations`, { headers: getAuthHeaders() }).then(handleResponse),
      mockImputations
    ),

  getImputationsByEmploye: (employeId: number) =>
    useMocksFallback(
      () => fetch(`${API_BASE_URL}/imputations/employe/${employeId}`, { headers: getAuthHeaders() }).then(handleResponse),
      mockImputations.filter(i => i.employeId === employeId)
    ),

  getImputationsEnAttente: (managerId: number) =>
    useMocksFallback(
      () => fetch(`${API_BASE_URL}/imputations/en-attente?managerId=${managerId}`, { headers: getAuthHeaders() }).then(handleResponse),
      mockImputations.filter(i => i.statut === 'EN_ATTENTE')
    ),

  createImputation: (data: Partial<Imputation>) =>
    useMocksFallback(
      () => fetch(`${API_BASE_URL}/imputations`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      }).then(handleResponse),
      () => {
        const newImp = { ...data, id: Math.floor(Math.random() * 10000), statut: 'EN_ATTENTE' } as Imputation;
        mockImputations.push(newImp);
        return newImp;
      }
    ),

  validerImputation: (id: number, managerId: number) =>
    useMocksFallback(
      () => fetch(`${API_BASE_URL}/imputations/${id}/valider?managerId=${managerId}`, {
        method: 'POST',
        headers: getAuthHeaders()
      }).then(handleResponse),
      () => {
        const imp = mockImputations.find(i => i.id === id);
        if (imp) imp.statut = 'VALIDEE';
        return imp as Imputation;
      }
    ),

  rejeterImputation: (id: number, managerId: number) =>
    useMocksFallback(
      () => fetch(`${API_BASE_URL}/imputations/${id}/rejeter?managerId=${managerId}`, {
        method: 'POST',
        headers: getAuthHeaders()
      }).then(handleResponse),
      () => {
        const imp = mockImputations.find(i => i.id === id);
        if (imp) imp.statut = 'REJETEE';
        return imp as Imputation;
      }
    ),

  // Projets
  getAllProjets: () =>
    useMocksFallback(
      () => fetch(`${API_BASE_URL}/projets`, { headers: getAuthHeaders() }).then(handleResponse),
      mockProjets
    ),

  createProjet: (data: Partial<Projet>) =>
    useMocksFallback(
      () => fetch(`${API_BASE_URL}/projets`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      }).then(handleResponse),
      () => {
        const newProj = { ...data, id: Math.floor(Math.random() * 10000) } as Projet;
        mockProjets.push(newProj);
        return newProj;
      }
    ),

  // Clients
  getAllClients: () =>
    useMocksFallback(
      () => fetch(`${API_BASE_URL}/clients`, { headers: getAuthHeaders() }).then(handleResponse),
      mockClients
    ),

  createClient: (data: Partial<Client>) =>
    useMocksFallback(
      () => fetch(`${API_BASE_URL}/clients`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      }).then(handleResponse),
      () => {
        const newClient = { ...data, id_client: Math.floor(Math.random() * 10000) } as Client;
        mockClients.push(newClient);
        return newClient;
      }
    ),
  
  // Affectations
  getAffectationsByCollaborateur: (collabId: number) =>
    useMocksFallback(
      () => fetch(`${API_BASE_URL}/affectations/collaborateur/${collabId}`, { headers: getAuthHeaders() }).then(handleResponse),
      mockAffectations.filter(a => a.collaborateurId === collabId)
    ),

  getAllAffectations: () =>
    useMocksFallback(
      () => fetch(`${API_BASE_URL}/affectations`, { headers: getAuthHeaders() }).then(handleResponse),
      mockAffectations
    ),

  // Absences
  getAllAbsencesEnAttente: () =>
    useMocksFallback(
      () => fetch(`${API_BASE_URL}/absences/en-attente`, { headers: getAuthHeaders() }).then(handleResponse),
      mockAbsences.filter(a => a.statut === 'EN_ATTENTE')
    ),

  getAbsencesByEmploye: (employeId: number) =>
    useMocksFallback(
      () => fetch(`${API_BASE_URL}/absences/employe/${employeId}`, { headers: getAuthHeaders() }).then(handleResponse),
      mockAbsences.filter(a => a.collaborateurId === employeId)
    ),

  createAbsence: (employeId: number, data: Partial<Absence>) =>
    useMocksFallback(
      () => fetch(`${API_BASE_URL}/absences/employe/${employeId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      }).then(handleResponse),
      () => {
        const newAbs = { ...data, id: Math.floor(Math.random() * 10000), collaborateurId: employeId, statut: 'EN_ATTENTE' } as Absence;
        mockAbsences.push(newAbs);
        return newAbs;
      }
    ),

  validerAbsence: (id: number, managerId: number) =>
    useMocksFallback(
      () => fetch(`${API_BASE_URL}/absences/${id}/valider?managerId=${managerId}`, {
        method: 'POST',
        headers: getAuthHeaders()
      }).then(handleResponse),
      () => {
        const abs = mockAbsences.find(a => a.id === id);
        if (abs) abs.statut = 'APPROUVEE';
        return abs as Absence;
      }
    ),

  rejeterAbsence: (id: number, managerId: number, motif: string) =>
    useMocksFallback(
      () => fetch(`${API_BASE_URL}/absences/${id}/rejeter?managerId=${managerId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ motif })
      }).then(handleResponse),
      () => {
        const abs = mockAbsences.find(a => a.id === id);
        if (abs) abs.statut = 'REFUSEE';
        return abs as Absence;
      }
    )
};

