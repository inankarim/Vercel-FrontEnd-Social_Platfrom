// src/components/CreatePost.jsx
import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { usepostStore } from "../store/usepostStore";
import { useAuthStore } from "../store/useAuthStore.js";
import { motion } from "framer-motion";

export default function CreatePost({ onPosted }) {
  const { authUser } = useAuthStore();
  const { createPost, isCreatingPost } = usepostStore();
  const [text, setText] = useState("");
  const [imgDataUrl, setImgDataUrl] = useState(null);
  const fileRef = useRef(null);

  const onPickImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImgDataUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImgDataUrl(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const submit = async (e) => {
    e.preventDefault();
    const created = await createPost({ text: text.trim(), image: imgDataUrl });
    if (created) {
      setText("");
      clearImage();
      onPosted?.(created);
      // no auto-scroll; newest shows at top due to sorting + unshift
    }
  };

  return (
    <motion.div
      layout
      className="card bg-base-100 shadow-lg border border-base-300 overflow-hidden"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="card-body gap-3">
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="w-10 rounded-full ring ring-primary/20">
              <img src={authUser?.profilePic || "/avatar.png"} alt="me" />
            </div>
          </div>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`What's on your mind, ${authUser?.fullName?.split(" ")[0] || "friend"}?`}
            className="input input-bordered w-full"
          />
        </div>

        {imgDataUrl && (
          <div className="relative rounded-xl overflow-hidden border border-base-300">
            <img src={imgDataUrl} className="w-full object-cover max-h-[460px]" />
            <button
              onClick={clearImage}
              className="btn btn-xs btn-circle absolute right-2 top-2 bg-base-100/70 backdrop-blur border-base-300"
              type="button"
              aria-label="Remove"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between">
          <label className="btn btn-ghost gap-2" htmlFor="post-image">
            <ImagePlus className="w-5 h-5" />
            Photo
          </label>
          <input id="post-image" ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickImage} />
          <button onClick={submit} disabled={isCreatingPost} className="btn btn-primary">
            {isCreatingPost ? "Posting..." : "Post"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}