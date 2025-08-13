import { ContentScanner, S3Reference } from './contentScanner.js';
import fs from 'fs/promises';
import path from 'path';

export interface ComparisonResult {
  s3Only: string[];
  referencedInContent: string[];
  totalS3Files: number;
  totalContentReferences: number;
  missingReferences: number;
  totalContentFiles: number;
}

export class FileComparator {
  /**
   * Compare S3 files with content references
   * @param s3Files Array of S3 file keys
   * @param contentReferences Array of S3 references found in content
   * @param totalContentFiles Total number of content files scanned
   * @returns Comparison result showing files not referenced in content
   */
  static compareS3WithReferences(s3Files: string[], contentReferences: S3Reference[], totalContentFiles: number): ComparisonResult {
    // Extract file IDs from S3 files (remove the full path, keep just the filename)
    const s3FileIds = s3Files.map(file => {
      // Extract filename from S3 key (e.g., "attachments/b0b4a5fb1c84e082b84b94ae0067f083.png" -> "b0b4a5fb1c84e082b84b94ae0067f083.png")
      const filename = file.split('/').pop();
      return filename || file;
    });

    // Get unique file IDs from content references
    const contentFileIds = ContentScanner.getUniqueFileIds(contentReferences);

    // Find S3 files that are NOT referenced in content
    const s3Only = s3FileIds.filter(fileId => !contentFileIds.has(fileId));

    // Find S3 files that ARE referenced in content
    const referencedInContent = s3FileIds.filter(fileId => contentFileIds.has(fileId));

    return {
      s3Only,
      referencedInContent,
      totalS3Files: s3FileIds.length,
      totalContentReferences: contentFileIds.size,
      missingReferences: s3Only.length,
      totalContentFiles,
    };
  }

  /**
   * Save comparison results to output files
   */
  static async saveResultsToFiles(result: ComparisonResult, outputDir: string): Promise<void> {
    try {
      // Ensure output directory exists
      await fs.mkdir(outputDir, { recursive: true });

      // Save human-readable report to .txt file
      const txtContent = this.generateTxtReport(result);
      await fs.writeFile(path.join(outputDir, 'orphaned-files-report.txt'), txtContent);

      // Save structured data to .json file for programmatic deletion
      const jsonContent = this.generateJsonReport(result);
      await fs.writeFile(path.join(outputDir, 'orphaned-files-data.json'), JSON.stringify(jsonContent, null, 2));

      console.log(`\n📁 Output files saved to: ${outputDir}/`);
      console.log(`   - orphaned-files-report.txt (human readable)`);
      console.log(`   - orphaned-files-data.json (for deletion)`);
    } catch (error) {
      console.error('Error saving output files:', error);
      throw error;
    }
  }

  /**
   * Generate human-readable text report
   */
  private static generateTxtReport(result: ComparisonResult): string {
    const timestamp = new Date().toISOString();
    
    let report = `S3 ORPHANED FILES REPORT\n`;
    report += `Generated: ${timestamp}\n`;
    report += `\n`;
    report += `SUMMARY:\n`;
    report += `  Total content files scanned: ${result.totalContentFiles}\n`;
    report += `  Total S3 files: ${result.totalS3Files}\n`;
    report += `  Total S3 references found in content: ${result.totalContentReferences}\n`;
    report += `  S3 files referenced in content: ${result.referencedInContent.length}\n`;
    report += `  S3 files that appear to be orphaned: ${result.missingReferences}\n`;
    report += `\n`;

    if (result.s3Only.length > 0) {
      report += `ORPHANED FILES (${result.s3Only.length}):\n`;
      report += `These S3 files exist but are not referenced in any content files:\n\n`;
      
      result.s3Only.forEach((fileId, index) => {
        report += `${index + 1}. ${fileId}\n`;
      });
      
      report += `\n`;
      report += `RECOMMENDATION:\n`;
      report += `Review these files to ensure they are truly orphaned before deletion.\n`;
      report += `You can use 'npm run destroy' to delete these files after review.\n`;
    } else {
      report += `✅ All S3 files are referenced in content! No orphaned files found.\n`;
    }

    return report;
  }

  /**
   * Generate JSON report for programmatic deletion
   */
  private static generateJsonReport(result: ComparisonResult): any {
    return {
      metadata: {
        generated: new Date().toISOString(),
        summary: {
          totalContentFiles: result.totalContentFiles,
          totalS3Files: result.totalS3Files,
          totalContentReferences: result.totalContentReferences,
          referencedInContent: result.referencedInContent.length,
          orphanedFiles: result.missingReferences,
        }
      },
      orphanedFiles: result.s3Only.map((fileId, index) => ({
        id: index + 1,
        filename: fileId,
        s3Key: `attachments/${fileId}`,
        status: 'orphaned'
      }))
      // Note: referencedFiles intentionally excluded for safety
      // The destroy script can only see orphaned files
    };
  }

  /**
   * Print a formatted comparison report
   */
  static printComparisonReport(result: ComparisonResult): void {
    console.log('\n' + '='.repeat(80));
    console.log('📊 S3 CONTENT REFERENCE COMPARISON REPORT');
    console.log('='.repeat(80));
    
    console.log(`\n📈 Summary:`);
    console.log(`   Total content files scanned: ${result.totalContentFiles}`);
    console.log(`   Total S3 files: ${result.totalS3Files}`);
    console.log(`   Total content references: ${result.totalContentReferences}`);
    console.log(`   S3 files referenced in content: ${result.referencedInContent.length}`);
    console.log(`   S3 files NOT referenced in content: ${result.missingReferences}`);

    if (result.s3Only.length > 0) {
      console.log(`\n🔍 S3 files that are NOT referenced in content (${result.s3Only.length}):`);
      console.log('-'.repeat(60));
      result.s3Only.forEach((fileId, index) => {
        console.log(`   ${index + 1}. ${fileId}`);
      });
      
      console.log(`\n💡 These S3 files appear to be orphaned - they exist in S3 but aren't linked`);
      console.log(`   from any content files. You may want to review and potentially delete them.`);
    } else {
      console.log('\n✅ All S3 files are referenced in content!');
    }

    console.log('\n' + '='.repeat(80));
  }
}
