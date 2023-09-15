// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config();
import { cleanEnv, port, str } from "envalid";

const env = cleanEnv(process.env, {
  PORT: port({ default: 3010, devDefault: 3010 }),

  SUPABASE_URL: str({ default: "" }),
  SUPABASE_SERVICE_ROLE_KEY: str({ default: "" }),
  SUPABASE_BUCKET: str({ default: "public" }),

  S3_BUCKET: str({ default: undefined }),
  AWS_ACCESS_KEY_ID: str({ default: undefined }),
  AWS_ACCESS_KEY_SECRET: str({ default: undefined }),
  AWS_REGION: str({ default: "us-east-1" }),
});

const _AppConfig = () => ({ ...env } as const);

const CONFIG = _AppConfig();
export const AppConfig = () => CONFIG;
