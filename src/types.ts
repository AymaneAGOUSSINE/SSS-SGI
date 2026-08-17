export interface Client {
  id_client: number;
  nom_client: string;
}

export interface Projet {
  id: number;
  nomProjet: string;
  description: string;
  status: 'EN_COURS' | 'TERMINE' | 'EN_ATTENTE';
  clientId: number;
  budget: number;
}

export interface Collaborateur {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: 'EMPLOYE' | 'MANAGER' | 'SPECTATEUR';
  avatar?: string;
}

export interface Affectation {
  id: number;
  projetId: number;
  collaborateurId: number;
  dateDebut: string;
  dateFin: string;
  office: 'Front Office' | 'Back Office';
}

export interface Imputation {
  id: number;
  nom: string;
  statut: 'EN_ATTENTE' | 'VALIDEE' | 'REJETEE';
  projetId: number;
  employeId: number;
  date: string; // The date selected in the calendar
  charge: number; // The hours/days spent
  fichier?: string; // Optional attached file
}

export interface Absence {
  id: number;
  collaborateurId: number;
  dateDebut: string;
  dateFin: string;
  motif: string;
  statut: 'EN_ATTENTE' | 'APPROUVEE' | 'REFUSEE';
}
