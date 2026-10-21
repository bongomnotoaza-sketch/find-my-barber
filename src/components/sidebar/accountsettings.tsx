import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Pencil, Camera } from "lucide-react";
import {
  getMyProfile,
  getAvatarUrl,
  type Profile,
} from "../../lib/get_profile";
import { putProfile } from "../../lib/profiles";
import { getMyBarberProfileRead } from "../../lib/get_barber_profiles";
import {
  saveBarberProfile,
  putBarberLocationImage,
  getBarberLocationImageUrl,
  type CreateBarberProfileInput,
} from "../../lib/barber_profiles";

type EditableField =
  | "display_name"
  | "email"
  | "phone_number"
  | "bio"
  // barber-only text fields
  | "shop_name"
  | "address"
  | "whatsapp"
  | "phone"
  | "barber_email"
  | "instagram"
  | "facebook"
  | "twitter"
  | "account_number"
  | "account_holder";

/** Barber text fields (business location image is handled separately). */
type BarberTextField = Exclude<
  EditableField,
  "display_name" | "email" | "phone_number" | "bio"
>;

type AccountSettingsProps = {
  /** Show the barber-only fields. */
  isBarber?: boolean;
  onChangePassword?: () => void;
  onSaveField?: (
    field: EditableField | "buisness_loction_image_path",
    value: string
  ) => void;
};

const BARBER_TEXT_FIELDS: { key: BarberTextField; label: string }[] = [
  { key: "shop_name", label: "Shop Name" },
  { key: "address", label: "Address" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "phone", label: "Phone" },
  { key: "barber_email", label: "Email" },
  { key: "instagram", label: "Instagram" },
  { key: "facebook", label: "Facebook" },
  { key: "twitter", label: "Twitter" },
  { key: "account_number", label: "Account Number" },
  { key: "account_holder", label: "Account Holder" },
];

const emptyBarberValues: Record<BarberTextField, string> = {
  shop_name: "",
  address: "",
  whatsapp: "",
  phone: "",
  barber_email: "",
  instagram: "",
  facebook: "",
  twitter: "",
  account_number: "",
  account_holder: "",
};

export default function AccountSettings({
  isBarber = false,
  onChangePassword,
  onSaveField,
}: AccountSettingsProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ kind: string; reason: string } | null>(
    null
  );

  const [editingField, setEditingField] = useState<EditableField | null>(
    null
  );
  const [draftValue, setDraftValue] = useState("");

  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Barber values (loaded from barber_profiles; empty when missing).
  const [barberValues, setBarberValues] =
    useState<Record<BarberTextField, string>>(emptyBarberValues);

  // Business location image (public URL for display).
  const [locationPreview, setLocationPreview] = useState<string | null>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ---------- Load profile (and barber profile if isBarber) ---------- */

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const res = await getMyProfile();

      if (cancelled) return;

      if (res.ok === false) {
        setError({ kind: res.kind, reason: res.reason });
        setLoading(false);
        return;
      }

      setProfile(res.profile);
      setPreviewAvatar(getAvatarUrl(res.profile.avatar_path));

      // Load barber fields when this is a barber.
      if (isBarber) {
        const barberRes = await getMyBarberProfileRead();

        if (cancelled) return;

        if (barberRes.success) {
          const b = barberRes.data;

          setBarberValues({
            shop_name: b.shop_name ?? "",
            address: b.address ?? "",
            whatsapp: b.whatsapp ?? "",
            phone: b.phone ?? "",
            barber_email: b.email ?? "",
            instagram: b.instagram ?? "",
            facebook: b.facebook ?? "",
            twitter: b.twitter ?? "",
            account_number: b.account_number ?? "",
            account_holder: b.account_holder ?? "",
          });

          // Resolve the stored path to a public URL for display.
          setLocationPreview(
            getBarberLocationImageUrl(b.buisness_loction_image_path)
          );
        } else {
          // Not found / not a barber yet: leave everything empty.
          setBarberValues(emptyBarberValues);
          setLocationPreview(null);
        }
      }

      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [isBarber]);

  const avatarUrl =
    previewAvatar ?? (profile ? getAvatarUrl(profile.avatar_path) : null);

  /* ---------- Editing ---------- */

  const startEditing = (field: EditableField) => {
    setSaveError(null);
    setEditingField(field);

    if (field in barberValues) {
      setDraftValue(barberValues[field as BarberTextField] ?? "");
    } else {
      setDraftValue(String(profile?.[field as keyof Profile] ?? ""));
    }
  };

  const cancelEditing = () => {
    setEditingField(null);
    setDraftValue("");
    setSaveError(null);
  };

  const saveEditing = async () => {
    if (!editingField || profile === null || saving) return;

    const value = draftValue.trim();

    // Bio is allowed to be empty.
    if (!value && editingField !== "bio") return;

    setSaving(true);
    setSaveError(null);

    /* ---- Barber text fields → saveBarberProfile (PUT if exists, POST if not) ---- */
    if (editingField in barberValues) {
      const key = editingField as BarberTextField;

      // Map the local field name to the DB column name.
      const input: Partial<CreateBarberProfileInput> = {};
      if (key === "barber_email") input.email = value;
      else input[key] = value;

      const result = await saveBarberProfile(input);

      setSaving(false);

      if (!result.success) {
        setSaveError(result.error);
        return;
      }

      // Re-seed from the saved row so all fields stay in sync.
      const b = result.data;
      setBarberValues({
        shop_name: b.shop_name ?? "",
        address: b.address ?? "",
        whatsapp: b.whatsapp ?? "",
        phone: b.phone ?? "",
        barber_email: b.email ?? "",
        instagram: b.instagram ?? "",
        facebook: b.facebook ?? "",
        twitter: b.twitter ?? "",
        account_number: b.account_number ?? "",
        account_holder: b.account_holder ?? "",
      });

      onSaveField?.(editingField, value);
      cancelEditing();
      return;
    }

    /* ---- Profile fields → putProfile ---- */
    const input: {
      displayName?: string;
      bio?: string;
      email?: string;
      phoneNumber?: string;
    } = {};

    if (editingField === "display_name") input.displayName = value;
    else if (editingField === "bio") input.bio = value;
    else if (editingField === "email") input.email = value;
    else if (editingField === "phone_number") input.phoneNumber = value;

    const result = await putProfile(input);

    setSaving(false);

    if (!result.success) {
      setSaveError(result.error);
      return;
    }

    setProfile((prev) => (prev ? { ...prev, [editingField]: value } : prev));

    onSaveField?.(editingField, value);

    cancelEditing();
  };

  /* ---------- Avatar ---------- */

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setPreviewAvatar(imageUrl);

    setSaving(true);
    setSaveError(null);

    const result = await putProfile({ avatarFile: file });

    setSaving(false);

    if (!result.success) {
      setSaveError(result.error);
      return;
    }

    const refreshed = await getMyProfile();
    if (refreshed.ok) {
      setProfile(refreshed.profile);
      setPreviewAvatar(getAvatarUrl(refreshed.profile.avatar_path));
    }
  };

  /* ---------- Business location image ---------- */

  const handleLocationClick = () => {
    locationInputRef.current?.click();
  };

  const handleLocationChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    // Instant local preview.
    const previewUrl = URL.createObjectURL(file);
    setLocationPreview(previewUrl);

    setSaving(true);
    setSaveError(null);

    const result = await putBarberLocationImage({ file });

    setSaving(false);

    if (!result.success) {
      setSaveError(result.error);
      return;
    }

    // Swap the blob preview for the canonical public URL.
    setLocationPreview(
      getBarberLocationImageUrl(result.data.buisness_loction_image_path)
    );
  };

  /* ---------- Field definitions ---------- */

  const profileFields: { key: EditableField; label: string }[] = [
    { key: "display_name", label: "Display Name" },
    { key: "email", label: "Email" },
    { key: "phone_number", label: "Phone Number" },
    { key: "bio", label: "Bio" },
  ];

  const getFieldValue = (key: EditableField): string => {
    if (key in barberValues) {
      return barberValues[key as BarberTextField] ?? "";
    }
    return String(profile?.[key as keyof Profile] ?? "");
  };

  const renderField = (
    key: EditableField,
    label: string,
    index: number
  ) => {
    const isEditing = editingField === key;
    const value = getFieldValue(key);

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
        <p className="text-xs font-medium text-white/50 mb-1">{label}</p>

        <div className="flex items-center gap-3">
          {isEditing ? (
            key === "bio" ? (
              <textarea
                value={draftValue}
                onChange={(e) => setDraftValue(e.target.value)}
                autoFocus
                rows={3}
                placeholder="Tell people a little about yourself..."
                className="flex-1 resize-none bg-transparent text-sm text-white outline-none border-b border-white/30 focus:border-orange-400 pb-1"
              />
            ) : (
              <input
                type={
                  key === "email" || key === "barber_email"
                    ? "email"
                    : key === "phone" || key === "phone_number"
                    ? "tel"
                    : "text"
                }
                value={draftValue}
                onChange={(e) => setDraftValue(e.target.value)}
                autoFocus
                className="flex-1 bg-transparent text-sm text-white outline-none border-b border-white/30 focus:border-orange-400 pb-0.5"
              />
            )
          ) : (
            <span
              className={`flex-1 text-sm ${
                value ? "text-white" : "text-white/30"
              } ${key === "bio" ? "whitespace-pre-wrap" : "truncate"}`}
            >
              {value || (key === "bio" ? "No bio added" : "Not provided")}
            </span>
          )}

          {isEditing ? (
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={cancelEditing}
                disabled={saving}
                className="text-xs font-semibold text-white/60 disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={saveEditing}
                disabled={saving}
                className="text-xs font-semibold text-orange-400 disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          ) : (
            <motion.button
              type="button"
              onClick={() => startEditing(key)}
              disabled={saving}
              aria-label={`Edit ${label}`}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 active:bg-white/20 shrink-0 disabled:opacity-60"
              whileTap={{ scale: 0.9 }}
            >
              <Pencil size={14} className="text-white" />
            </motion.button>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      {/* Header */}
      <div className="px-4 py-3 shrink-0">
        <h2 className="text-lg font-bold text-white">Account Settings</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {loading && (
          <p className="text-sm text-white/60 py-6 text-center">Loading…</p>
        )}

        {!loading && error && (
          <p className="text-sm text-red-400 py-6 text-center">
            {error.kind === "unauthenticated"
              ? "Not signed in."
              : error.reason}
          </p>
        )}

        {!loading && !error && profile && (
          <>
            {/* Profile Picture */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center py-5"
            >
              <div className="relative">
                <div className="h-24 w-24 overflow-hidden rounded-full bg-white/10 flex items-center justify-center">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={profile.display_name ?? "Profile"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-white/40">
                      {(profile.display_name ?? "?").charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                <motion.button
                  type="button"
                  onClick={handleAvatarClick}
                  whileTap={{ scale: 0.9 }}
                  disabled={saving}
                  className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-lg disabled:opacity-60"
                  aria-label="Upload profile picture"
                >
                  <Camera size={15} className="text-black" />
                </motion.button>
              </div>

              <button
                type="button"
                onClick={handleAvatarClick}
                disabled={saving}
                className="mt-3 text-xs font-semibold text-orange-400 disabled:opacity-60"
              >
                {saving
                  ? "Uploading…"
                  : avatarUrl
                  ? "Change Profile Picture"
                  : "Upload Profile Picture"}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </motion.div>

            {saveError && (
              <p className="mb-2 text-xs text-red-400 text-center">
                {saveError}
              </p>
            )}

            {/* Profile Details */}
            <div className="flex flex-col gap-2">
              {profileFields.map(({ key, label }, index) =>
                renderField(key, label, index)
              )}
            </div>

            {/* Barber Details */}
            {isBarber && (
              <>
                <div className="mt-5 mb-2 px-1">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-white/40">
                    Shop Details
                  </h3>
                </div>

                <div className="flex flex-col gap-2">
                  {BARBER_TEXT_FIELDS.map(({ key, label }, index) =>
                    renderField(key, label, profileFields.length + index)
                  )}

                  {/* Business location image — image upload, like the avatar */}
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.3,
                      delay:
                        (profileFields.length + BARBER_TEXT_FIELDS.length) *
                        0.04,
                      ease: "easeOut",
                    }}
                    className="rounded-xl bg-white/5 px-4 py-3"
                  >
                    <p className="text-xs font-medium text-white/50 mb-3">
                      Business Location Image
                    </p>

                    <div className="flex flex-col items-center">
                      <div className="relative">
                        <div className="h-24 w-24 overflow-hidden rounded-xl bg-white/10 flex items-center justify-center">
                          {locationPreview ? (
                            <img
                              src={locationPreview}
                              alt="Business location"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Camera size={26} className="text-white/30" />
                          )}
                        </div>

                        <motion.button
                          type="button"
                          onClick={handleLocationClick}
                          whileTap={{ scale: 0.9 }}
                          disabled={saving}
                          className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-lg disabled:opacity-60"
                          aria-label="Upload business location image"
                        >
                          <Camera size={15} className="text-black" />
                        </motion.button>
                      </div>

                      <button
                        type="button"
                        onClick={handleLocationClick}
                        disabled={saving}
                        className="mt-3 text-xs font-semibold text-orange-400 disabled:opacity-60"
                      >
                        {saving
                          ? "Uploading…"
                          : locationPreview
                          ? "Change Location Image"
                          : "Upload Location Image"}
                      </button>

                      <input
                        ref={locationInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleLocationChange}
                        className="hidden"
                      />
                    </div>
                  </motion.div>
                </div>
              </>
            )}

            {/* Change Password */}
            <motion.button
              type="button"
              onClick={onChangePassword}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
                delay:
                  (profileFields.length +
                    (isBarber ? BARBER_TEXT_FIELDS.length + 1 : 0) +
                    1) *
                  0.04,
                ease: "easeOut",
              }}
              whileTap={{ scale: 0.97 }}
              className="mt-4 h-12 w-full flex items-center justify-center rounded-xl bg-white active:bg-zinc-200"
            >
              <span className="text-sm font-bold text-black">
                Change Password
              </span>
            </motion.button>
          </>
        )}
      </div>
    </div>
  );
}