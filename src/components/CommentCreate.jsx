// src/components/CommentCreate.jsx
import { useMemo, useState } from "react";
import { usepostStore } from "../store/usepostStore";

const isPersistedId = (id) =>
  typeof id === "string" && /^[a-f0-9]{24}$/i.test(id) && !id.startsWith("temp-");

export default function CommentCreate({ postId, disabled = false }) {
  // pull addComment from Zustand store
  const { addComment } = usepostStore();
  const [text, setText] = useState("");

  const canUse = useMemo(
    () => isPersistedId(postId) && !disabled,
    [postId, disabled]
  );

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canUse) return;

    if (typeof addComment !== "function") {
      // if you still see this, the store didn't export addComment or the import path is wrong
      console.error("addComment not available on store");
      return;
    }

    const ok = await addComment(postId, {
      text,
      image: null,
      parentCommentId: null,
    });

    if (ok) setText("");
  };

  return (
    <form onSubmit={onSubmit} className="flex items-center gap-2">
      <input
        className="input input-sm input-bordered flex-1"
        placeholder={canUse ? "Write a comment…" : "Publishing post…"}
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={!canUse}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) onSubmit(e);
        }}
      />
      <button
        type="submit"
        className="btn btn-sm"
        disabled={!canUse || !text.trim()}
        title={
          canUse
            ? "Post comment"
            : "Please wait until the post is published"
        }
      >
        Send
      </button>
    </form>
  );
}