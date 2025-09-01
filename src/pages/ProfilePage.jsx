import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore.js";
import { Camera, Mail, User, Target } from "lucide-react"; // Make sure to import 'Target' icon

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const [universityName, setUniversityName] = useState(authUser?.universityName || "");
  const [Job, setJob] = useState(authUser?.Job || "");

  useEffect(() => {
    // No need to call fetchUserData here, as we're using authUser from useAuthStore directly
  }, []); // Empty array ensures it only runs once when the component mounts

  // Function to handle image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image); // Set the preview image
      await updateProfile({ profilePic: base64Image });
      setSelectedImg(null); // Reset after the update
    };
  };

  // Function to update university name
  const handleUniversityUpdate = async () => {
    await updateProfile({ universityName });
  };

  // Function to update experience level
  const handleJobUpdate = async () => {
    await updateProfile({ Job });
  };

  return (
    <div className="bg-[#1f1f1f] "> {/* Dark background for the profile page */}
      <div className="pt-20">
        <div className="max-w-2xl mx-auto p-4 py-8 bg-base-300 rounded-xl">
          <div className="p-6 space-y-8">
            <div className="text-center">
              <h1 className="text-2xl font-semibold">Profile</h1>
              <p className="mt-2">Your Profile</p>
            </div>

            {/* Avatar Upload Section */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <img
                  src={selectedImg || authUser.profilePic || "/avatar.png"}
                  alt="Profile"
                  className="size-32 rounded-full object-cover border-4"
                />
                <label
                  htmlFor="avatar-upload"
                  className={`absolute bottom-0 right-0 bg-base-content hover:scale-105 p-2 rounded-full cursor-pointer transition-all duration-200 ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}`}
                >
                  <Camera className="w-5 h-5 text-base-200" />
                  <input
                    type="file"
                    id="avatar-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUpdatingProfile}
                  />
                </label>
              </div>
              <p className="text-sm text-zinc-400">
                {isUpdatingProfile ? "Uploading..." : "Click the camera icon to update your photo"}
              </p>
            </div>

            {/* Full Name Section */}
            <div className="space-y-6">
              <div className="space-y-1.5">
                <div className="text-sm text-zinc-400 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name
                </div>
                <div className="flex gap-2">
                  <p className="px-4 py-2.5 bg-base-200 rounded-lg border flex-1">
                    {authUser?.fullName}
                  </p>
                </div>
              </div>

              {/* Email Section */}
              <div className="space-y-1.5">
                <div className="text-sm text-zinc-400 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </div>
                <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.email}</p>
              </div>
            </div>

            {/* University Name */}
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                University Name
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={universityName}
                  onChange={(e) => setUniversityName(e.target.value)}
                  className="px-4 py-2.5 bg-base-200 rounded-lg border flex-1"
                  placeholder="Enter your university name"
                  disabled={isUpdatingProfile}
                />
                <button
                  className="btn btn-primary"
                  onClick={handleUniversityUpdate}
                  disabled={isUpdatingProfile}
                >
                  Update
                </button>
              </div>
            </div>

            {/* Experience Level */}
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                Job Description
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={Job}
                  onChange={(e) => setJob(e.target.value)}
                  className="px-4 py-2.5 bg-base-200 rounded-lg border flex-1"
                  placeholder="Enter your job description"
                  disabled={isUpdatingProfile}
                />
                <button
                  className="btn btn-primary"
                  onClick={handleJobUpdate}
                  disabled={isUpdatingProfile}
                >
                  Update
                </button>
              </div>
            </div>

            {/* Account Information */}
            <div className="mt-6 bg-base-300 rounded-xl p-6">
              <h2 className="text-lg font-medium mb-4">Account Information</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                  <span>Member Since</span>
                  <span>{authUser.createdAt?.split("T")[0]}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span>Account Status</span>
                  <span className="text-green-500">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
