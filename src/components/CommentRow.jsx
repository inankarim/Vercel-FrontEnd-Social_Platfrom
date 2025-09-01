import { useAuthStore } from "../store/useAuthStore.js";
import { usepostStore } from "../store/usepostStore.js";
import { ThumbsUp, Heart, Laugh, Skull, Pencil, Trash2 } from "lucide-react";

export default function CommentRow({ comment, postId }) {
  const { authUser } = useAuthStore();
  const { reactToComment, updateComment, deleteComment } = usepostStore();

  const canEdit = authUser?._id === comment?.userId?._id;

  const handleReaction = (reactionType) => {
    reactToComment(comment._id, reactionType, postId);
  };

  return (
    <div className="flex items-start gap-3">
      <div className="avatar">
        <div className="w-8 rounded-full ring ring-primary/10">
          <img
            src={comment?.userId?.profilePic || "/avatar.png"}
            alt="profile pic"
            onError={(e) => {
              e.currentTarget.onerror = null;
              const name = encodeURIComponent(comment?.userId?.fullName || "User");
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${name}&background=random`;
            }}
          />
        </div>
      </div>

      <div className="flex-1">
        <div className="bg-base-200/60 rounded-2xl px-3 py-2">
          <div className="text-sm font-semibold">
            {comment?.userId?.fullName || "User"}
          </div>
          {comment.text && <div className="text-sm mt-0.5">{comment.text}</div>}
          {comment.image && (
            <img
              src={comment.image}
              className="rounded-xl mt-2 max-h-80 object-cover border border-base-300"
              alt="comment attachment"
            />
          )}
        </div>

        <div className="flex items-center gap-3 ml-2 mt-1 text-xs opacity-70">
          <button
            onClick={() => handleReaction("like")}
            className={`flex items-center gap-1 ${
              comment.userReaction === "like" ? "text-primary" : ""
            }`}
          >
            <ThumbsUp className="w-4 h-4" /> Like
          </button>
          <button
            onClick={() => handleReaction("love")}
            className={`flex items-center gap-1 ${
              comment.userReaction === "love" ? "text-primary" : ""
            }`}
          >
            <Heart className="w-4 h-4" /> Love
          </button>
          <button
            onClick={() => handleReaction("funny")}
            className={`flex items-center gap-1 ${
              comment.userReaction === "funny" ? "text-primary" : ""
            }`}
          >
            <Laugh className="w-4 h-4" /> Funny
          </button>
          <button
            onClick={() => handleReaction("horror")}
            className={`flex items-center gap-1 ${
              comment.userReaction === "horror" ? "text-primary" : ""
            }`}
          >
            <Skull className="w-4 h-4" /> Horror
          </button>

          {canEdit && (
            <div className="flex items-center gap-2">
              <button
                className="flex items-center gap-1"
                onClick={() => {
                  const txt = prompt("Edit comment text:", comment.text || "");
                  if (txt !== null) updateComment(comment._id, { text: txt }, postId);
                }}
              >
                <Pencil className="w-4 h-4" /> Edit
              </button>
              <button
                className="flex items-center gap-1 text-red-600"
                onClick={() => deleteComment(comment._id, postId)}
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}