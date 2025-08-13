# Permalinks
All published files should have a permalink, and the ability to link aliases.
The permalink requirement is the main one, meaning once published, always accessible at that link.
The alias requirement is secondary, allowing me to fix broken links from the past and give them a way to be found at their new link.

# File management
S3 has a lot of advantages.
1. Keeps github repo small
2. Keeps file storage in cheap place
3. Keeps obsidian sync fast
4. S3 is so, so cheap. I think it is costing me about 8 cents a month.

Also has some disadvantages:
1. Media is not available without an internet connection
2. S3 files that are not used are not getting deleted or cleaned up
3. I don't have a good way of managing or migrating S3 files.
4. S3 files are super unorganized.

Solutions:
1. Local caching?
2. Create a script that deletes S3 files that are not used in the content folder.
4. S3 files could have a permalink prefix too, allowing me to at least find them based on a blog post.
  a. I could go a step farther and nest the files in a folder structure BASED on the permalink, with some sort of descriptive name.