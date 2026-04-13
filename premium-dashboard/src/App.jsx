import { createBrowserRouter, Router, RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./App.css";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Posts from "./pages/Posts";
import Messages from "./pages/Messages";
import Settings from "./pages/Settings";
import RootLayout from "./components/Root";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./client/client";
import EditPassword from "./pages/EditPassowrd";

function App() {
  const router = createBrowserRouter([
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/",
      element: <ProtectedRoute />,
      children: [
        {
          element: <RootLayout />,
          children: [
            {
              index: true,
              element: <Dashboard />,
            },
            { path: "/users", element: <Users /> },
            { path: "/posts", element: <Posts /> },
            { path: "/messages", element: <Messages /> },
            { path: "/settings", element: <Settings /> },
            { path: "/edit/password", element: <EditPassword /> },
          ],
        },
      ],
    },
  ]);

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" />
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
