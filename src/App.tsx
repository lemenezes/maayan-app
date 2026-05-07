import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import ListingsPage from './pages/ListingsPage'
import NewListingPage from './pages/NewListingPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'anuncios', element: <ListingsPage /> },
      { path: 'publicar', element: <NewListingPage /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
