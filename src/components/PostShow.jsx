import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import PostHeader from "./PostHeader";
import PostContent from "./PostContent";
import PostReactions from "./PostReactions";
import CommentCreate from "./CommentCreate";
import CommentRow from "./CommentRow";
import { usepostStore } from "../store/usepostStore";

const isPersistedId = (id) =>
  typeof id === "string" && /^[a-f0-9]{24}$/i.test(id) && !id.startsWith("temp-");

export default function PostShow({ post }) {
  const { fetchComments, comments } = usepostStore();

  const isValidPost = !!(post && post._id && (post.text || post.image));
  const persisted = isPersistedId(post?._id);
  const cache = isValidPost ? comments?.[post._id] : undefined;

  // fetch initial 5 comments for REAL posts only
  useEffect(() => {
    if (isValidPost && persisted && !cache) {
      fetchComments(post._id, 1, 5);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isValidPost, persisted, post?._id, fetchComments]);

  const createdAt = useMemo(() => {
    try {
      const d = new Date(post?.createdAt);
      return Number.isFinite(d.getTime()) ? d.toLocaleString() : "Unknown date";
    } catch { return "Unknown date"; }
  }, [post?.createdAt]);

  const loadMoreComments = () => {
    const nextPage = (cache?.page || 0) + 1;
    if (persisted && !cache?.loading) fetchComments(post._id, nextPage, 5);
  };

  if (!isValidPost) {
    return (
      <motion.article layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="card bg-base-100 shadow-xl border border-base-300 overflow-hidden">
        <div className="p-4 text-center text-sm opacity-70">
          <div className="text-error">Invalid post data</div>
          <div className="text-xs mt-1">This post could not be displayed properly</div>
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article
      layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="card bg-base-100 shadow-xl border border-base-300 overflow-hidden"
    >
      <PostHeader post={post} />
      <PostContent post={post} />

      <div className="px-4 pb-3">
        <div className="text-xs opacity-60 mb-3">{createdAt}</div>
        <PostReactions post={post} />
      </div>

      <div className="px-4 pt-2 pb-4 border-t border-base-300">
        {/* 🔒 disable input while the post still has a temp id */}
        <CommentCreate postId={post._id} disabled={!persisted} />

        <div className="mt-3 space-y-3">
          {!persisted && (
            <div className="text-center text-xs text-base-content/50">
              Publishing post… comments will appear in a moment.
            </div>
          )}

          {persisted && (
            <>
              {cache?.items?.length === 0 && !cache?.loading && (
                <div className="text-center text-sm text-base-content/50 py-2">
                  No comments yet. Be the first to comment!
                </div>
              )}

              {(cache?.items ?? []).map((c) =>
                c?._id ? <CommentRow key={c._id} comment={c} postId={post._id} /> : null
              )}

              <div className="flex justify-center pt-2">
                {cache?.loading ? (
                  <span className="text-xs opacity-70 flex items-center gap-2">
                    <div className="loading loading-spinner loading-xs"></div>
                    Loading comments...
                  </span>
                ) : cache?.hasNextPage ? (
                  <button onClick={loadMoreComments} className="btn btn-sm btn-ghost text-xs">
                    Load more comments
                  </button>
                ) : (cache?.items?.length ?? 0) > 0 ? (
                  <span className="text-xs opacity-60">No more comments.</span>
                ) : null}
              </div>

              {cache?.error && (
                <div className="text-center text-xs text-error bg-error/10 rounded p-2">
                  {cache.error}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </motion.article>
  );
}
