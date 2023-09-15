import AWS from "aws-sdk";
import { AppConfig } from "./config";

const CONFIG = AppConfig();

// Set your AWS credentials and region
AWS.config.update({
  accessKeyId: CONFIG.AWS_ACCESS_KEY_ID,
  secretAccessKey: CONFIG.AWS_ACCESS_KEY_SECRET,
  region: CONFIG.AWS_REGION,
});

// Create an S3 instance
const s3 = new AWS.S3();

export default s3;
