import { globby } from 'globby';
import path from 'path';
import fs from 'fs/promises';

export interface S3Reference {
  fullUrl: string;
  fileId: string;
  originalPath: string;
}

export class ContentScanner {
  private contentPath: string;
  private s3BaseUrl: string;

  constructor(contentPath: string, s3BaseUrl: string) {
    this.contentPath = path.resolve(contentPath);
    this.s3BaseUrl = s3BaseUrl;
  }

  /**
   * Scan content files for S3 URL references using exact string matching with parallel execution
   * @param s3FileIds Array of S3 file IDs to search for
   * @returns Array of S3 file references found in content
   */
  async scanForS3References(s3FileIds: string[]): Promise<S3Reference[]> {
    try {
      // Get all markdown and text files recursively
      const files = await globby([
        '**/*.{md,markdown,txt,json,yaml,yml}',
        '!**/node_modules/**',
        '!**/.git/**',
        '!**/.DS_Store',
        '!**/Thumbs.db',
      ], {
        cwd: this.contentPath,
        onlyFiles: true,
      });

      console.log(`Scanning ${files.length} content files for ${s3FileIds.length} S3 file references...`);

      // Read all content files in parallel
      console.log('📖 Reading content files...');
      const contentPromises = files.map(async (file) => {
        try {
          const filePath = path.join(this.contentPath, file);
          const content = await fs.readFile(filePath, 'utf-8');
          return { file, content };
        } catch (error) {
          console.warn(`Warning: Could not read file ${file}:`, error);
          return { file, content: '' };
        }
      });

      const fileContents = await Promise.all(contentPromises);
      const validContents = fileContents.filter(fc => fc.content.length > 0);

      console.log(`✅ Loaded ${validContents.length} content files`);

      // Search for all S3 URLs in parallel
      console.log('🔍 Searching for S3 references...');
      const searchPromises = s3FileIds.map(async (fileId) => {
        const exactUrl = `${this.s3BaseUrl}/attachments/${fileId}`;
        
        // Find which content file contains this URL
        for (const { file, content } of validContents) {
          if (content.includes(exactUrl)) {
            return {
              fullUrl: exactUrl,
              fileId,
              originalPath: file,
            };
          }
        }
        
        return null; // Not found
      });

      const results = await Promise.all(searchPromises);
      const references = results.filter((ref): ref is S3Reference => ref !== null);

      console.log(`Found ${references.length} S3 references in content files`);
      return references;
    } catch (error) {
      console.error('Error scanning content for S3 references:', error);
      throw error;
    }
  }

  /**
   * Get total count of content files scanned
   */
  async getTotalContentFiles(): Promise<number> {
    try {
      const files = await globby([
        '**/*.{md,markdown,txt,json,yaml,yml}',
        '!**/node_modules/**',
        '!**/.git/**',
        '!**/.DS_Store',
        '!**/Thumbs.db',
      ], {
        cwd: this.contentPath,
        onlyFiles: true,
      });
      
      return files.length;
    } catch (error) {
      console.warn('Warning: Could not count content files:', error);
      return 0;
    }
  }

  /**
   * Get unique file IDs from references (for comparison with S3)
   */
  static getUniqueFileIds(references: S3Reference[]): Set<string> {
    return new Set(references.map(ref => ref.fileId));
  }
}
