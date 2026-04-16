import { useState, useEffect } from 'react';
import { CHARACTERS } from './data/characters.js';
import LoginPage from './pages/LoginPage.jsx';
import HubPage from './pages/HubPage.jsx';
import BingoPage from './pages/BingoPage.jsx';
import VotingPage from './pages/VotingPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import LeaderboardPage from './pages/LeaderboardPage.jsx';
import FramePage from './pages/FramePage.jsx';
import CharacterPage from './pages/CharacterPage.jsx';
import ConfessionPage from './pages/ConfessionPage.jsx';
import RulesPage from './pages/RulesPage.jsx';

export default function App() {
  const [character, setCharacter] = useState(() => sessionStorage.getItem('mm_character'));
  const [page, setPage] = useState('hub');

  const characterData = CHARACTERS.find(c => c.name === character);
  const isAdmin = characterData?.isAdmin === true;

  useEffect(() => { window.scrollTo(0, 0); }, [page]);

  function handleLogin(name) {
    setCharacter(name);
    setPage('hub');
  }

  function handleLogout() {
    sessionStorage.removeItem('mm_character');
    setCharacter(null);
    setPage('hub');
  }

  if (!character) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (page === 'frame') {
    return <FramePage onBack={() => setPage('hub')} />;
  }

  if (isAdmin) {
    return <AdminPage onLogout={handleLogout} onNavigate={setPage} />;
  }

  if (page === 'bingo') {
    return (
      <BingoPage
        character={character}
        onBack={() => setPage('hub')}
        onComplete={() => setPage('leaderboard')}
      />
    );
  }

  if (page === 'leaderboard') {
    return <LeaderboardPage character={character} onBack={() => setPage('hub')} />;
  }

  if (page === 'voting') {
    return <VotingPage character={character} onBack={() => setPage('hub')} />;
  }

  if (page === 'character') {
    return <CharacterPage character={character} onBack={() => setPage('hub')} />;
  }

  if (page === 'confession') {
    return <ConfessionPage character={character} onBack={() => setPage('hub')} />;
  }

  if (page === 'rules') {
    return <RulesPage onBack={() => setPage('hub')} />;
  }

  return <HubPage character={character} onNavigate={setPage} onLogout={handleLogout} />;
}
