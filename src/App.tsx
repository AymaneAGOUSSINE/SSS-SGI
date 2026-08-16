/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  Building2, 
  Users, 
  Menu,
  Sun,
  Moon,
  LogOut,
  Bell,
  Search,
  Calendar as CalendarIcon,
  CalendarX,
  X,
  Upload
} from 'lucide-react';
import { useDarkMode } from './hooks/useDarkMode';

import DashboardOverview from './pages/DashboardOverview';
import ProjectsView from './pages/ProjectsView';
import ClientsView from './pages/ClientsView';
import CollaboratorsView from './pages/CollaboratorsView';
import ImputationsView from './pages/ImputationsView';
import AbsencesView from './pages/AbsencesView';
import LoginView from './pages/LoginView';
import { Collaborateur } from './types';

type ViewState = 'dashboard' | 'projects' | 'clients' | 'collaborators' | 'imputations' | 'absences';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<Collaborateur | null>(null);
  const [activeView, setActiveView] = useState<ViewState>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const { isDark, setIsDark } = useDarkMode();

  const isSpectateur = currentUser?.role === 'SPECTATEUR';

  const navigation = [
    { name: 'Tableau de Bord', view: 'dashboard', icon: LayoutDashboard },
    ...(!isSpectateur ? [
      { name: 'Projets', view: 'projects', icon: Briefcase },
      { name: 'Imputations', view: 'imputations', icon: CalendarIcon },
      { name: 'Absences', view: 'absences', icon: CalendarX },
    ] : []),
    ...(currentUser?.role === 'MANAGER' ? [
      { name: 'Clients', view: 'clients', icon: Building2 },
      { name: 'Collaborateurs', view: 'collaborators', icon: Users },
    ] : [])
  ] as const;

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <DashboardOverview currentUser={currentUser!} />;
      case 'projects': return <ProjectsView currentUser={currentUser!} />;
      case 'imputations': return <ImputationsView currentUser={currentUser!} />;
      case 'absences': return <AbsencesView currentUser={currentUser!} />;
      case 'clients': return <ClientsView />;
      case 'collaborators': return <CollaboratorsView />;
      default: return <DashboardOverview currentUser={currentUser!} />;
    }
  };

  if (!isAuthenticated || !currentUser) {
    return <LoginView onLogin={(user) => {
      setCurrentUser(user);
      setIsAuthenticated(true);
    }} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:block ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col">
          <div className="h-20 flex items-center px-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center">
              <svg viewBox="0 0 100 80" className="w-10 h-auto text-orange-500 mr-3 flex-shrink-0">
                <rect x="5" y="5" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="4" />
                <rect x="25" y="35" width="35" height="35" fill="none" stroke="currentColor" strokeWidth="4" />
                <rect x="50" y="22" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="4" />
              </svg>
              <div className="w-px h-10 bg-gray-300 dark:bg-gray-700 mr-3"></div>
              <div className="flex flex-col justify-center">
                <span className="text-[12px] font-medium text-gray-900 dark:text-white leading-tight tracking-wide">Smart</span>
                <span className="text-[12px] font-medium text-gray-900 dark:text-white leading-tight tracking-wide">Square</span>
                <span className="text-[12px] font-medium text-gray-900 dark:text-white leading-tight tracking-wide">Services</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto py-4">
            <div className="px-4 space-y-1">
              <p className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Menu Principal</p>
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.view;
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      setActiveView(item.view);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-500' 
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mr-3 flex-shrink-0 ${isActive ? 'text-orange-600 dark:text-orange-500' : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-500'}`} />
                    {item.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <button 
              onClick={() => {
                setIsAuthenticated(false);
                setCurrentUser(null);
              }}
              className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3 text-gray-400" />
              Déconnexion
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30 transition-colors">
          <div className="flex items-center flex-1">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 mr-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex max-w-md w-full relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Rechercher..." 
                className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-transparent rounded-full focus:bg-white dark:focus:bg-gray-900 focus:border-gray-300 dark:focus:border-gray-700 focus:outline-none focus:ring-0 transition-colors dark:text-white"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            <button className="p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 rounded-full transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full border-2 border-white dark:border-gray-900"></span>
            </button>

            <button 
              onClick={() => setIsProfileModalOpen(true)}
              className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center border border-orange-200 dark:border-orange-800 overflow-hidden focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            >
              {currentUser?.avatar ? (
                <img src={currentUser.avatar} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <span className="text-sm font-medium text-orange-600 dark:text-orange-400 uppercase">
                  {currentUser?.email.substring(0, 2)}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            {renderView()}
          </div>
        </div>
      </main>

      {/* Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-sm w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsProfileModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
              Profil Collaborateur
            </h3>
            
            <div className="flex flex-col items-center">
              <div className="relative group mb-6">
                <div className="h-24 w-24 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center border-4 border-orange-200 dark:border-orange-800 overflow-hidden shadow-sm">
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-3xl font-semibold text-orange-600 dark:text-orange-400 uppercase">
                      {currentUser.email.substring(0, 2)}
                    </span>
                  )}
                </div>
                <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer">
                  <Upload className="w-6 h-6 mb-1" />
                  <span className="text-xs font-medium">Modifier</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setCurrentUser({
                            ...currentUser,
                            avatar: reader.result as string
                          });
                        };
                        reader.readAsDataURL(file);
                      }
                    }} 
                  />
                </label>
              </div>
              
              <div className="text-center w-full space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Nom</label>
                  <div className="text-base font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-100 dark:border-gray-700">
                    {currentUser.prenom} {currentUser.nom}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Email</label>
                  <div className="text-base font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-100 dark:border-gray-700">
                    {currentUser.email}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Rôle</label>
                  <div className="text-base font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 px-4 py-2 rounded-lg border border-orange-100 dark:border-orange-800/50">
                    {currentUser.role}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end">
              <button 
                onClick={() => setIsProfileModalOpen(false)}
                className="px-5 py-2.5 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 w-full"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

