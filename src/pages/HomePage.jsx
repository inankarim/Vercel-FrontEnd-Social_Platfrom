import { useChatStore } from "../store/useChatStore";
import { useGroupChatStore } from "../store/useGroupChatStore.js";
import { useAuthStore } from "../store/useAuthStore.js";
import { useState } from "react";
import { MessageSquare, Users } from "lucide-react";

import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";
import GroupSidebar from "../components/GroupSidebar";
import NoGroupSelected from "../components/NoGroupSelected";
import GroupChatContainer from "../components/GroupChatContainer";
import GroupChat from "../components/GroupChat";

const HomePage = () => {
  const { selectedUser } = useChatStore();
  const { selectedGroup } = useGroupChatStore();
  const { authUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('private'); // 'private' or 'group'
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  const handleCreateGroup = () => {
    setShowCreateGroup(true);
  };

  const handleGroupCreated = (newGroup) => {
    setShowCreateGroup(false);
    // Optionally select the newly created group
    // setSelectedGroup(newGroup);
  };

  const handleCancelCreateGroup = () => {
    setShowCreateGroup(false);
  };

  // If creating a group, show the GroupChat component full screen
  if (showCreateGroup) {
    return (
      <div className="h-screen w-screen">
        <GroupChat 
          onGroupCreated={handleGroupCreated}
          currentUser={authUser}
          onCancel={handleCancelCreateGroup}
        />
      </div>
    );
  }

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-20 px-4">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
          
          {/* Tab Navigation */}
          <div className="flex border-b border-base-300 bg-base-100 rounded-t-lg">
            <button
              onClick={() => setActiveTab('private')}
              className={`px-6 py-3 flex items-center gap-2 font-medium transition-colors ${
                activeTab === 'private' 
                  ? 'border-b-2 border-primary text-primary bg-primary/5' 
                  : 'text-base-content/70 hover:text-base-content hover:bg-base-200'
              }`}
            >
              <MessageSquare className="size-4" />
              Private Chats
            </button>
            <button
              onClick={() => setActiveTab('group')}
              className={`px-6 py-3 flex items-center gap-2 font-medium transition-colors ${
                activeTab === 'group' 
                  ? 'border-b-2 border-primary text-primary bg-primary/5' 
                  : 'text-base-content/70 hover:text-base-content hover:bg-base-200'
              }`}
            >
              <Users className="size-4" />
              Group Chats
            </button>
          </div>

          {/* Content based on active tab */}
          <div className="flex h-[calc(100%-60px)] overflow-hidden">
            {activeTab === 'private' ? (
              <>
                <Sidebar />
                {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
              </>
            ) : (
              <>
                <GroupSidebar onCreateGroup={handleCreateGroup} />
                {!selectedGroup ? (
                  <NoGroupSelected onCreateGroup={handleCreateGroup} />
                ) : (
                  <GroupChatContainer />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;