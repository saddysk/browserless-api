import { ManagedUpload } from "aws-sdk/clients/s3";
import s3 from "../../../interfaces/config/aws.config";
import { AppConfig } from "../../../interfaces/config/config";
import supabase from "../../../interfaces/config/supabase.config";

const CONFIG = AppConfig();

type FileBody =
  | ArrayBuffer
  | ArrayBufferView
  | Blob
  | Buffer
  | File
  | FormData
  | NodeJS.ReadableStream
  | ReadableStream<Uint8Array>
  | URLSearchParams
  | string;

export const uploadToSupabase = async (
  filePath: string,
  file: FileBody
): Promise<string> => {
  if (!filePath || !file) {
    throw new Error("Invalid filepath or file data to be uploaded");
  }

  const { data, error } = await supabase.storage
    .from(CONFIG.SUPABASE_BUCKET)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: "audio/mpeg",
      duplex: "half",
    });

  if (error) {
    console.error(`${error}`);
    throw new Error(`Failed to upload in supabase: ${error.message}`);
  }

  return data.path;
};

export const getPublicUrl = async (path: string): Promise<string> => {
  if (!path) {
    throw new Error(`Invalid supabase object path: ${path}`);
  }

  const { data } = supabase.storage
    .from(CONFIG.SUPABASE_BUCKET)
    .getPublicUrl(path);

  if (data == null) {
    throw new Error(`Public url for the object not found`);
  }

  return data.publicUrl;
};

export const uploadToAwsS3 = async (
  filePath: string,
  file: FileBody
): Promise<string> => {
  const params = {
    Bucket: CONFIG.S3_BUCKET,
    Key: filePath,
    Body: file,
    ACL: "public-read",
  };

  // Upload the object to S3
  const uploadedPath = await new Promise((resolve, reject) => {
    s3.upload(params, (err: Error, data: ManagedUpload.SendData) => {
      if (err) {
        console.error("Error uploading to S3.\n", err);
        reject(err);
      } else {
        resolve(data.Location);
      }
    });
  });

  return uploadedPath as string;
};

// "videoUrl": "https://www.youtube.com/watch?v=HAnw168huqA",
