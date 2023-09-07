import { AppConfig } from "../../../interfaces/config/config";
import supabase from "../../../interfaces/config/supabase.config";
import { IResponse } from "../../../interfaces/response.interface";

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
): Promise<IResponse> => {
  if (!filePath || !file) {
    throw new Error("Invalid file path or file data to be uploaded");
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
    console.error("[Error] Failed uploading audio to Supabase:", error);
    return {
      status: 400,
      body: {
        error: `Failed to upload audio to Supabase: ${error.message}`,
      },
    };
  } else {
    console.debug(
      `[Log] Audio compressed and uploaded to Supabase: ${data.path}`
    );
    return {
      status: 200,
      body: {
        data: await getPublicUrl(data.path),
      },
    };
  }
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
