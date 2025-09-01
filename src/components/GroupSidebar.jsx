import { useEffect } from "react";
import { useGroupChatStore } from "../store/useGroupChatStore"; // Fixed case sensitivity
import { useAuthStore } from "../store/useAuthStore.js";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, Plus } from "lucide-react";

const GroupSidebar = ({ onCreateGroup }) => {
  const { getGroups, groups, selectedGroup, setSelectedGroup, isGroupsLoading } = useGroupChatStore();
  const { authUser } = useAuthStore();

  useEffect(() => {
    // Only fetch groups if user is authenticated
    if (authUser) {
      getGroups();
    }
  }, [getGroups, authUser]);

  // Show loading skeleton while groups are loading or user is not authenticated
  if (isGroupsLoading || !authUser) return <SidebarSkeleton />;

  const handleCreateGroup = () => {
    if (!authUser) {
      console.error('User not authenticated');
      return;
    }
    onCreateGroup();
  };

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="size-6" />
            <span className="font-medium hidden lg:block">Groups</span>
          </div>
          <button
            onClick={handleCreateGroup}
            className="btn btn-sm btn-circle btn-primary"
            title="Create Group"
            disabled={!authUser}
          >
            <Plus className="size-4" />
          </button>
        </div>
        
        <div className="mt-3 hidden lg:flex items-center gap-2">
          <span className="text-xs text-zinc-500">({groups.length} groups)</span>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-3">
        {groups.map((group) => (
          <button
            key={group._id}
            onClick={() => setSelectedGroup(group)}
            className={`
              w-full p-3 flex items-center gap-3
              hover:bg-base-300 transition-colors
              ${selectedGroup?._id === group._id ? "bg-base-300 ring-1 ring-base-300" : ""}
            `}
          >
            <div className="relative mx-auto lg:mx-0">
              <div className="size-12 bg-primary/20 rounded-full flex items-center justify-center">
                <Users className="size-6 text-primary" />
              </div>
              <span className="absolute -bottom-1 -right-1 size-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                {group.members?.length || 0}
              </span>
            </div>

            {/* Group info - only visible on larger screens */}
            <div className="hidden lg:block text-left min-w-0 flex-1">
              <div className="font-medium truncate">{group.name}</div>
              <div className="text-sm text-zinc-400">
                {group.members?.length || 0} members
              </div>
            </div>
          </button>
        ))}

        {groups.length === 0 && (
          <div className="text-center text-zinc-500 py-8 px-4">
            <Users className="size-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No groups yet</p>
            <p className="text-xs mt-1">Create your first group!</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default GroupSidebar;