import { useRef, useState } from "react";
import { Camera, Check, X } from "lucide-react";
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
    barberProfile: {
      shopName: string;
      address: string;
      whatsapp: string;
      phone: string;
      email: string;
      instagram: string;
      facebook: string;
      twitter: string;
      accountNumber: string;
      accountHolder: string;
    };
  }) => void;
  onClose?: () => void;
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

export default function BarberProfileSetup({
  onContinue,
  onClose,
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

  // Barber Profile states
  const [shopName, setShopName] = useState("");
  const [address, setAddress] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [twitter, setTwitter] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");

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
      barberProfile: {
        shopName: shopName.trim(),
        address: address.trim(),
        whatsapp: whatsapp.trim(),
        phone: phone.trim(),
        email: email.trim(),
        instagram: instagram.trim(),
        facebook: facebook.trim(),
        twitter: twitter.trim(),
        accountNumber: accountNumber.trim(),
        accountHolder: accountHolder.trim(),
      },
    });
  };

  return (
    // CHANGED: h-dvh (fixed height) instead of min-h-dvh + overflow-scroll
    <div className="h-dvh bg-zinc-950 text-white flex flex-col">
      {/* Header */}
      <div className="relative shrink-0 px-5 pt-8 pb-4">
        <h1 className="text-2xl font-bold">
          Barber Set up your profile
        </h1>

        <p className="mt-1 text-sm text-white/50">
          Add a few details so people know who you are.
        </p>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-6 right-5 h-10 w-10 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Main — CHANGED: added min-h-0 so it can actually shrink & scroll */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-6">

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

            <button
              type="button"
              onClick={handleUploadClick}
              className="absolute bottom-1 right-1 h-9 w-9 rounded-full bg-white flex items-center justify-center shadow-lg"
              aria-label="Upload profile picture"
            >
              <Camera size={17} className="text-black" />
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
                !uploadedImage && selectedAvatar === index;

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => chooseDefaultAvatar(index)}
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
                      <Check size={12} className="text-black" />
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
            onChange={(e) => setDisplayName(e.target.value)}
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

        {/* ===== BARBER PROFILE SECTION ===== */}
        <div className="mt-6">
          <h2 className="text-base font-bold text-white">
            Barber Profile
          </h2>

          <p className="mt-1 text-sm text-white/40">
            Add your barber shop and contact details.
          </p>
        </div>

        {/* Shop Name */}
        <div className="mt-5">
          <label className="block mb-2 text-xs font-medium text-white/50">
            Shop Name
          </label>

          <input
            type="text"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            placeholder="Your shop name"
            className="w-full h-12 rounded-xl bg-white/5 border border-white/10 px-4 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/30"
          />
        </div>

        {/* Address */}
        <div className="mt-4">
          <label className="block mb-2 text-xs font-medium text-white/50">
            Address
          </label>

          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Shop address"
            className="w-full h-12 rounded-xl bg-white/5 border border-white/10 px-4 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/30"
          />
        </div>

        {/* WhatsApp */}
        <div className="mt-4">
          <label className="block mb-2 text-xs font-medium text-white/50">
            WhatsApp
          </label>

          <input
            type="tel"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="+27 ..."
            className="w-full h-12 rounded-xl bg-white/5 border border-white/10 px-4 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/30"
          />
        </div>

        {/* Phone */}
        <div className="mt-4">
          <label className="block mb-2 text-xs font-medium text-white/50">
            Phone
          </label>

          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+27 ..."
            className="w-full h-12 rounded-xl bg-white/5 border border-white/10 px-4 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/30"
          />
        </div>

        {/* Email */}
        <div className="mt-4">
          <label className="block mb-2 text-xs font-medium text-white/50">
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="shop@example.com"
            className="w-full h-12 rounded-xl bg-white/5 border border-white/10 px-4 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/30"
          />
        </div>

        {/* Instagram */}
        <div className="mt-4">
          <label className="block mb-2 text-xs font-medium text-white/50">
            Instagram
          </label>

          <input
            type="text"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="@yourshop"
            className="w-full h-12 rounded-xl bg-white/5 border border-white/10 px-4 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/30"
          />
        </div>

        {/* Facebook */}
        <div className="mt-4">
          <label className="block mb-2 text-xs font-medium text-white/50">
            Facebook
          </label>

          <input
            type="text"
            value={facebook}
            onChange={(e) => setFacebook(e.target.value)}
            placeholder="Facebook page"
            className="w-full h-12 rounded-xl bg-white/5 border border-white/10 px-4 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/30"
          />
        </div>

        {/* Twitter */}
        <div className="mt-4">
          <label className="block mb-2 text-xs font-medium text-white/50">
            Twitter / X
          </label>

          <input
            type="text"
            value={twitter}
            onChange={(e) => setTwitter(e.target.value)}
            placeholder="@yourshop"
            className="w-full h-12 rounded-xl bg-white/5 border border-white/10 px-4 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/30"
          />
        </div>

        {/* Account Number */}
        <div className="mt-4">
          <label className="block mb-2 text-xs font-medium text-white/50">
            Account Number
          </label>

          <input
            type="text"
            inputMode="numeric"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            placeholder="Bank account number"
            className="w-full h-12 rounded-xl bg-white/5 border border-white/10 px-4 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/30"
          />
        </div>

        {/* Account Holder */}
        <div className="mt-4">
          <label className="block mb-2 text-xs font-medium text-white/50">
            Account Holder
          </label>

          <input
            type="text"
            value={accountHolder}
            onChange={(e) => setAccountHolder(e.target.value)}
            placeholder="Account holder name"
            className="w-full h-12 rounded-xl bg-white/5 border border-white/10 px-4 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/30"
          />
        </div>
        {/* ===== END BARBER PROFILE SECTION ===== */}

      </div>

      {/* Continue — CHANGED: shrink-0 so it never gets squeezed */}
      <div className="shrink-0 px-5 pb-6 pt-3">
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