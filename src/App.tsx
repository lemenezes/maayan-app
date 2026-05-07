import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import ListingsPage from './pages/ListingsPage'
import NewListingPage from './pages/NewListingPage'
import MyListingsPage from './pages/MyListingsPage'
import EditListingPage from './pages/EditListingPage'
import AuthPage from './pages/AuthPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'anuncios', element: <ListingsPage /> },
      {
        path: 'publicar',
        element: (
          <ProtectedRoute>
            <NewListingPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'meus-anuncios',
        element: (
          <ProtectedRoute>
            <MyListingsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'editar/:id',
        element: (
          <ProtectedRoute>
            <EditListingPage />
          </ProtectedRoute>
        ),
      },
      { path: 'entrar', element: <AuthPage mode="login" /> },
      { path: 'cadastro', element: <AuthPage mode="register" /> },
    ],
  },
])

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
