import { useState } from "react";
import { motion } from "motion/react";
import { Pencil } from "lucide-react";

type ProfileDetails = {
  displayName: string;
  email: string;
  phoneNumber: string;
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
};

export default function AccountSettings({
  initialDetails = defaultDetails,
  onChangePassword,
  onSaveField,
}: AccountSettingsProps) {
  const [details, setDetails] = useState<ProfileDetails>(initialDetails);
  const [editingField, setEditingField] = useState<
    keyof ProfileDetails | null
  >(null);
  const [draftValue, setDraftValue] = useState("");

  const startEditing = (field: keyof ProfileDetails) => {
    setEditingField(field);
    setDraftValue(details[field]);
  };

  const cancelEditing = () => {
    setEditingField(null);
    setDraftValue("");
  };

  const saveEditing = () => {
    if (!editingField) return;
    const value = draftValue.trim();
    if (!value) return;

    setDetails((prev) => ({ ...prev, [editingField]: value }));
    onSaveField?.(editingField, value);
    cancelEditing();
  };

  const fields: { key: keyof ProfileDetails; label: string }[] = [
    { key: "displayName", label: "Display Name" },
    { key: "email", label: "Email" },
    { key: "phoneNumber", label: "Phone Number" },
  ];

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      {/* Header */}
      <div className="px-4 py-3 shrink-0">
        <h2 className="text-lg font-bold text-white">Account Settings</h2>
      </div>

      {/* Profile details */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-2">
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

              {/* Value + pen / edit controls */}
              <div className="flex items-center gap-3">
                {isEditing ? (
                  <input
                    type={key === "email" ? "email" : "text"}
                    value={draftValue}
                    onChange={(e) => setDraftValue(e.target.value)}
                    autoFocus
                    className="flex-1 bg-transparent text-sm text-white outline-none border-b border-white/30 focus:border-white/70 pb-0.5"
                  />
                ) : (
                  <span className="flex-1 text-sm text-white truncate">
                    {details[key]}
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
                    <Pencil size={14} className="text-white" />
                  </motion.button>
                )}
              </div>
            </motion.div>
          );
        })}

        {/* Change password */}
        <motion.button
          type="button"
          onClick={onChangePassword}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            delay: fields.length * 0.04,
            ease: "easeOut",
          }}
          whileTap={{ scale: 0.97 }}
          className="mt-2 h-12 w-full flex items-center justify-center rounded-xl bg-white active:bg-zinc-200"
        >
          <span className="text-sm font-bold text-black">
            Change Password
          </span>
        </motion.button>
      </div>
    </div>
  );
}