import { createContext, useState } from "react";

export const AuthContext = createContext({
  user: null,
  login: () => {},
  logout: () => {},
});
export default function AuthContextProvider({ children }) {
  const [user, setUser] = useState(() => {
    return localStorage.getItem("user") || null;
  });

  const [loading, setLoading] = useState(false);

  function login(userData) {
    setLoading(true);
    try {
      setUser(userData);
      localStorage.setItem("user", userData);
    } finally {
      console.log("Login success ✅");
      setLoading(false);
    }
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("user");
  }

  return (
    <AuthContext value={{ user, setUser, loading, login, logout }}>
      {children}
    </AuthContext>
  );
}
