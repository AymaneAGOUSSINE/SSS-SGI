import React, { useState, useEffect } from 'react';
import { Mail, Lock, ArrowRight, UserCircle } from 'lucide-react';
import { Collaborateur } from '../types';
import { backendApi } from '../api';

interface LoginViewProps {
  onLogin: (user: Collaborateur) => void;
}

export default function LoginView({ onLogin }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [testAccounts, setTestAccounts] = useState<Collaborateur[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    // Load test accounts from the real backend
    backendApi.getAllCollaborateurs()
      .then(data => {
        // Take a few users to show as quick login options
        setTestAccounts(data.slice(0, 3));
      })
      .catch(err => {
        console.error('Failed to load users from backend', err);
        setLoadError("Impossible de charger les comptes depuis le backend. Assurez-vous que l'API tourne sur http://localhost:8080/api.");
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoadError(null);
    
    try {
      if (isSignUp) {
        const data = {
          nom: nom,
          prenom: prenom,
          email: email,
          password: password, 
          role: 'SPECTATEUR' as const,
          avatar: `https://ui-avatars.com/api/?name=${prenom}+${nom}&background=random`
        };
        
        let newUser: Collaborateur = await backendApi.createEmploye(data);
        onLogin(newUser);
      } else {
        const userProfile = await backendApi.getCollaborateurByEmail(email);
        if (userProfile) {
          onLogin(userProfile);
        } else {
          setLoadError("Utilisateur introuvable");
        }
      }
    } catch (error) {
      console.error("Erreur d'authentification:", error);
      setLoadError("Erreur d'authentification. Vérifiez votre backend.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <div className="flex items-center">
            <svg viewBox="0 0 100 80" className="w-16 h-auto text-orange-500 mr-4 flex-shrink-0">
              <rect x="5" y="5" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="4" />
              <rect x="25" y="35" width="35" height="35" fill="none" stroke="currentColor" strokeWidth="4" />
              <rect x="50" y="22" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="4" />
            </svg>
            <div className="w-px h-16 bg-gray-300 dark:bg-gray-700 mr-4"></div>
            <div className="flex flex-col justify-center">
              <span className="text-lg font-medium text-gray-900 dark:text-white leading-tight tracking-wide">Smart</span>
              <span className="text-lg font-medium text-gray-900 dark:text-white leading-tight tracking-wide">Square</span>
              <span className="text-lg font-medium text-gray-900 dark:text-white leading-tight tracking-wide">Services</span>
            </div>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Espace Collaborateur
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Connectez-vous pour accéder à votre tableau de bord SGI
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-xl sm:px-10 border border-gray-100 dark:border-gray-700">
          {loadError && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-sm rounded-lg">
              {loadError}
            </div>
          )}
          
          {testAccounts.length > 0 && (
            <div className="mb-6 space-y-3">
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">Comptes de test rapides :</p>
              {testAccounts.map(c => (
                <button
                  key={c.id}
                  onClick={() => setEmail(c.email)}
                  className="w-full flex items-center justify-between px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  type="button"
                >
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{c.prenom} {c.nom}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{c.email}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-1 rounded-md font-medium ${
                    c.role === 'MANAGER' 
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' 
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                  }`}>
                    {c.role}
                  </span>
                </button>
              ))}
            </div>
          )}

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Ou {isSignUp ? 'créez un compte' : 'connectez-vous'}</span>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {isSignUp && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="prenom" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Prénom
                    </label>
                    <input
                      id="prenom"
                      type="text"
                      required
                      value={prenom}
                      onChange={(e) => setPrenom(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm transition-colors"
                      placeholder="Jean"
                    />
                  </div>
                  <div>
                    <label htmlFor="nom" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Nom
                    </label>
                    <input
                      id="nom"
                      type="text"
                      required
                      value={nom}
                      onChange={(e) => setNom(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm transition-colors"
                      placeholder="Dupont"
                    />
                  </div>
                </div>
              </>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Adresse Email
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm transition-colors"
                  placeholder="collaborateur@3s.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Mot de passe
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Se souvenir de moi
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-orange-600 hover:text-orange-500 dark:text-orange-400 dark:hover:text-orange-300">
                  Mot de passe oublié ?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connexion en cours...
                  </span>
                ) : (
                  <span className="flex items-center">
                    {isSignUp ? "S'inscrire" : "Se connecter"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                )}
              </button>
            </div>

            <div className="text-sm text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="font-medium text-orange-600 hover:text-orange-500 dark:text-orange-400 dark:hover:text-orange-300"
              >
                {isSignUp 
                  ? "Vous avez déjà un compte ? Connectez-vous" 
                  : "Pas encore de compte ? S'inscrire"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
