import { useRef, useState } from "react";
import { motion } from "motion/react";
import { Pencil, Camera } from "lucide-react";

type ProfileDetails = {
  displayName: string;
  email: string;
  phoneNumber: string;
  bio: string;
  avatarUrl: string | null;
};

type AccountSettingsProps = {
  initialDetails?: ProfileDetails;
  onChangePassword?: () => void;
  onSaveField?: (field: keyof ProfileDetails, value: string) => void;
};

const defaultDetails: ProfileDetails = {
  displayName: "John Doe",
  email: "johndoe@example.com",
  phoneNumber: "+27 72 123 4567",
  bio: "",
  avatarUrl: null,
};

export default function AccountSettings({
  initialDetails = defaultDetails,
  onChangePassword,
  onSaveField,
}: AccountSettingsProps) {
  const [details, setDetails] =
    useState<ProfileDetails>(initialDetails);

  const [editingField, setEditingField] = useState<
    keyof ProfileDetails | null
  >(null);

  const [draftValue, setDraftValue] = useState("");

  const [previewAvatar, setPreviewAvatar] = useState<string | null>(
    initialDetails.avatarUrl
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const startEditing = (field: keyof ProfileDetails) => {
    if (field === "avatarUrl") return;

    setEditingField(field);
    setDraftValue(String(details[field] ?? ""));
  };

  const cancelEditing = () => {
    setEditingField(null);
    setDraftValue("");
  };

  const saveEditing = () => {
    if (!editingField) return;

    const value = draftValue.trim();

    // Bio is allowed to be empty.
    if (!value && editingField !== "bio") return;

    setDetails((prev) => ({
      ...prev,
      [editingField]: value,
    }));

    onSaveField?.(editingField, value);

    cancelEditing();
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const imageUrl = URL.createObjectURL(file);

    setPreviewAvatar(imageUrl);
    setDetails((prev) => ({
      ...prev,
      avatarUrl: imageUrl,
    }));

    // Backend upload will be added later.
  };

  const fields: {
    key: keyof ProfileDetails;
    label: string;
  }[] = [
    {
      key: "displayName",
      label: "Display Name",
    },
    {
      key: "email",
      label: "Email",
    },
    {
      key: "phoneNumber",
      label: "Phone Number",
    },
    {
      key: "bio",
      label: "Bio",
    },
  ];

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      {/* Header */}
      <div className="px-4 py-3 shrink-0">
        <h2 className="text-lg font-bold text-white">
          Account Settings
        </h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">

        {/* Profile Picture */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center py-5"
        >
          <div className="relative">
            {/* Avatar */}
            <div className="h-24 w-24 overflow-hidden rounded-full bg-white/10 flex items-center justify-center">
              {previewAvatar ? (
                <img
                  src={previewAvatar}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-white/40">
                  {details.displayName
                    .charAt(0)
                    .toUpperCase()}
                </span>
              )}
            </div>

            {/* Camera button */}
            <motion.button
              type="button"
              onClick={handleAvatarClick}
              whileTap={{ scale: 0.9 }}
              className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-lg"
              aria-label="Upload profile picture"
            >
              <Camera size={15} className="text-black" />
            </motion.button>
          </div>

          <button
            type="button"
            onClick={handleAvatarClick}
            className="mt-3 text-xs font-semibold text-orange-400"
          >
            {previewAvatar
              ? "Change Profile Picture"
              : "Upload Profile Picture"}
          </button>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </motion.div>

        {/* Profile Details */}
        <div className="flex flex-col gap-2">
          {fields.map(({ key, label }, index) => {
            const isEditing = editingField === key;

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.04,
                  ease: "easeOut",
                }}
                className="rounded-xl bg-white/5 px-4 py-3"
              >
                {/* Label */}
                <p className="text-xs font-medium text-white/50 mb-1">
                  {label}
                </p>

                {/* Value + controls */}
                <div className="flex items-center gap-3">
                  {isEditing ? (
                    key === "bio" ? (
                      <textarea
                        value={draftValue}
                        onChange={(e) =>
                          setDraftValue(e.target.value)
                        }
                        autoFocus
                        rows={3}
                        placeholder="Tell people a little about yourself..."
                        className="flex-1 resize-none bg-transparent text-sm text-white outline-none border-b border-white/30 focus:border-orange-400 pb-1"
                      />
                    ) : (
                      <input
                        type={key === "email" ? "email" : "text"}
                        value={draftValue}
                        onChange={(e) =>
                          setDraftValue(e.target.value)
                        }
                        autoFocus
                        className="flex-1 bg-transparent text-sm text-white outline-none border-b border-white/30 focus:border-orange-400 pb-0.5"
                      />
                    )
                  ) : (
                    <span
                      className={`flex-1 text-sm ${
                        details[key]
                          ? "text-white"
                          : "text-white/30"
                      } ${
                        key === "bio"
                          ? "whitespace-pre-wrap"
                          : "truncate"
                      }`}
                    >
                      {details[key] ||
                        (key === "bio"
                          ? "No bio added"
                          : "Not provided")}
                    </span>
                  )}

                  {isEditing ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={cancelEditing}
                        className="text-xs font-semibold text-white/60"
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        onClick={saveEditing}
                        className="text-xs font-semibold text-orange-400"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <motion.button
                      type="button"
                      onClick={() => startEditing(key)}
                      aria-label={`Edit ${label}`}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 active:bg-white/20 shrink-0"
                      whileTap={{ scale: 0.9 }}
                    >
                      <Pencil
                        size={14}
                        className="text-white"
                      />
                    </motion.button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Change Password */}
        <motion.button
          type="button"
          onClick={onChangePassword}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            delay: (fields.length + 1) * 0.04,
            ease: "easeOut",
          }}
          whileTap={{ scale: 0.97 }}
          className="mt-4 h-12 w-full flex items-center justify-center rounded-xl bg-white active:bg-zinc-200"
        >
          <span className="text-sm font-bold text-black">
            Change Password
          </span>
        </motion.button>
      </div>
    </div>
  );
}