import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore.js";
import { LogOut, MessageSquare, Settings, User, List } from "lucide-react"; // Changed Feed to List for a feed-like icon

const Navbar = () => {
  const { logout, authUser } = useAuthStore();

  return (
    <header className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 backdrop-blur-lg bg-base-100/80">
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-all">
              
              <h1 className="text-lg font-bold">Social Platfrom</h1>
              <MessageSquare className="w-6 h-6" />
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link to={"/settings"} className="btn btn-sm gap-2 transition-colors">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>

            {/* Corrected to List icon */}
            <Link to={"/posts"} className="btn btn-sm gap-2 transition-colors">
              <List className="w-4 h-4" /> {/* Use List icon instead of Feed */}
              <span className="hidden sm:inline">Posts</span>
            </Link>

            {authUser && (
              <>
                <Link to={"/profile"} className={`btn btn-sm gap-2`}>
                  <User className="size-5" />
                  <span className="hidden sm:inline">Profile</span>
                </Link>
                

                <button className="flex gap-2 items-center" onClick={logout}>
                  <LogOut className="size-5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;