import { S3Client, ListObjectsV2Command, ListObjectsV2CommandOutput, DeleteObjectCommand } from '@aws-sdk/client-s3';

export interface S3Config {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  bucketName: string;
}

export class S3Service {
  private client: S3Client;
  private bucketName: string;

  constructor(config: S3Config) {
    this.client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
    this.bucketName = config.bucketName;
  }

  /**
   * Get all file keys from the S3 bucket
   * @returns Array of S3 object keys (file paths)
   */
  async listAllFiles(): Promise<string[]> {
    const files: string[] = [];
    let continuationToken: string | undefined;

    try {
      do {
        const command = new ListObjectsV2Command({
          Bucket: this.bucketName,
          ContinuationToken: continuationToken,
        });

        const response: ListObjectsV2CommandOutput = await this.client.send(command);
        
        if (response.Contents) {
          // Filter out directory markers (keys ending with /)
          const fileKeys = response.Contents
            .map(obj => obj.Key)
            .filter((key): key is string => key !== undefined && !key.endsWith('/'));
          
          files.push(...fileKeys);
        }

        continuationToken = response.NextContinuationToken;
      } while (continuationToken);

      console.log(`Found ${files.length} files in S3 bucket: ${this.bucketName}`);
      return files;
    } catch (error) {
      console.error('Error listing S3 files:', error);
      throw error;
    }
  }

  /**
   * Delete a file from the S3 bucket
   * @param key S3 object key to delete
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.client.send(command);
    } catch (error) {
      console.error(`Error deleting S3 file ${key}:`, error);
      throw error;
    }
  }
}
