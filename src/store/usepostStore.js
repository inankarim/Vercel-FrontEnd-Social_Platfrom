// src/store/usepostStore.js
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const REACTION_TYPES = ["love", "like", "funny", "horror"];

// prevent duplicate fetches of the same page
let inFlight = new Set();

const isPersistedId = (id) =>
  typeof id === "string" && /^[a-f0-9]{24}$/i.test(id) && !id.startsWith("temp-");

export const usepostStore = create((set, get) => ({
  // ===== State =====
  posts: [],
  currentPage: 0,
  totalPages: 0,
  hasNextPage: true,
  isFetchingPosts: false,
  isCreatingPost: false,
  isUpdatingPost: false,
  isDeletingPost: false,
  error: null,

  // postId -> { items, page, hasNextPage, loading, error }
  comments: {},

  // ===== Helpers =====
  _upsertPost(post) {
    const posts = get().posts.slice();
    const i = posts.findIndex((p) => p._id === post._id);
    if (i >= 0) posts[i] = { ...posts[i], ...post };
    else posts.unshift(post);
    set({ posts: get()._sortPostsByDate(posts) });
  },

  _sortPostsByDate(posts) {
    return posts.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA; // newest first
    });
  },

  _ensureCommentCache(postId) {
    if (!get().comments[postId]) {
      set({
        comments: {
          ...get().comments,
          [postId]: {
            items: [],
            page: 0,
            hasNextPage: true,
            loading: false,
            error: null,
          },
        },
      });
    }
  },

  _setCommentCache(postId, updater) {
    const base =
      get().comments[postId] || {
        items: [],
        page: 0,
        hasNextPage: true,
        loading: false,
        error: null,
      };
    set({
      comments: {
        ...get().comments,
        [postId]: { ...base, ...updater(base) },
      },
    });
  },

  // ===== Posts =====
  fetchPosts: async (page = 1, limit = 10) => {
    const key = `${page}:${limit}`;
    if (inFlight.has(key)) return false;
    if (get().currentPage === page && (get().posts?.length || 0) > 0) return true;
    if (get().isFetchingPosts) return false;

    inFlight.add(key);
    set({ isFetchingPosts: true, error: null });

    try {
      const { data } = await axiosInstance.get("/post/getpost", { params: { page, limit } });
      const {
        posts = [],
        currentPage = page,
        totalPages = 1,
        hasNextPage = false,
      } = data;

      if (!Array.isArray(posts)) throw new Error("Posts is not an array");

      const normalized = posts
        .filter((p) => p && p._id)
        .map((post) => ({
          ...post,
          _id: post._id,
          text: post.text || "",
          image: post.image || null,
          createdAt: post.createdAt || new Date().toISOString(),
          senderId: post.senderId || post.author || null,
          reactionCounts: {
            total: 0, love: 0, like: 0, funny: 0, horror: 0,
            ...(post.reactionCounts || {}),
          },
          commentCount:
            typeof post.commentCount === "number" ? post.commentCount : 0,
          userReaction: REACTION_TYPES.includes(post.userReaction)
            ? post.userReaction
            : null,
        }));

      const existing = get().posts || [];
      let finalPosts;
      if (page === 1) {
        finalPosts = normalized;
      } else {
        const seen = new Set(existing.map((p) => p._id));
        finalPosts = [...existing, ...normalized.filter((p) => !seen.has(p._id))];
      }

      finalPosts = get()._sortPostsByDate(finalPosts);

      set({
        posts: finalPosts,
        currentPage,
        totalPages,
        hasNextPage,
        isFetchingPosts: false,
        error: null,
      });

      console.log(
        `✅ Posts loaded: page ${currentPage}/${totalPages}, total=${finalPosts.length}, next=${hasNextPage}`
      );

      return true;
    } catch (err) {
      const msg =
        err?.response?.data?.error || err?.message || "Failed to load posts";
      set({ isFetchingPosts: false, error: msg, posts: get().posts });
      console.error("❌ fetchPosts failed:", msg);
      toast.error(msg);
      return false;
    } finally {
      inFlight.delete(key);
    }
  },

  // ===== Post CRUD =====
  createPost: async ({ text, image }) => {
    if (!text?.trim() && !image) {
      toast.error("Write something or add a picture.");
      return null;
    }
    if (get().isCreatingPost) return null;

    set({ isCreatingPost: true });
    const optimisticId = `temp-${Date.now()}`;

    const optimistic = {
      _id: optimisticId,
      text: text?.trim() || "",
      image: image || null,
      senderId: { _id: "temp-user", fullName: "You", profilePic: "/avatar.png" },
      createdAt: new Date().toISOString(),
      reactionCounts: { total: 0, love: 0, like: 0, funny: 0, horror: 0 },
      commentCount: 0,
      userReaction: null,
    };

    set({ posts: [optimistic, ...(get().posts || [])] });

    try {
      const { data: created } = await axiosInstance.post("/post", {
        text: text?.trim() || "",
        image: image || null,
      });

      const updatedPosts = get().posts.map((p) =>
        p._id === optimisticId ? created : p
      );
      set({
        posts: get()._sortPostsByDate(updatedPosts),
        isCreatingPost: false,
      });
      toast.success("Post created!");
      return created;
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to create post";
      toast.error(msg);
      set({
        posts: get().posts.filter((p) => p._id !== optimisticId),
        isCreatingPost: false,
      });
      return null;
    }
  },

  updatePost: async (postId, payload) => {
    try {
      const { data } = await axiosInstance.put(`/post/${postId}`, payload);
      get()._upsertPost(data);
      toast.success("Post updated");
      return true;
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to update post");
      return false;
    }
  },

  deletePost: async (postId) => {
    const prev = get().posts;
    set({ posts: prev.filter((p) => p._id !== postId) });
    try {
      await axiosInstance.delete(`/post/${postId}`);
      toast.success("Post deleted");
      return true;
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to delete post");
      set({ posts: prev });
      return false;
    }
  },

  reactToPost: async (postId, type) => {
    if (!REACTION_TYPES.includes(type)) return;
    const prev = get().posts;

    // optimistic toggle
    set({
      posts: prev.map((p) => {
        if (p._id !== postId) return p;
        const isRemoving = p.userReaction === type;
        const nextCounts = { ...p.reactionCounts };

        if (isRemoving) {
          nextCounts[type] = Math.max(0, (nextCounts[type] || 0) - 1);
          nextCounts.total = Math.max(0, (nextCounts.total || 0) - 1);
          return { ...p, userReaction: null, reactionCounts: nextCounts };
        } else {
          if (p.userReaction && p.userReaction !== type) {
            nextCounts[p.userReaction] = Math.max(
              0,
              (nextCounts[p.userReaction] || 0) - 1
            );
          } else {
            nextCounts.total = (nextCounts.total || 0) + 1;
          }
          nextCounts[type] = (nextCounts[type] || 0) + 1;
          return { ...p, userReaction: type, reactionCounts: nextCounts };
        }
      }),
    });

    try {
      const { data } = await axiosInstance.post(`/post/${postId}/reactions`, {
        type,
        targetType: "post",
      });
      set({
        posts: get().posts.map((p) =>
          p._id === postId
            ? {
                ...p,
                userReaction: data.userReaction,
                reactionCounts: data.reactionCounts,
              }
            : p
        ),
      });
      return true;
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to react");
      set({ posts: prev });
      return false;
    }
  },

  // ===== Comments =====
  fetchComments: async (postId, page = 1, limit = 10) => {
    if (!isPersistedId(postId)) return false; // skip temp ids
    get()._ensureCommentCache(postId);
    get()._setCommentCache(postId, () => ({ loading: true, error: null }));

    try {
      const { data } = await axiosInstance.get(`/post/${postId}/comments`, {
        params: { page, limit },
      });
      const { comments = [], currentPage = page, hasNextPage = false } = data;

      get()._setCommentCache(postId, (base) => ({
        items: page === 1 ? comments : [...(base.items || []), ...comments],
        page: currentPage,
        hasNextPage,
        loading: false,
      }));
      return true;
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to load comments";
      toast.error(msg);
      get()._setCommentCache(postId, () => ({ loading: false, error: msg }));
      return false;
    }
  },

  // Add comment (POST /post/:id/comments)
  addComment: async (postId, { text, image, parentCommentId = null }) => {
    if (!isPersistedId(postId)) {
      toast.error("Please wait—publishing the post before commenting.");
      return false;
    }
    if (!text?.trim() && !image) {
      toast.error("Comment must contain either text or image");
      return false;
    }

    get()._ensureCommentCache(postId);

    try {
      const { data: created } = await axiosInstance.post(`/post/${postId}/comments`, {
        text: text?.trim() || "",
        image: image || null,
        parentCommentId,
      });

      // add to top of cache
      get()._setCommentCache(postId, (base) => ({
        items: [created, ...(base.items || [])],
      }));

      // increment post.commentCount
      set({
        posts: get().posts.map((p) =>
          p._id === postId ? { ...p, commentCount: (p.commentCount || 0) + 1 } : p
        ),
      });

      return true;
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to add comment";
      toast.error(msg);
      return false;
    }
  },

  // Update comment (PUT /post/comments/:commentId)
  updateComment: async (commentId, { text, image }, postId) => {
    try {
      const { data } = await axiosInstance.put(`/post/comments/${commentId}`, {
        text,
        image,
      });

      get()._setCommentCache(postId, (base) => ({
        items: (base.items || []).map((c) => (c._id === commentId ? data : c)),
      }));

      toast.success("Comment updated");
      return true;
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to update comment";
      toast.error(msg);
      return false;
    }
  },

  // Delete comment (DELETE /post/comments/:commentId)
  deleteComment: async (commentId, postId) => {
    const prevItems = get().comments[postId]?.items || [];
    get()._setCommentCache(postId, () => ({
      items: prevItems.filter((c) => c._id !== commentId),
    }));

    try {
      await axiosInstance.delete(`/post/comments/${commentId}`);

      set({
        posts: get().posts.map((p) =>
          p._id === postId
            ? { ...p, commentCount: Math.max(0, (p.commentCount || 1) - 1) }
            : p
        ),
      });

      toast.success("Comment deleted");
      return true;
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to delete comment";
      toast.error(msg);
      // revert on error
      get()._setCommentCache(postId, () => ({ items: prevItems }));
      return false;
    }
  },


reactToComment: async (commentId, type, postId) => {
  const VALID = ["love", "like", "funny", "horror"];
  if (!VALID.includes(type)) return false;

  // guard: only persisted ObjectIds (avoid temp-*)
  const isPersistedId =
    typeof commentId === "string" && /^[a-f0-9]{24}$/i.test(commentId);

  if (!isPersistedId) {
    toast.error("Please wait—comment is still saving.");
    return false;
  }

  // --- optimistic update (with safe defaults) ---
  const prevItems = get().comments[postId]?.items || [];
  get()._setCommentCache(postId, (base) => ({
    items: (base.items || []).map((c) => {
      if (c._id !== commentId) return c;

      const baseCounts = {
        total: 0,
        love: 0,
        like: 0,
        funny: 0,
        horror: 0,
        ...(c.reactionCounts || {}),
      };

      const removing = c.userReaction === type;
      const counts = { ...baseCounts };

      if (removing) {
        counts[type] = Math.max(0, (counts[type] || 0) - 1);
        counts.total = Math.max(0, (counts.total || 0) - 1);
        return { ...c, userReaction: null, reactionCounts: counts };
      } else {
        if (c.userReaction && c.userReaction !== type) {
          counts[c.userReaction] = Math.max(0, (counts[c.userReaction] || 0) - 1);
        } else {
          counts.total = (counts.total || 0) + 1;
        }
        counts[type] = (counts[type] || 0) + 1;
        return { ...c, userReaction: type, reactionCounts: counts };
      }
    }),
  }));

  try {
    // ✅ matches your router: POST /post/comments/:commentId/reactions
    const { data } = await axiosInstance.post(
      `/post/comments/${commentId}/reactions`,
      { type, targetType: "comment" } // your controller shares logic with posts
    );

    // reconcile with server truth (if it returns counts/reaction)
    get()._setCommentCache(postId, (base) => ({
      items: (base.items || []).map((c) =>
        c._id === commentId
          ? {
              ...c,
              userReaction: data?.userReaction ?? c.userReaction,
              reactionCounts: data?.reactionCounts ?? c.reactionCounts,
            }
          : c
      ),
    }));

    return true;
  } catch (err) {
    const status = err?.response?.status;
    const msg =
      err?.response?.data?.error ||
      (status === 404 ? "Comment not found. Try refreshing." : "Failed to react to comment");

    toast.error(msg);
    // revert optimistic
    get()._setCommentCache(postId, () => ({ items: prevItems }));
    return false;
  }
},


}));