import { Users, Plus } from "lucide-react";

const NoGroupSelected = ({ onCreateGroup }) => {
  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-16 bg-base-100/50">
      <div className="max-w-md text-center space-y-6">
        {/* Icon Display */}
        <div className="flex justify-center gap-4 mb-4">
          <div className="relative">
            <div
              className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center
             justify-center animate-bounce"
            >
              <Users className="w-8 h-8 text-primary" />
            </div>
          </div>
        </div>

        {/* Welcome Text */}
        <h2 className="text-2xl font-bold">Welcome to Group Chat!</h2>
        <p className="text-base-content/60">
          Select a group from the sidebar to start chatting with multiple people
        </p>

        {/* Create Group Button */}
        <div className="pt-4">
          <button
            onClick={onCreateGroup}
            className="btn btn-primary gap-2"
          >
            <Plus className="w-4 h-4" />
            Create New Group
          </button>
        </div>

        {/* Features */}
        <div className="pt-8 space-y-3 text-sm text-base-content/50">
          <div className="flex items-center justify-center gap-2">
            <Users className="w-4 h-4" />
            <span>Chat with multiple people at once</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span>📸</span>
            <span>Share images and messages</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span>⚡</span>
            <span>Real-time messaging</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoGroupSelected;