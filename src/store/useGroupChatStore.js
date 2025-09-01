import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useGroupChatStore = create((set, get) => ({
  groupMessages: [],
  groups: [],
  selectedGroup: null,
  isGroupsLoading: false,
  isGroupMessagesLoading: false,
  isCreatingGroup: false,
  isSendingMessage: false,

  // Get all groups the user is part of
  getGroups: async () => {
    set({ isGroupsLoading: true });
    try {
      console.log("🔄 Fetching groups...");
      const res = await axiosInstance.get("/group");
      console.log("✅ Groups fetched:", res.data);
      set({ groups: res.data });
      return res.data;
    } catch (error) {
      console.error("❌ Failed to fetch groups:", error);
      toast.error(error.response?.data?.message || "Failed to fetch groups");
      throw error;
    } finally {
      set({ isGroupsLoading: false });
    }
  },

  // Get messages for a specific group
  getGroupMessages: async (groupId) => {
    if (!groupId) {
      console.error("❌ No groupId provided to getGroupMessages");
      return;
    }

    set({ isGroupMessagesLoading: true });
    try {
      console.log(`🔄 Fetching messages for group: ${groupId}`);
      const res = await axiosInstance.get(`/group/${groupId}/messages`);
      console.log("✅ Group messages fetched:", res.data.length, "messages");
      set({ groupMessages: res.data });
      return res.data;
    } catch (error) {
      console.error("❌ Failed to fetch group messages:", error);
      toast.error(error.response?.data?.message || "Failed to fetch group messages");
      throw error;
    } finally {
      set({ isGroupMessagesLoading: false });
    }
  },

  // Send a message to a group
  sendGroupMessage: async (groupId, messageData) => {
    if (!groupId || !messageData) {
      console.error("❌ Invalid data for sendGroupMessage:", { groupId, messageData });
      return;
    }

    const { groupMessages } = get();
    set({ isSendingMessage: true });

    try {
      console.log(`🔄 Sending message to group ${groupId}:`, messageData);
      
      // Create optimistic message for immediate UI update
      const optimisticMessage = {
        _id: `temp_${Date.now()}`,
        senderId: useAuthStore.getState().authUser,
        groupId,
        text: messageData.text || "",
        image: messageData.image || null,
        createdAt: new Date().toISOString(),
        optimistic: true
      };

      // Optimistically update UI
      set({ groupMessages: [...groupMessages, optimisticMessage] });

      const res = await axiosInstance.post(`/group/${groupId}/send`, messageData);
      console.log("✅ Message sent successfully:", res.data);

      // Replace optimistic message with real one
      const updatedMessages = groupMessages.filter(msg => msg._id !== optimisticMessage._id);
      set({ groupMessages: [...updatedMessages, res.data] });

      return res.data;
    } catch (error) {
      console.error("❌ Failed to send group message:", error);
      
      // Remove optimistic message on error
      const filteredMessages = groupMessages.filter(msg => !msg.optimistic);
      set({ groupMessages: filteredMessages });
      
      toast.error(error.response?.data?.message || "Failed to send message");
      throw error;
    } finally {
      set({ isSendingMessage: false });
    }
  },

  // Create a new group
  createGroup: async (groupData) => {
    if (!groupData || !groupData.name || !groupData.members) {
      console.error("❌ Invalid group data:", groupData);
      toast.error("Group name and members are required");
      return null;
    }

    set({ isCreatingGroup: true });
    try {
      console.log("🔄 Creating group:", groupData);
      const res = await axiosInstance.post("/group/gcreate", groupData);
      console.log("✅ Group creation response:", res.data);

      if (res.data.success) {
        // Add the new group to the groups list
        const { groups } = get();
        set({ groups: [...groups, res.data.group] });
        
        toast.success("Group created successfully!");
        return res.data;
      } else {
        toast.error(res.data.message || "Failed to create group");
        return null;
      }
    } catch (error) {
      console.error("❌ Failed to create group:", error);
      const errorMessage = error.response?.data?.message || "Failed to create group";
      toast.error(errorMessage);
      return null;
    } finally {
      set({ isCreatingGroup: false });
    }
  },

  // Subscribe to group messages via Socket.io
  subscribeToGroupMessages: (groupId) => {
    const socket = useAuthStore.getState().socket;
    if (!socket) {
      console.warn(" No socket available for group subscription");
      return;
    }

    console.log(` Subscribing to group messages: ${groupId}`);

    // Listen for new group messages
    socket.on("newGroupMessage", (newMessage) => {
      console.log(" Received new group message:", newMessage);
      const { selectedGroup, groupMessages } = get();
      
      // Only update if the message is for the currently selected group
      if (selectedGroup && newMessage.groupId === selectedGroup._id) {
        // Remove any optimistic message with the same content
        const filteredMessages = groupMessages.filter(msg => 
          !(msg.optimistic && msg.text === newMessage.text && msg.senderId._id === newMessage.senderId._id)
        );
        
        set({
          groupMessages: [...filteredMessages, newMessage],
        });
      }
    });

    // Join the group room
    socket.emit("joinGroup", groupId);
  },

  // Unsubscribe from group messages
  unsubscribeFromGroupMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    const { selectedGroup } = get();
    
    console.log(` Unsubscribing from group messages: ${selectedGroup?._id}`);
    
    // Leave the group room
    if (selectedGroup) {
      socket.emit("leaveGroup", selectedGroup._id);
    }
    
    socket.off("newGroupMessage");
  },

  // Subscribe to group updates (when new groups are created, members added, etc.)
  subscribeToGroupUpdates: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    console.log(" Subscribing to group updates");

    socket.on("groupCreated", (newGroup) => {
      console.log(" New group created:", newGroup);
      const { groups } = get();
      set({ groups: [...groups, newGroup] });
      toast.success(`You were added to group: ${newGroup.name}`);
    });

    socket.on("userAddedToGroup", ({ group, user, message }) => {
      console.log("User added to group:", { group, user });
      const { groups } = get();
      const updatedGroups = groups.map(g => 
        g._id === group._id ? { ...g, members: [...g.members, user] } : g
      );
      set({ groups: updatedGroups });
      toast.info(message || `${user.name} joined the group`);
    });

    socket.on("userRemovedFromGroup", ({ groupId, userId, message }) => {
      console.log("User removed from group:", { groupId, userId });
      const { groups } = get();
      const updatedGroups = groups.map(group => 
        group._id === groupId 
          ? { ...group, members: group.members.filter(member => member._id !== userId) }
          : group
      );
      set({ groups: updatedGroups });
      toast.info(message || "A user left the group");
    });
  },

  // Unsubscribe from group updates
  unsubscribeFromGroupUpdates: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    console.log("Unsubscribing from group updates");
    socket.off("groupCreated");
    socket.off("userAddedToGroup");
    socket.off("userRemovedFromGroup");
  },

  // Add user to group
  addUserToGroup: async (groupId, userId) => {
    if (!groupId || !userId) {
      console.error("Invalid data for addUserToGroup:", { groupId, userId });
      return;
    }

    try {
      console.log(`Adding user ${userId} to group ${groupId}`);
      const res = await axiosInstance.put(`/group/${groupId}/addUser`, { userId });
      
      // Update the selected group if it's the one being modified
      const { selectedGroup, groups } = get();
      if (selectedGroup && selectedGroup._id === groupId) {
        set({ selectedGroup: res.data.group });
      }
      
      // Update groups list
      const updatedGroups = groups.map(group => 
        group._id === groupId ? res.data.group : group
      );
      set({ groups: updatedGroups });
      
      toast.success("User added to group successfully");
      return res.data;
    } catch (error) {
      console.error("Failed to add user to group:", error);
      toast.error(error.response?.data?.message || "Failed to add user to group");
      throw error;
    }
  },

  // Set selected group
  setSelectedGroup: (selectedGroup) => {
    console.log("Setting selected group:", selectedGroup?._id);
    
    // Unsubscribe from previous group
    if (get().selectedGroup) {
      get().unsubscribeFromGroupMessages();
    }
    
    set({ selectedGroup, groupMessages: [] });
    
    // Subscribe to new group if one is selected
    if (selectedGroup) {
      get().subscribeToGroupMessages(selectedGroup._id);
      // Load messages for the selected group
      get().getGroupMessages(selectedGroup._id);
    }
  },

  // Initialize group chat store
  initialize: () => {
    console.log("Initializing group chat store");
    get().subscribeToGroupUpdates();
  },

  // Cleanup function
  cleanup: () => {
    console.log("Cleaning up group chat store");
    get().unsubscribeFromGroupMessages();
    get().unsubscribeFromGroupUpdates();
  },

  // Reset store
  reset: () => {
    set({
      groupMessages: [],
      groups: [],
      selectedGroup: null,
      isGroupsLoading: false,
      isGroupMessagesLoading: false,
      isCreatingGroup: false,
      isSendingMessage: false,
    });
  }
}));