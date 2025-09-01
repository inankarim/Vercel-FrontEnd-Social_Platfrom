// src/components/LeftSidebar.jsx
import { Link, NavLink } from "react-router-dom";
import { MessageSquare, Settings, UserRoundPen, Home } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore.js";

export default function LeftSidebar() {
  const { authUser } = useAuthStore();

  const name = authUser?.fullName || "User";
  const email = (authUser?.email ?? "").trim();
  const uni = (authUser?.universityName ?? "").trim();
  const job = (authUser?.Job ?? "").trim();
  const avatar = authUser?.profilePic || "/avatar.png";

  const navItem = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg transition ${
      isActive ? "bg-base-200 font-semibold" : "hover:bg-base-200"
    }`;

  return (
    <aside className="w-full">
      {/* adjust top if navbar height differs */}
      <div className="sticky top-[64px] h-[calc(100vh-64px)]">
        <div className="bg-base-100 border rounded-2xl shadow-sm h-full flex flex-col overflow-hidden">
          {/* Profile */}
          <div className="p-5 border-b border-base-300">
            <div className="flex items-center gap-4">
              <div className="avatar">
                <div className="w-20 rounded-full ring ring-primary/15">
                  <img
                    src={avatar}
                    alt={name}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      const n = encodeURIComponent(name);
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${n}&background=random`;
                    }}
                  />
                </div>
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-[1.05rem] truncate">{name}</div>
                <div className="text-xs opacity-70 truncate">{email || "—"}</div>
              </div>
            </div>

            <div className="mt-4 text-[0.95rem] space-y-1.5">
              <div><span className="opacity-60">University: </span><span>{uni || "—"}</span></div>
              <div><span className="opacity-60">Job: </span><span>{job || "—"}</span></div>
            </div>

            <Link to="/chathome" className="btn btn-primary btn-md w-full mt-5">
              <MessageSquare className="w-4 h-4" />
              Chat
            </Link>
          </div>

          {/* Scrollable nav */}
          <div className="p-3 overflow-y-auto">
            <nav>
              <ul className="menu">
                <li>
                  <NavLink to="/posts" className={navItem}>
                    <Home className="w-4 h-4" />
                    Feed
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/chathome" className={navItem}>
                    <MessageSquare className="w-4 h-4" />
                    Chats
                  </NavLink>
                </li>
              </ul>
            </nav>
          </div>

          {/* Footer */}
          <div className="mt-auto p-3 border-t border-base-300">
            <Link to="/profile" className="btn btn-ghost justify-start w-full">
              <UserRoundPen className="w-4 h-4" />
              Update Profile
            </Link>
            <Link to="/settings" className="btn btn-ghost justify-start w-full">
              <Settings className="w-4 h-4" />
              Settings
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
