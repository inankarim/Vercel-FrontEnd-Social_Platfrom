// src/components/constants/PostSkeleton.jsx
import { motion } from "framer-motion";

const PostSkeleton = () => {
  // Create an array of 5 skeleton items for posts
  const skeletonPosts = Array(5).fill(null);

  return (
    <div className="space-y-6">
      {skeletonPosts.map((_, idx) => (
        <motion.div
          key={idx}
          layout
          className="card bg-base-100 shadow-xl border border-base-300 p-4 space-y-4 animate-pulse"
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
        >
          {/* Post Header Skeleton */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-300"></div>
            <div className="space-y-2">
              <div className="h-4 w-32 bg-gray-300 rounded"></div>
              <div className="h-3 w-24 bg-gray-300 rounded"></div>
            </div>
          </div>

          {/* Post Content Skeleton */}
          <div className="h-4 w-full bg-gray-300 rounded"></div>
          <div className="h-48 bg-gray-300 rounded-lg mt-4"></div>

          {/* Reactions Skeleton */}
          <div className="flex items-center justify-between gap-3 mt-4">
            <div className="h-3 w-20 bg-gray-300 rounded"></div>
            <div className="h-3 w-20 bg-gray-300 rounded"></div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default PostSkeleton;
