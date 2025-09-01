import { Heart, Laugh, ThumbsUp, Skull } from "lucide-react";
import { useState, useRef } from "react";
import { usepostStore } from "../store/usepostStore";

const REACTIONS = [
  { key: "like", label: "Like", icon: ThumbsUp },
  { key: "love", label: "Love", icon: Heart },
  { key: "funny", label: "Funny", icon: Laugh },
  { key: "horror", label: "Horror", icon: Skull },
];

export default function PostReactions({ post }) {
  const { reactToPost } = usepostStore();
  const [open, setOpen] = useState(false);
  const timerRef = useRef();

  const show = () => {
    clearTimeout(timerRef.current);
    setOpen(true);
  };
  const hide = () => {
    timerRef.current = setTimeout(() => setOpen(false), 160);
  };

  const active = post.userReaction;

  return (
    <div className="relative">
      <div className="flex items-center justify-between text-sm">
        <div className="opacity-70">
          {Number(post?.reactionCounts?.total || 0)} reactions • {post?.commentCount || 0} comments
        </div>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        {/* Main Like Button with hover/press popover */}
        <div
          className={`btn btn-ghost justify-start ${active ? "text-primary" : ""}`}
          onMouseEnter={show}
          onMouseLeave={hide}
          onTouchStart={show}
          onTouchEnd={hide}
        >
          <ThumbsUp className="w-5 h-5" />
          {active ? active.charAt(0).toUpperCase() + active.slice(1) : "Like"}
        </div>

        <button className="btn btn-ghost justify-start">Comment</button>
      </div>

      {/* Reaction Popover */}
      {open && (
        <div
          className="absolute -top-12 left-0 z-20 rounded-2xl border border-base-300 bg-base-100 px-2 py-1 shadow-xl flex gap-2"
          onMouseEnter={show}
          onMouseLeave={hide}
        >
          {REACTIONS.map((r) => {
            const Icon = r.icon;
            return (
              <button
                key={r.key}
                className={`btn btn-sm ${active === r.key ? "btn-primary" : "btn-ghost"}`}
                onClick={() => reactToPost(post._id, r.key)}
              >
                <Icon className="w-4 h-4" />
                {r.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}