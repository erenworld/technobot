import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { ApiPage } from './routes/ApiPage';
import { LoginPage } from './routes/LoginPage';
import { NotFoundPage } from './routes/NotFoundPage';

/**
 * Initializes a browser-based router using the HTML5 History API.
 *
 * @param routes - An array of route objects defining the application navigation.
 * This router enables client-side navigation without full page reloads.
 * @returns A router instance to be provided to <RouterProvider />
 */
const router = createBrowserRouter([
  {
    path: '/',
    element: <ApiPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
