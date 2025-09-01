// src/components/PostFeed.jsx
import { useEffect, useMemo, useRef } from "react";
import { usepostStore } from "../store/usepostStore";
import PostShow from "./PostShow";
import { Loader2 } from "lucide-react";

export default function PostFeed() {
  const { posts, fetchPosts, hasNextPage, isFetchingPosts, currentPage } = usepostStore();
  const didInit = useRef(false);

  // Fetch ONLY once on mount
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    fetchPosts(1, 10);
    // do NOT add fetchPosts to deps; identity can change in Zustand
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // De-dup only (store already sorts newest-first)
  const visiblePosts = useMemo(() => {
    if (!Array.isArray(posts)) return [];
    const map = new Map();
    for (const p of posts) {
      if (p?._id && !map.has(p._id)) map.set(p._id, p);
    }
    return Array.from(map.values());
  }, [posts]);

  const loadMore = () => {
    if (!hasNextPage || isFetchingPosts) return;
    const next = (currentPage || 1) + 1;
    fetchPosts(next, 10);
  };

  if (isFetchingPosts && visiblePosts.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Loading posts...</span>
      </div>
    );
  }

  if (!isFetchingPosts && visiblePosts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-lg font-semibold text-base-content/70 mb-2">No posts yet</div>
        <div className="text-sm text-base-content/50">Be the first to share something!</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 min-h-[2000px]">
      {visiblePosts.map((post) => (post?._id ? <PostShow key={post._id} post={post} /> : null))}

      <div className="flex justify-center py-6">
        {isFetchingPosts ? (
          <div className="flex items-center gap-2 opacity-70">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading more...</span>
          </div>
        ) : hasNextPage ? (
          <button onClick={loadMore} className="btn btn-sm btn-outline">Show more</button>
        ) : (
          <span className="text-sm opacity-60">You're all caught up 🎉</span>
        )}
      </div>
    </div>
  );
}
