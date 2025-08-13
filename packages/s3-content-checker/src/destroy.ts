#!/usr/bin/env node

import { loadConfig } from './config.js';
import { S3Service } from './s3Client.js';
import fs from 'fs/promises';
import path from 'path';
import readline from 'readline';

interface OrphanedFileData {
  metadata: {
    generated: string;
    summary: {
      totalContentFiles: number;
      totalS3Files: number;
      totalContentReferences: number;
      referencedInContent: number;
      orphanedFiles: number;
    };
  };
  orphanedFiles: Array<{
    id: number;
    filename: string;
    s3Key: string;
    status: string;
  }>;
}

/**
 * Destroy script to delete orphaned S3 files based on previous scan results
 */
async function destroy(): Promise<void> {
  try {
    console.log('🗑️  Starting S3 Orphaned Files Cleanup...\n');

    // Check if output files exist
    const outputDir = path.join(process.cwd(), 'output');
    const jsonPath = path.join(outputDir, 'orphaned-files-data.json');
    
    try {
      await fs.access(jsonPath);
    } catch {
      console.error('❌ No output files found. Please run "npm run start" first to generate the scan results.');
      process.exit(1);
    }

    // Load configuration
    console.log('📋 Loading configuration...');
    const config = loadConfig();
    
    // Initialize S3 service
    const s3Service = new S3Service({
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey,
      region: config.aws.region,
      bucketName: config.s3.bucketName,
    });

    // Read the JSON output file
    console.log('📁 Reading scan results...');
    const jsonContent = await fs.readFile(jsonPath, 'utf-8');
    const data: OrphanedFileData = JSON.parse(jsonContent);

    console.log('📊 Scan Summary:');
    console.log(`   Generated: ${data.metadata.generated}`);
    console.log(`   Total content files: ${data.metadata.summary.totalContentFiles}`);
    console.log(`   Total S3 files: ${data.metadata.summary.totalS3Files}`);
    console.log(`   Orphaned files: ${data.metadata.summary.orphanedFiles}`);

    if (data.orphanedFiles.length === 0) {
      console.log('\n✅ No orphaned files to delete!');
      process.exit(0);
    }

    // Confirm deletion
    console.log(`\n⚠️  WARNING: About to delete ${data.orphanedFiles.length} orphaned S3 files!`);
    console.log('   This action cannot be undone.');
    console.log('\n   Orphaned files to be deleted:');
    data.orphanedFiles.slice(0, 5).forEach(file => {
      console.log(`     - ${file.filename}`);
    });
    if (data.orphanedFiles.length > 5) {
      console.log(`     ... and ${data.orphanedFiles.length - 5} more files`);
    }

    console.log('\n🔒 Type "DELETE" to confirm deletion:');
    
    // Simple confirmation using ES module readline
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const confirmation = await new Promise<string>((resolve) => {
      rl.question('> ', resolve);
    });
    rl.close();

    if (confirmation !== 'DELETE') {
      console.log('❌ Deletion cancelled.');
      process.exit(0);
    }

    // Delete orphaned files
    console.log('\n🗑️  Deleting orphaned files...');
    let deletedCount = 0;
    let errorCount = 0;

    for (const file of data.orphanedFiles) {
      try {
        await s3Service.deleteFile(file.s3Key);
        console.log(`   ✅ Deleted: ${file.filename}`);
        deletedCount++;
      } catch (error) {
        console.log(`   ❌ Failed to delete ${file.filename}: ${error}`);
        errorCount++;
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('🗑️  CLEANUP COMPLETED');
    console.log('='.repeat(60));
    console.log(`   Files deleted: ${deletedCount}`);
    console.log(`   Errors: ${errorCount}`);
    console.log(`   Total processed: ${data.orphanedFiles.length}`);

    if (errorCount > 0) {
      console.log('\n⚠️  Some files could not be deleted. Check the errors above.');
      process.exit(1);
    } else {
      console.log('\n✅ All orphaned files deleted successfully!');
      process.exit(0);
    }

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

// Run the destroy function if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  destroy();
}
