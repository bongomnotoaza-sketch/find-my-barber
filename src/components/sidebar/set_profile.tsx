import { useRef, useState } from "react";
import { Camera, Check } from "lucide-react";
import { motion } from "motion/react";

type ProfileSetupProps = {
  onContinue?: (details: {
    displayName: string;
    bio: string;
    avatar: {
      type: "default" | "upload";
      emoji?: string;
      background?: string;
      file?: File;
    };
  }) => void;
};

const avatarEmojis = [
  "😎",
  "🧔🏽",
  "👨🏾‍🦱",
  "👨🏿‍🦲",
  "👨🏼‍🎨",
  "👨🏽‍🚀",
  "🧑🏾‍💻",
  "🧑🏽‍🎤",
  "🤠",
  "🥸",
  "😈",
  "👽",
];

const avatarBackgrounds = [
  "bg-red-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-yellow-500",
  "bg-lime-500",
  "bg-green-500",
  "bg-emerald-500",
  "bg-teal-500",
  "bg-cyan-500",
  "bg-sky-500",
  "bg-blue-500",
  "bg-indigo-500",
];

const defaultAvatars = avatarEmojis.map((emoji, index) => ({
  emoji,
  background:
    avatarBackgrounds[index % avatarBackgrounds.length],
}));

export default function ProfileSetup({
  onContinue,
}: ProfileSetupProps) {
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [uploadedImage, setUploadedImage] = useState<string | null>(
    null
  );
  const [uploadedFile, setUploadedFile] = useState<File | null>(
    null
  );

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedDefaultAvatar = defaultAvatars[selectedAvatar];

  const chooseDefaultAvatar = (index: number) => {
    setSelectedAvatar(index);
    setUploadedImage(null);
    setUploadedFile(null);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const imageUrl = URL.createObjectURL(file);

    setUploadedImage(imageUrl);
    setUploadedFile(file);
  };

  const handleContinue = () => {
    onContinue?.({
      displayName: displayName.trim(),
      bio: bio.trim(),
      avatar: uploadedFile
        ? {
            type: "upload",
            file: uploadedFile,
          }
        : {
            type: "default",
            emoji: selectedDefaultAvatar.emoji,
            background: selectedDefaultAvatar.background,
          },
    });
  };

  return (
    <div className="min-h-dvh bg-zinc-950 text-white flex flex-col">
      {/* Header */}
      <div className="px-5 pt-8 pb-4">
        <h1 className="text-2xl font-bold">
          Set up your profile
        </h1>

        <p className="mt-1 text-sm text-white/50">
          Add a few details so people know who you are.
        </p>
      </div>

      {/* Main */}
      <div className="flex-1 overflow-y-auto px-5 pb-6">

        {/* Large Avatar */}
        <div className="flex justify-center pt-6 pb-5">
          <motion.div
            key={uploadedImage ?? selectedAvatar}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`relative h-32 w-32 rounded-full ${
              uploadedImage
                ? "bg-white/10"
                : selectedDefaultAvatar.background
            } flex items-center justify-center overflow-hidden`}
          >
            {uploadedImage ? (
              <img
                src={uploadedImage}
                alt="Selected profile"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-6xl">
                {selectedDefaultAvatar.emoji}
              </span>
            )}

            {/* Upload overlay */}
            <button
              type="button"
              onClick={handleUploadClick}
              className="absolute bottom-1 right-1 h-9 w-9 rounded-full bg-white flex items-center justify-center shadow-lg"
              aria-label="Upload profile picture"
            >
              <Camera
                size={17}
                className="text-black"
              />
            </button>
          </motion.div>
        </div>

        {/* Default avatars */}
        <div>
          <p className="mb-2 text-xs font-medium text-white/50">
            Choose an avatar
          </p>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {defaultAvatars.map((avatar, index) => {
              const selected =
                !uploadedImage &&
                selectedAvatar === index;

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() =>
                    chooseDefaultAvatar(index)
                  }
                  className={`relative shrink-0 h-14 w-14 rounded-full ${
                    avatar.background
                  } flex items-center justify-center text-2xl ${
                    selected
                      ? "ring-2 ring-white ring-offset-2 ring-offset-zinc-950"
                      : ""
                  }`}
                >
                  {avatar.emoji}

                  {selected && (
                    <span className="absolute -right-1 -bottom-1 h-5 w-5 rounded-full bg-white flex items-center justify-center">
                      <Check
                        size={12}
                        className="text-black"
                      />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Upload */}
        <button
          type="button"
          onClick={handleUploadClick}
          className={`mt-3 w-full h-11 rounded-xl border ${
            uploadedImage
              ? "border-orange-400/50 bg-orange-400/10"
              : "border-white/10 bg-white/5"
          } flex items-center justify-center gap-2`}
        >
          <Camera size={16} />

          <span className="text-sm font-semibold">
            {uploadedImage
              ? "Change profile picture"
              : "Upload your own picture"}
          </span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleImageUpload}
          className="hidden"
        />

        {/* Display Name */}
        <div className="mt-6">
          <label className="block mb-2 text-xs font-medium text-white/50">
            Display Name
          </label>

          <input
            type="text"
            value={displayName}
            onChange={(e) =>
              setDisplayName(e.target.value)
            }
            placeholder="How should we call you?"
            className="w-full h-12 rounded-xl bg-white/5 border border-white/10 px-4 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/30"
          />
        </div>

        {/* Bio */}
        <div className="mt-4">
          <label className="block mb-2 text-xs font-medium text-white/50">
            Bio
          </label>

          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us a little about yourself..."
            rows={4}
            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none resize-none focus:border-white/30"
          />
        </div>
      </div>

      {/* Continue */}
      <div className="px-5 pb-6 pt-3">
        <motion.button
          type="button"
          onClick={handleContinue}
          whileTap={{ scale: 0.97 }}
          disabled={!displayName.trim()}
          className="w-full h-12 rounded-xl bg-white text-black font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Continue
        </motion.button>
      </div>
    </div>
  );
}