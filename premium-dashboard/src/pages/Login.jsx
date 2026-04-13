import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useContext } from "react";
import { AuthContext } from "../context/Auth";
import { useEffect } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  const { mutate, isError, error } = useMutation({
    mutationFn: async () => {
      const response = await axios.post(
        "http://localhost:8000/admin/auth/admin",
        {
          email,
          password,
        },
      );
      console.log(response.data.token);
      return response.data.token;
    },
    onSettled: (res) => {
      login(res);
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 1000);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message);
    },
    onSuccess: () => {
      toast.success("Login success");
    },
  });

  function handleLogin(e) {
    e.preventDefault();

    mutate();

    // if (email && password) {
    //   localStorage.setItem("auth", "true");
    //   toast.success("Login sucessfull");
    //   navigate("/");
    // }
  }

  if (isError) {
    return <p>{error.response?.data?.message}</p>;
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <form
          onSubmit={handleLogin}
          className="bg-white dark:bg-gray-800 p-8 rounded shadow w-full max-w-sm"
        >
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            Admin Login
          </h2>
          <p className="text-center pb-10">
            Just use "adminlogin@gmail.com" for the email and "12345" for the
            password
          </p>
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 mb-4 border rounded dark:bg-gray-700 dark:border-gray-600"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 mb-4 border rounded dark:bg-gray-700 dark:border-gray-600"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white p-3 rounded hover:bg-indigo-700"
          >
            Login
          </button>
        </form>
      </div>
    </>
  );
}
