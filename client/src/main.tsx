import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ServicesProvider } from './application/GameContext';
import { LocalPlayerProfile } from './infrastructure/LocalPlayerProfile';
import { SocketGameGateway } from './infrastructure/SocketGameGateway';
import { App } from './ui/App';
import './ui/styles.css';

// Racine de composition du client : on branche les adaptateurs concrets sur les ports.
const profile = new LocalPlayerProfile();
const gateway = new SocketGameGateway(profile.playerId(), import.meta.env.VITE_SERVER_URL);

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <ServicesProvider services={{ gateway, profile }}>
      <App />
    </ServicesProvider>
  </StrictMode>,
);
