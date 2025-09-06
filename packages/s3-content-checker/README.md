# S3 Content Checker

A TypeScript utility to compare files in an S3 bucket with S3 references in local files in the `content` directory. This tool helps identify files that exist in your S3 bucket but are not referenced anywhere in your content (orphaned files).

## Features

- Lists all files in a specified S3 bucket
- Scans local content files for S3 URL references
- Compares the two lists and identifies orphaned S3 files
- Provides detailed reporting and output files
- **Terraform-like workflow**: Scan first, then destroy orphaned files
- Supports environment-based configuration

## Setup

1. **Install dependencies:**
   ```bash
   cd packages/s3-content-checker
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp env.example .env
   ```

   Edit the `.env` file with your AWS credentials and configuration:
   ```env
   # AWS Configuration
   AWS_ACCESS_KEY_ID=your_access_key_here
   AWS_SECRET_ACCESS_KEY=your_secret_key_here
   AWS_REGION=us-east-2

   # S3 Configuration
   S3_BUCKET_NAME=thornberry-obsidian-general

   # Local paths (relative to this package)
   CONTENT_FOLDER_PATH=../../content
   ```

## AWS Credentials

You'll need AWS credentials with the following permissions:
- `s3:ListBucket` on your target bucket
- `s3:DeleteObject` on your target bucket (for destroy command)

## Usage

### 1. Scan and Analyze (Plan Phase)
```bash
npm run start
```

This command:
- Scans your S3 bucket for all files
- Searches through your content files for S3 URL references
- Compares the two lists to find orphaned files
- Generates detailed console output
- Saves results to `output/` directory:
  - `orphaned-files-report.txt` - Human-readable report
  - `orphaned-files-data.json` - Structured data for deletion

### 2. Review Output Files
Check the generated files in the `output/` directory:
- Review the text report to understand what will be deleted
- Verify the JSON data contains the expected orphaned files

### 3. Delete Orphaned Files (Apply Phase)
```bash
npm run destroy
```

This command:
- Reads the JSON output from the previous scan
- Shows a summary of files to be deleted
- Requires confirmation by typing "DELETE"
- Deletes all orphaned S3 files
- Provides detailed progress and results

## Workflow Example

```bash
# 1. First, scan and analyze
npm run start

# 2. Review the output files in output/ directory
cat output/orphaned-files-report.txt

# 3. If everything looks good, delete orphaned files
npm run destroy
# Type "DELETE" when prompted to confirm
```

## Output Files

### orphaned-files-report.txt
Human-readable report showing:
- Summary statistics
- List of orphaned files
- Recommendations

### orphaned-files-data.json
Structured JSON data containing:
- Metadata about the scan
- List of orphaned files with S3 keys
- List of referenced files

## Project Structure

```
src/
├── index.ts           # Main scan script (npm run start)
├── destroy.ts         # Deletion script (npm run destroy)
├── config.ts          # Configuration loading and validation
├── s3Client.ts        # S3 service for listing and deleting
├── contentScanner.ts  # Local file system scanner
└── fileComparator.ts  # Comparison logic and reporting

output/                 # Generated output files (gitignored)
├── orphaned-files-report.txt
└── orphaned-files-data.json
```

## Error Handling

The tool will exit with code 1 if:
- Missing required environment variables
- AWS authentication fails
- S3 bucket access fails
- Content directory doesn't exist or can't be read
- Orphaned files are found (start command)
- Deletion errors occur (destroy command)

It exits with code 0 if all operations complete successfully.

## Safety Features

- **Two-phase workflow**: Scan first, then delete
- **Confirmation required**: Must type "DELETE" to confirm
- **Output files**: Review before proceeding
- **Detailed logging**: See exactly what's happening
- **Error handling**: Continues processing even if some deletions fail

## Notes

- File paths are normalized for cross-platform compatibility
- Directory markers (S3 keys ending with `/`) are automatically filtered out
- The tool respects common ignore patterns (node_modules, .git, etc.)
- Both relative and absolute paths are supported for the content directory
- S3 URL references are found regardless of context (markdown, HTML, etc.)
