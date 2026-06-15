import {
  createBrowserRouter,
  RouterProvider,
  Navigate
} from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { LoadingOverlayProvider } from "./context/LoadingOverlayContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import HomePage from "./pages/HomePage";
import ListingsPage from "./pages/ListingsPage";
import NewListingPage from "./pages/NewListingPage";
import MyListingsPage from "./pages/MyListingsPage";
import EditListingPage from "./pages/EditListingPage";
import ListingDetailPage from "./pages/ListingDetailPage";
import AdminListingsPage from "./pages/AdminListingsPage";
import ResidentsPage from "./pages/admin/ResidentsPage";
import AuthPage from "./pages/AuthPage";
import SetPasswordPage from "./pages/SetPasswordPage";
import RequestAccessPage from "./pages/RequestAccessPage";
import PendingApprovalPage from "./pages/PendingApprovalPage";
import MyAccountPage from "./pages/MyAccountPage.tsx";
import AccessNotApprovedPage from "./pages/AccessNotApprovedPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: "anuncios",
        element: (
          <ProtectedRoute>
            <ListingsPage />
          </ProtectedRoute>
        )
      },
      {
        path: "anuncios/:id",
        element: (
          <ProtectedRoute>
            <ListingDetailPage />
          </ProtectedRoute>
        )
      },
      {
        path: "publicar",
        element: (
          <ProtectedRoute>
            <NewListingPage />
          </ProtectedRoute>
        )
      },
      {
        path: "meus-anuncios",
        element: (
          <ProtectedRoute>
            <MyListingsPage />
          </ProtectedRoute>
        )
      },
      {
        path: "minha-conta",
        element: (
          <ProtectedRoute>
            <MyAccountPage />
          </ProtectedRoute>
        )
      },
      {
        path: "perfil",
        element: <Navigate to="/minha-conta" replace />
      },
      {
        path: "editar/:id",
        element: (
          <ProtectedRoute>
            <EditListingPage />
          </ProtectedRoute>
        )
      },
      { path: "entrar", element: <AuthPage mode="login" /> },
      { path: "definir-senha", element: <SetPasswordPage /> },
      // Cadastro público desabilitado — redireciona para solicitação de acesso
      {
        path: "cadastro",
        element: <Navigate to="/solicitar-acesso" replace />
      },
      { path: "solicitar-acesso", element: <RequestAccessPage /> },
      { path: "aguardando-aprovacao", element: <PendingApprovalPage /> },
      { path: "acesso-nao-aprovado", element: <AccessNotApprovedPage /> },
      {
        path: "admin/anuncios",
        element: (
          <AdminRoute>
            <AdminListingsPage />
          </AdminRoute>
        )
      },
      {
        path: "admin/moradores",
        element: (
          <AdminRoute>
            <ResidentsPage />
          </AdminRoute>
        )
      }
    ]
  }
]);

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LoadingOverlayProvider>
          <ToastProvider>
            <RouterProvider router={router} />
          </ToastProvider>
        </LoadingOverlayProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
