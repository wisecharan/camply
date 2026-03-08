import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Bell } from "lucide-react";
import api from "../../services/api";

const Navbar = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="w-full bg-white z-50">
      <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">

        {/* Left - Brand Name Only */}
        <div className="flex items-center w-1/4">
          <Link to="/" className="text-xl font-bold tracking-tight text-gray-900">
            Camply<span className="text-indigo-600">.</span>
          </Link>
        </div>

        {/* Center - Links */}
        <div className="hidden md:flex items-center justify-center gap-8 flex-1">
          <Link to="/" className="text-sm font-medium text-gray-900 hover:text-indigo-600 transition-colors">Home</Link>
          <Link to="/companies" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Companies</Link>
          <Link to="/students" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Students</Link>
          <Link to="/pricing" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Pricing</Link>
        </div>

        {/* Right - Auth / Actions */}
        <div className="flex items-center justify-end gap-3 w-1/4">
          {user ? (
            <>
              {/* Notifications */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-500 hover:text-gray-900 transition"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-black rounded-full border-2 border-white"></span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden z-50">
                    <div className="px-5 py-3 text-sm font-semibold border-b border-gray-100">
                      Notifications
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="px-4 py-8 text-sm text-gray-500 text-center">
                          No notifications yet
                        </p>
                      ) : (
                        notifications.map((n) => (
                          <div key={n.id} className="px-5 py-4 text-sm hover:bg-gray-50 border-b border-gray-50 transition-colors">
                            <p className="text-gray-800">{n.message}</p>
                            <p className="text-xs text-gray-400 mt-1.5">
                              {new Date(n.created_at).toLocaleString()}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button onClick={handleLogout} className="px-5 py-2.5 border border-gray-200 text-gray-900 text-sm font-medium rounded-full hover:bg-gray-50 transition-colors">
                Sign out
              </button>
              <Link to={`/${role}/dashboard`} className="px-5 py-2.5 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-900 transition-colors shadow-md">
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <button
                onClick={() => window.open("/login", "_blank")}
                className="px-6 py-2.5 border border-gray-200 text-gray-900 text-sm font-medium rounded-full hover:bg-gray-50 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => window.open("/register", "_blank")}
                className="px-6 py-2.5 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-900 transition-colors shadow-md"
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;