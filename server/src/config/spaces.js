// server/src/config/spaces.js
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const endpoint = process.env.SPACES_ENDPOINT;
const cdnBase  = process.env.SPACES_CDN_BASE;
const region   = process.env.SPACES_REGION;
const bucket   = process.env.SPACES_BUCKET;
const accessKeyId     = process.env.SPACES_KEY;
const secretAccessKey = process.env.SPACES_SECRET;

export const spaces = new S3Client({
  region,
  endpoint,
  forcePathStyle: false,
  credentials: { accessKeyId, secretAccessKey }
});

const publicUrl = (key) => `${cdnBase}/${key}`;

const ALLOWED_MIME = new Set([
  "image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif",
  "video/mp4", "video/webm", "video/quicktime"
]);

export async function getPresignedPut({
  key,
  contentType,
  expiresIn = 60,
  publicRead = true
}) {
  if (!key) throw new Error("Missing key");
  if (!contentType) throw new Error("Missing contentType");
  if (!ALLOWED_MIME.has(contentType)) {
    throw new Error(`Disallowed content type: ${contentType}`);
  }

  // 🟦 Log the parameters being used
  // console.log("🔹 [Spaces] Preparing presigned URL:");
  // console.log("    → Bucket:", bucket);
  // console.log("    → Key:", key);
  // console.log("    → ContentType:", contentType);
  // console.log("    → ACL:", publicRead ? "public-read" : "private");
  // console.log("    → Endpoint:", endpoint);

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
    ACL: publicRead ? "public-read" : undefined,
    CacheControl: "public, max-age=31536000, immutable"
  });

  try {
    const uploadUrl = await getSignedUrl(spaces, command, { expiresIn });

    // console.log("✅ [Spaces] Presigned URL created successfully.");
    // console.log("    → Upload URL:", uploadUrl.split("?")[0]);
    // console.log("    → Public URL:", publicUrl(key));
    // console.log("-----------------------------------------------------");

    return {
      uploadUrl,
      fileUrl: publicUrl(key),
      key
    };
  } catch (err) {
    console.error("❌ [Spaces] Failed to create presigned URL:", err);
    throw err;
  }
}