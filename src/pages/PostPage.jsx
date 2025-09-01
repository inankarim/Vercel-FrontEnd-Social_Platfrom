// src/pages/PostPage.jsx
import CreatePost from "../components/CreatePost";
import PostFeed from "../components/PostFeed";
import PostSkeleton from "../components/skeletons/PostSkeleton";
import { usepostStore } from "../store/usepostStore";
import LeftSidebar from "../components/LeftSidebar";

export default function PostPage() {
  const { isFetchingPosts } = usepostStore();

  return (
    <div className="w-full pt-20 pb-10">
      {/* Full width wrapper (no max-w cap) */}
      <div className="mx-auto w-full px-3 sm:px-6">
        {/* 2 columns: fixed sidebar + fluid feed */}
        <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-6">
          {/* Left Sidebar (shows on lg+) */}
          <div className="hidden lg:block">
            <LeftSidebar />
          </div>

          {/* Feed column fills the rest */}
          <div className="w-full space-y-6">
            <CreatePost />
            {isFetchingPosts ? <PostSkeleton /> : <PostFeed />}
          </div>
        </div>
      </div>
    </div>
  );
}
