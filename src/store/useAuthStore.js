import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  // Check if the user is authenticated by checking the token
  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket(); // Connect socket for online users
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null }); // Set authUser to null if the token is invalid
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  // Signup user and store token
  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket(); // Connect socket after successful signup
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  // Login user, store the token in localStorage, and connect socket
  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });

      // Store the token in localStorage after successful login
      const { token } = res.data;
      if (token) {
        localStorage.setItem("token", token); // Save token to localStorage
      }

      toast.success("Logged in successfully");
      get().connectSocket(); // Connect socket after successful login
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  // Logout user, remove token from localStorage, and disconnect socket
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });

      // Remove token from localStorage
      localStorage.removeItem("token");

      toast.success("Logged out successfully");
      get().disconnectSocket(); // Disconnect socket after logout
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  // Update user profile information
  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  // Connect to socket server and listen for online users
  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return; // If already connected, do nothing

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();

    set({ socket: socket });

    // Listen for updates on online users
    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },

  // Disconnect socket when logging out or disconnecting
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));