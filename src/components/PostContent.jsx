import { motion } from "framer-motion";

export default function PostContent({ post }) {
  return (
    <>
      {post.text && (
        <div className="px-4 pt-3 text-[15px] leading-relaxed">
          {post.text}
        </div>
      )}
      {post.image && (
        <motion.div
          layout
          className="mt-3"
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
        >
          <img
            src={post.image}
            alt="post"
            className="w-full max-h-[640px] object-cover border-y border-base-300"
          />
        </motion.div>
      )}
    </>
  );
}