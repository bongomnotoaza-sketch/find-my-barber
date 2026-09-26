import { supabase } from "./superbase"; 
export async function uploadAvatar(
  userId: string,
  file: File
): Promise<string> {
  if (!userId) {
    throw new Error("User ID is required");
  }

  if (!file) {
    throw new Error("Avatar file is required");
  }

  // Get the file extension
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";

  // Store every user's avatar in their own folder
  const filePath = `${userId}/avatar.${extension}`;

  // Upload the image to the avatars bucket
  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type,
    });

  if (uploadError) {
    throw new Error(`Avatar upload failed: ${uploadError.message}`);
  }

  // Save the storage path in profiles.avatar_path
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      avatar_path: filePath,
    })
    .eq("id", userId);

  if (profileError) {
    throw new Error(
      `Avatar path could not be saved: ${profileError.message}`
    );
  }

  return filePath;
}