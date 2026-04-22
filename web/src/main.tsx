import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { HomePage } from './routes/HomePage';
import { InscriptionPage } from './routes/InscriptionPage';
import { ReglementPage } from './routes/ReglementPage';
import { ScoreboardPage } from './routes/ScoreboardPage';
import './global.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/inscription',
    element: <InscriptionPage />,
  },
  {
    path: '/reglement',
    element: <ReglementPage />,
  },
  {
    path: '/scoreboard',
    element: <ScoreboardPage />,
  }
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
