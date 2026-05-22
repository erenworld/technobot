import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { AuthProvider } from './lib/auth';
import { HomePage } from './routes/HomePage';
import { ReglementPage } from './routes/ReglementPage';
import { InscriptionPage } from './routes/InscriptionPage';
import { ScoreboardPage } from './routes/ScoreboardPage';
import { LoginPage } from './routes/LoginPage';
import { NotFoundPage } from './routes/NotFoundPage';

import './styles/global.css';

const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/reglement', element: <ReglementPage /> },
  { path: '/inscription', element: <InscriptionPage /> },
  { path: '/scoreboard', element: <ScoreboardPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '*', element: <NotFoundPage /> },
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>,
);
