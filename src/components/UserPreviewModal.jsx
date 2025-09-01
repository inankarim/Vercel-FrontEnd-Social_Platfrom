// src/components/UserPreviewModal.jsx
import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { X, MessageSquare } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore.js";

export default function UserPreviewModal({ open, onClose, user }) {
  const navigate = useNavigate?.();
  
  const { setSelectedUser } = useChatStore();
  const { authUser } = useAuthStore();
  
  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  
  const displayName = useMemo(() => user?.fullName || "User", [user]);
  const avatarSrc = useMemo(() => user?.profilePic || "/avatar.png", [user]);
  const email = user?.email || "";
  const job = user?.Job || "";
  const universityName = user?.universityName || "";
  
  // Debug logging (remove in production)
  console.log("User object:", user);
  console.log("Job value:", user?.Job);
  console.log("University value:", user?.universityName);
  
  if (!open || !user) return null;
  
  const isSelf = authUser?._id === user?._id;
  
  const goToDirectChat = () => {
    setSelectedUser?.(user);
    if (navigate) navigate("/chathome", { state: { focus: "private" } });
    onClose?.();
  };
  
  return (
    <div
      className="fixed inset-0 z-[999] bg-black/40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-base-100 rounded-2xl shadow-xl border border-base-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-base-300">
          <h3 className="font-semibold text-lg">
            {isSelf ? "My Profile" : "Profile"}
          </h3>
          
          <div className="flex items-center gap-1.5">
            {/* Chat icon in header (hidden if self) */}
            {!isSelf && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={goToDirectChat}
                title="Message"
                aria-label="Message"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            )}
            
            <button
              className="btn btn-ghost btn-sm"
              onClick={onClose}
              aria-label="Close"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Body */}
        <div className="p-5">
          <div className="flex items-center gap-4">
            <div className="avatar">
              <div className="w-16 rounded-full ring ring-primary/15">
                <img
                  src={avatarSrc}
                  alt={displayName}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    const name = encodeURIComponent(displayName);
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${name}&background=random`;
                  }}
                />
              </div>
            </div>
            
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-lg truncate">{displayName}</div>
              {email ? (
                <div className="text-sm opacity-70 truncate">{email}</div>
              ) : null}
            </div>
          </div>
          
          {/* University and Job Information */}
          <div className="mt-5 space-y-3">
            {universityName && universityName.trim() !== "" ? (
              <div className="text-sm">
                <span className="opacity-60 font-medium">University: </span>
                <span className="break-words">{universityName}</span>
              </div>
            ) : null}
            
            {job && job.trim() !== "" ? (
              <div className="text-sm">
                <span className="opacity-60 font-medium">Job: </span>
                <span className="break-words">{job}</span>
              </div>
            ) : null}
          </div>
        </div>
        
        {/* Actions */}
        <div className="p-4 pt-0 space-y-2">
          {!isSelf && (
            <button className="btn btn-primary w-full" onClick={goToDirectChat}>
              <MessageSquare className="w-4 h-4" />
              Message
            </button>
          )}
          <button className="btn w-full" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}