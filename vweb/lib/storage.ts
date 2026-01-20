import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const endpoint = process.env.ENDPOINT;
const accessKeyId = process.env.KEY;
const secretAccessKey = process.env.KEY_SECRET;
const bucket = process.env.SPACES_BUCKET;

if (!endpoint || !accessKeyId || !secretAccessKey) {
  console.warn("DigitalOcean Spaces is not fully configured (ENDPOINT/KEY/KEY_SECRET missing)");
}

const s3 = new S3Client({
  region: "fra1", // DigitalOcean Spaces region
  endpoint,
  credentials: accessKeyId && secretAccessKey ? { accessKeyId, secretAccessKey } : undefined,
  forcePathStyle: false,
});

function sanitizePathPart(part: string): string {
  return part
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/gi, "-")
    .replace(/^-+|-+$/g, "");
}

export async function uploadFileToSpace(opts: {
  file: File;
  email: string;
  sectionKey: string;
}): Promise<{ key: string } | null> {
  if (!bucket || !endpoint || !accessKeyId || !secretAccessKey) {
    console.error("DigitalOcean Spaces is not configured; skipping upload");
    return null;
  }

  const { file, email, sectionKey } = opts;
  const emailPart = sanitizePathPart(email);
  const sectionPart = sanitizePathPart(sectionKey);

  const key = `${emailPart}/${sectionPart}/${file.name}`;

  const arrayBuffer = await file.arrayBuffer();
  const body = Buffer.from(arrayBuffer);

  const contentType = file.type || "application/octet-stream";

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      ACL: "private",
    })
  );

  return { key };
}

export async function deleteFileFromSpace(opts: {
  email: string;
  sectionKey: string;
  fileName: string;
}): Promise<void> {
  if (!bucket || !endpoint || !accessKeyId || !secretAccessKey) {
    console.error("DigitalOcean Spaces is not configured; skipping delete");
    return;
  }

  const emailPart = sanitizePathPart(opts.email);
  const sectionPart = sanitizePathPart(opts.sectionKey);
  const filePart = sanitizePathPart(opts.fileName);

  const key = `${emailPart}/${sectionPart}/${filePart}`;

  try {
    await s3.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );
  } catch (error) {
    console.error("Failed to delete file from Space", { key, error });
  }
}
