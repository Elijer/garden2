#!/usr/bin/env node

import { loadConfig } from './config.js';
import { S3Service } from './s3Client.js';
import { ContentScanner } from './contentScanner.js';
import { FileComparator } from './fileComparator.js';
import path from 'path';

/**
 * Main function to compare S3 bucket contents with S3 references in local content
 */
async function main(): Promise<void> {
  try {
    console.log('🚀 Starting S3 Content Reference Checker...\n');

    // Load configuration from environment variables
    console.log('📋 Loading configuration...');
    const config = loadConfig();
    console.log(`   AWS Region: ${config.aws.region}`);
    console.log(`   S3 Bucket: ${config.s3.bucketName}`);
    console.log(`   S3 Base URL: ${config.s3.baseUrl}`);
    console.log(`   Content Path: ${config.local.contentFolderPath}\n`);

    // Initialize services
    const s3Service = new S3Service({
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey,
      region: config.aws.region,
      bucketName: config.s3.bucketName,
    });

    const contentScanner = new ContentScanner(config.local.contentFolderPath, config.s3.baseUrl);

    // Get file lists from both sources
    console.log('📡 Fetching S3 file list...');
    const s3Files = await s3Service.listAllFiles();

    console.log('📁 Scanning content files for S3 references...');
    // Extract file IDs from S3 files for exact URL matching
    const s3FileIds = s3Files.map(file => file.split('/').pop() || file);
    const contentReferences = await contentScanner.scanForS3References(s3FileIds);
    
    // Get total content files scanned (this is approximate since we're counting all files, not just those with S3 refs)
    const totalContentFiles = await contentScanner.getTotalContentFiles();

    // Perform comparison
    console.log('🔍 Comparing S3 files with content references...');
    const comparisonResult = FileComparator.compareS3WithReferences(s3Files, contentReferences, totalContentFiles);

    // Print results
    FileComparator.printComparisonReport(comparisonResult, config.s3.baseUrl);

    // Save results to output files
    const outputDir = path.join(process.cwd(), 'output');
    await FileComparator.saveResultsToFiles(comparisonResult, outputDir, config.s3.baseUrl);

    // Exit with appropriate code
    if (comparisonResult.s3Only.length > 0) {
      console.log(`\n⚠️  Found ${comparisonResult.s3Only.length} S3 files that are not referenced in content.`);
      console.log(`📁 Review the output files in ${outputDir}/ before proceeding.`);
      process.exit(1);
    } else {
      console.log('\n✅ All S3 files are referenced in content!');
      process.exit(0);
    }

  } catch (error) {
    console.error('❌ Error during execution:', error);
    process.exit(1);
  }
}

// Run the main function if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
