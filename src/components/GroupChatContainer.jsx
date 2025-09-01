import { useGroupChatStore } from "../store/useGroupChatStore";
import { useEffect, useRef } from "react";
import GroupChatHeader from "./GroupChatHeader";
import GroupMessageInput from "./GroupMessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore.js";
import { formatMessageTime } from "../lib/utils";

const GroupChatContainer = () => {
  const {
    groupMessages,
    getGroupMessages,
    isGroupMessagesLoading,
    selectedGroup,
    subscribeToGroupMessages,
    unsubscribeFromGroupMessages,
  } = useGroupChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    if (selectedGroup?._id) {
      getGroupMessages(selectedGroup._id);
      subscribeToGroupMessages(selectedGroup._id);
    }

    return () => unsubscribeFromGroupMessages();
  }, [selectedGroup?._id, getGroupMessages, subscribeToGroupMessages, unsubscribeFromGroupMessages]);

  useEffect(() => {
    if (messageEndRef.current && groupMessages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [groupMessages]);

  if (isGroupMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <GroupChatHeader />
        <MessageSkeleton />
        <GroupMessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <GroupChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {groupMessages.map((message) => {
          const isOwnMessage = message.senderId._id === authUser._id;
          return (
            <div
              key={message._id}
              className={`chat ${isOwnMessage ? "chat-end" : "chat-start"}`}
              ref={messageEndRef}
            >
              <div className="chat-image avatar">
                <div className="size-10 rounded-full border">
                  <img
                    src={
                      message.senderId.avatarUrl || 
                      message.senderId.profilePic || 
                      "/avatar.png"
                    }
                    alt="profile pic"
                  />
                </div>
              </div>
              
              <div className="chat-header mb-1 flex items-center gap-2">
                {!isOwnMessage && (
                  <span className="text-xs font-medium opacity-70">
                    {message.senderId.name || message.senderId.fullName}
                  </span>
                )}
                <time className="text-xs opacity-50">
                  {formatMessageTime(message.createdAt)}
                </time>
              </div>
              
              <div className="chat-bubble flex flex-col">
                {message.image && (
                  <img
                    src={message.image}
                    alt="Attachment"
                    className="sm:max-w-[200px] rounded-md mb-2"
                  />
                )}
                {message.text && <p>{message.text}</p>}
              </div>
            </div>
          );
        })}

        {groupMessages.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-4">💬</div>
              <p className="text-base-content/60">No messages yet</p>
              <p className="text-sm text-base-content/40">Start the conversation!</p>
            </div>
          </div>
        )}
      </div>

      <GroupMessageInput />
    </div>
  );
};

export default GroupChatContainer;