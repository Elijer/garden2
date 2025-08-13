import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config();

export interface AppConfig {
  aws: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
  };
  s3: {
    bucketName: string;
    baseUrl: string;
  };
  local: {
    contentFolderPath: string;
  };
}

/**
 * Load and validate configuration from environment variables
 */
export function loadConfig(): AppConfig {
  const requiredVars = [
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY', 
    'AWS_REGION',
    'S3_BUCKET_NAME',
  ];

  // Check for missing required environment variables
  const missing = requiredVars.filter(varName => !process.env[varName]);
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(varName => console.error(`   - ${varName}`));
    console.error('\nPlease create a .env file based on env.example and set these values.');
    process.exit(1);
  }

  const contentFolderPath = process.env.CONTENT_FOLDER_PATH || '../../content';
  const region = process.env.AWS_REGION!;
  const bucketName = process.env.S3_BUCKET_NAME!;
  
  return {
    aws: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      region,
    },
    s3: {
      bucketName,
      baseUrl: `https://${bucketName}.s3.${region}.amazonaws.com`,
    },
    local: {
      contentFolderPath: path.resolve(contentFolderPath),
    },
  };
}
