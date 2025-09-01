// src/components/PostEditModal.jsx
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { X, ImagePlus, Loader2 } from "lucide-react";
import { usepostStore } from "../store/usepostStore";

export default function PostEditModal({ open, onClose, post }) {
  const { updatePost, isUpdatingPost } = usepostStore?.() || usepostStore(); // support both hook styles
  const [text, setText] = useState(post?.text || "");
  const [imgDataUrl, setImgDataUrl] = useState(post?.image || "");
  const fileRef = useRef(null);

  useEffect(() => {
    if (open) {
      setText(post?.text || "");
      setImgDataUrl(post?.image || "");
    }
  }, [open, post]);

  const onPickImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImgDataUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const onSave = async () => {
    const payload = {};
    const trimmed = (text ?? "").trim();

    if (trimmed !== (post?.text ?? "")) payload.text = trimmed;
    if (imgDataUrl && imgDataUrl !== post?.image) payload.image = imgDataUrl;

    // if nothing changed, just close
    if (Object.keys(payload).length === 0) return onClose?.();

    await updatePost(post._id, payload);
    onClose?.();
  };

  const onKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") onSave();
    if (e.key === "Escape") onClose?.();
  };

  if (!open) return null;

  return (
    <div className="modal modal-open">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="modal-box max-w-2xl bg-base-100"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Edit Post</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <textarea
          className="textarea textarea-bordered w-full min-h-[120px]"
          placeholder="Say something..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
        />

        <div className="mt-3">
          {imgDataUrl ? (
            <motion.div
              initial={{ opacity: 0.8 }}
              animate={{ opacity: 1 }}
              className="relative"
            >
              <img
                src={imgDataUrl}
                alt="preview"
                className="w-full max-h-[420px] object-cover rounded-lg border border-base-300"
              />
              <div className="mt-2 flex gap-2">
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => fileRef.current?.click()}
                >
                  <ImagePlus className="w-4 h-4 mr-1" />
                  Replace image
                </button>
                {/* Note: true “remove image” needs a small backend tweak; skipping for now */}
              </div>
            </motion.div>
          ) : (
            <button
              className="btn btn-outline btn-sm"
              onClick={() => fileRef.current?.click()}
            >
              <ImagePlus className="w-4 h-4 mr-1" />
              Add image
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onPickImage}
          />
        </div>

        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={onSave} disabled={isUpdatingPost}>
            {isUpdatingPost ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
          </button>
        </div>
        <p className="text-xs opacity-60 mt-2">Tip: ⌘/Ctrl + Enter to save, Esc to close.</p>
      </motion.div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
}
