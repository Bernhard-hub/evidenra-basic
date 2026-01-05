import React from 'react';
import { createRoot } from 'react-dom/client';
import EvidenraApp from './App';
import { GenesisSyncProvider } from './providers/GenesisSyncProvider';
import { LicenseGuard } from '../components/LicenseGuard';
import './styles.css';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root container not found');
}

const root = createRoot(container);
root.render(
  <GenesisSyncProvider>
    <LicenseGuard productName="EVIDENRA Basic">
      <EvidenraApp />
    </LicenseGuard>
  </GenesisSyncProvider>
);
