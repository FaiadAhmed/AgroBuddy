// ─── App.jsx — Root Component ─────────────────────────────────────────────────
// The app is always visible. Auth lives in the Navbar dropdown.
// App just tracks who is logged in and passes handlers down to Navbar.

import React, { useState } from 'react';
import Navbar from './components/Layout/Navbar';
import AnimalProfiles from './components/AnimalProfiles/AnimalProfiles';
import TaskList from './components/TaskList/TaskList';
import Marketplace from './components/Marketplace/Marketplace';
import DosageCalculator from './components/DosageCalculator/DosageCalculator';
import CalendarView from './components/Calendar/CalendarView';
import VetFinder from './components/VetFinder/VetFinder';

const TABS = [
  { id: 'animals',  label: 'Animal Profiles',  component: <AnimalProfiles /> },
  { id: 'tasks',    label: 'Task List',         component: <TaskList /> },
  { id: 'market',   label: 'Marketplace',       component: <Marketplace /> },
  { id: 'dosage',   label: 'Dosage Calculator', component: <DosageCalculator /> },
  { id: 'calendar', label: 'Calendar',          component: <CalendarView /> },
  { id: 'vets',     label: 'Vet Finder',        component: <VetFinder /> },
];

export default function App() {

  // user — logged-in user object or null.
  // On load, restore from localStorage so the session survives a page refresh.
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('agro_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState('animals');

  // Called by Navbar after a successful sign-in or sign-up
  function handleLogin(loggedInUser) {
    setUser(loggedInUser);
  }

  // Called by Navbar when the user clicks Sign Out
  function handleLogout() {
    localStorage.removeItem('agro_token');
    localStorage.removeItem('agro_user');
    setUser(null);
  }

  const currentTab = TABS.find((tab) => tab.id === activeTab);

  return (
    <div className="app-container">
      <Navbar
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />
      <main className="app-content">
        {currentTab.component}
      </main>
    </div>
  );
}
