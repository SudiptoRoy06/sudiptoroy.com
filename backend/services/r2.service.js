import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3';

let client;

function r2Config() {
  const config = {
    endpoint: process.env.R2_ENDPOINT?.replace(/\/+$/, ''),
    bucket: process.env.R2_BUCKET_NAME,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
  };
  const missing = Object.entries(config).filter(([, value]) => !value).map(([key]) => key);
  if (missing.length) throw new Error(`Missing R2 configuration: ${missing.join(', ')}`);
  return config;
}

function r2Client() {
  if (!client) {
    const config = r2Config();
    client = new S3Client({
      region: 'auto',
      endpoint: config.endpoint,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey
      }
    });
  }
  return client;
}

const bucketName = () => r2Config().bucket;

export async function putObject(key, file) {
  await r2Client().send(new PutObjectCommand({
    Bucket: bucketName(),
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    CacheControl: 'public, max-age=31536000, immutable'
  }));
}

export async function putBuffer(key, buffer, contentType) {
  await r2Client().send(new PutObjectCommand({
    Bucket: bucketName(), Key: key, Body: buffer, ContentType: contentType,
    CacheControl: 'public, max-age=31536000, immutable'
  }));
}

export async function getObject(key) {
  return r2Client().send(new GetObjectCommand({ Bucket: bucketName(), Key: key }));
}

export async function deleteObject(key) {
  await r2Client().send(new DeleteObjectCommand({ Bucket: bucketName(), Key: key }));
}
