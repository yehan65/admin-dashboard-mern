import { Menu, Moon, Search, Sun, Bell, CircleUserRound } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/Auth";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export default function Navbar({ toggleCollapse, toggleSidebar }) {
  const [dark, setDark] = useState(false);
  const [open, setOpen] = useState(false);
  const [openNotification, setOpenNotification] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    const handleClick = () => setOpenNotification(false);
    window.addEventListener("click", handleClick);

    return () => window.removeEventListener("click", handleClick);
  }, []);

  const cleanToken =
    typeof user === "string" ? user.replace(/^"|"$/g, "") : user;

  const { data: adminData } = useQuery({
    queryKey: ["admin", "me", cleanToken],
    queryFn: async () => {
      const response = await axios.get("http://localhost:8000/admin/getAdmin", {
        headers: {
          "x-auth-token": cleanToken,
        },
      });
      return response.data.user;
    },
  });

  function menuHandle() {
    if (window.innerWidth < 768) {
      toggleSidebar();
    } else {
      toggleCollapse();
    }
  }

  const messages = [
    {
      id: 1,
      name: "Dwayne Johnson",
      email: "therock@gmail.com",
      message: "Can you activate my account?",
      date: "1d ago",
      read: false,
    },
    {
      id: 2,
      name: "SERVER",
      email: "server care",
      message: "New user connected.",
      date: "5min ago",
      read: true,
    },
  ];

  return (
    <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 shadow">
      {/* LEFT */}
      <div className="flex items-center gap-4">
        <button onClick={menuHandle}>
          <Menu />
        </button>

        {/* <div className="hidden md:flex items-center bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent outline-none ml-2 text-sm text-gray-700 dark:text-white"
          />
        </div> */}
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setOpenNotification(!openNotification)}
            className="p-2 md:p-1"
          >
            <Bell />

            <span className="absolute -top-2 -right-2 w-auto h-auto bg-red-500 rounded-full text-white text-xs px-1.5">
              1
            </span>
          </button>
          {openNotification && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 shadow-lg rounded-lg z-50">
              <div className="p-3 border-b dark:border-gray-700 font-semibold">
                Notifications
              </div>

              {/* <div className="max-h-64 overflow-y-auto">
                <div className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                  New user registered
                </div>

                <div className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                  New order received
                </div>

                <div className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                  Server deployed successfully
                </div>

                <div className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                  New message from client
                </div>
              </div> */}
              <div className="max-h-60 overflow-y-auto">
                {messages.slice(0, 2).map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3 border-b dark:border-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${
                      !msg.read ? "bg-blue-50 dark:bg-gray-800" : ""
                    }`}
                  >
                    <p className="text-sm font-medium">{msg.name}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {msg.message}
                    </p>
                  </div>
                ))}
              </div>

              <div
                className="p-2 text-center text-sm text-indigo-600 cursor-pointer"
                onClick={() => navigate("/messages")}
              >
                View all
              </div>
            </div>
          )}
        </div>

        {/* Dark mode */}
        {/* <button onClick={() => setDark(!dark)}>
          {dark ? <Sun /> : <Moon />}
        </button> */}

        {/* Profile */}
        <div className="relative">
          {adminData?.avatar ? (
            <img
              src={adminData?.avatar}
              alt="avatar"
              className="w-9 h-9 rounded-full cursor-pointer"
              onClick={() => setOpen(!open)}
            />
          ) : (
            <CircleUserRound size={30} />
          )}
          {open && (
            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 shadow rounded">
              <div
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                onClick={() => navigate("/settings")}
              >
                Settings
              </div>
              <div
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                onClick={() => {
                  logout();
                  toast.success("Logout successfull!");
                  window.location.href = "/login";
                }}
              >
                Logout
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
