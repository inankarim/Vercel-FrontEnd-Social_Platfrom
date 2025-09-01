import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useGroupChatStore } from '../store/useGroupChatStore.js';
import { useAuthStore } from '../store/useAuthStore.js';
import { axiosInstance } from '../lib/axios';

export default function GroupChat({ onGroupCreated, currentUser, onCancel }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupName, setGroupName] = useState('');
  const [query, setQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [visible, setVisible] = useState([]);
  const [creating, setCreating] = useState(false);
  const debounceRef = useRef();

  const { createGroup } = useGroupChatStore();
  const { authUser } = useAuthStore();
  const me = currentUser || authUser;

  // Load users on mount
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get('/messages/users');
        const usersData = res.data;
        setUsers(usersData);
        setVisible(usersData);
      } catch (error) {
        console.error('Error loading users:', error);
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  // Search filter (debounced)
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const q = query.trim().toLowerCase();
      const filtered = !q
        ? users
        : users.filter((u) => (u.name || u.fullName || '').toLowerCase().includes(q));
      setVisible(filtered);
    }, 150);

    return () => clearTimeout(debounceRef.current);
  }, [query, users]);

  const reset = () => {
    setGroupName('');
    setQuery('');
    setSelectedIds(new Set());
    setVisible(users);
  };

  const toggle = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const canCreate = selectedIds.size >= 2;

  const onCreate = async () => {
    if (!canCreate) return toast('Pick at least 2 people ❗');
    if (!me?._id) return toast.error('User not logged in');

    try {
      setCreating(true);

      // Include current user in members
      const members = Array.from(new Set([...selectedIds, me._id]));

      const groupData = {
        name: groupName || 'New Group',
        members,
      };

      const result = await createGroup(groupData);

      if (result && result.success) {
        toast.success('Group created ✔️');
        reset();
        if (onGroupCreated) onGroupCreated(result.group);
      }
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Failed to create group');
    } finally {
      setCreating(false);
    }
  };

  const handleCancel = () => {
    reset();
    if (onCancel) onCancel();
  };

  if (loading) {
    return (
      <div className="h-screen w-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto mb-2"></div>
          <div className="text-slate-500">Loading users...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-white flex flex-col">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 flex items-center justify-between bg-yellow-400 px-4 py-3 shadow-sm">
        <button onClick={handleCancel} className="text-blue-800 font-medium hover:underline">
          Cancel
        </button>
        <div className="text-lg font-semibold text-black flex items-center gap-1">
          New group <span role="img" aria-label="group">👥</span>
        </div>
        <button
          className={`font-semibold ${
            canCreate && !creating ? 'text-blue-800 hover:underline' : 'text-black/40 cursor-not-allowed'
          }`}
          onClick={onCreate}
          disabled={!canCreate || creating || !me?._id}
          title={!canCreate ? 'Pick at least 2 people' : 'Create group'}
        >
          {creating ? 'Creating...' : canCreate ? `Create (${selectedIds.size})` : 'Create'}
        </button>
      </div>

      {/* Group name row */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-yellow-300 bg-yellow-100">
        <input
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="flex-1 bg-transparent outline-none placeholder:text-black/60 text-black"
          placeholder="Group Name (optional)"
          maxLength={50}
        />
        {/* Create button near the chevron location */}
        <button
          onClick={onCreate}
          disabled={!canCreate || creating || !me?._id}
          title={!canCreate ? 'Pick at least 2 people' : 'Create group'}
          className={`px-3 py-1 rounded-md text-sm font-semibold transition
            ${canCreate && !creating && me?._id
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-black/10 text-black/50 cursor-not-allowed'}`}
        >
          {creating ? 'Creating…' : `Create${canCreate ? ` (${selectedIds.size})` : ''}`}
        </button>
      </div>

      {/* Sticky Search */}
      <div className="sticky top-[60px] z-10 px-4 py-3 border-b bg-white">
        <div className="rounded-md bg-slate-200/70 px-3 py-2 flex items-center gap-2">
          <span className="text-slate-500">🔎</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="w-full bg-transparent outline-none text-slate-800 placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Available users label */}
      <div className="px-4 pt-2 text-xs text-slate-500">Available Users ({visible.length})</div>

      {/* Scrollable list area */}
      <div className="flex-1 overflow-auto">
        {visible.map((u, idx) => (
          <div key={u._id}>
            <button
              onClick={() => toggle(u._id)}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors"
            >
              <img
                src={u.avatarUrl || u.profilePic || `https://i.pravatar.cc/100?u=${u._id}`}
                alt={u.name || u.fullName}
                className="h-9 w-9 rounded-full object-cover"
              />
              <div className="flex-1 text-left">
                <div className="text-[15px] text-slate-900">{u.name || u.fullName}</div>
              </div>
              {selectedIds.has(u._id) && <span className="text-green-600 text-lg">✔️</span>}
            </button>
            {idx < visible.length - 1 && <div className="mx-16 border-t border-slate-200" />}
          </div>
        ))}
        {visible.length === 0 && (
          <div className="px-4 py-10 text-center text-sm text-slate-500">
            {query ? 'No matches found' : 'No users available'}
          </div>
        )}
      </div>
    </div>
  );
}