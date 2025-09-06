# Permalinks
All published files should have a permalink that never changes
- Ideally they can also take aliases, and the process for linking an alias to a permalink should be documented.
Moving a file from one folder to another shouldn't change link.

How?
I don't think there is a plugin for this. Aliases technically work, and there is also some support of permalinks, which I seem to have modified to allow for MULTIPLE permalinks - the idea being that entire paths can also be redirected if a file moved folders.

But these are sort of shitty, because it means that moving things around in my blog requires an unrealistic amount of effort.

Even if I automated this, it would lead to a messy chain of redirects.

The simple solutions:
1. Publish blog content by just copying things into a blog folder, and maintain that sort of separately. It's a little extra work, but not that much, and could give me an opportunity for intentionality.
2. ALWAYS publish with a permalink. Or even modify the "publish" thing by just having it be the default link, enforcing this pattern.
But that doesn't solve a problem which is that people sharing stuff would send the wrong links, you know?
So what I want is, without fucking up the routing graph, to have a flat list of permalinks, and a way to prevent conflicts - like by adding a number or something.

Okay. I think that the solution is a little messy, but workable.
It's just to use permalinks. Make them completely flat. Try to add them for every published post.
If I fail, then just add another permalink. It is only as messy as the number of times I forget to add a permalink.

Nice!

# File management
Store files in S3 ✅
Secondary goal: cache them for offline access on a browser

# Style
Simple style that is not distracting
Considering no explorer bar even - just straight-up pages.

# URL
serve at thornberry.io

# Version control
Primary goal: Keep content folder separate from main Quartz repo so that I can make numerous changes to blog content without burying config changes to platform
Secondary effect: I can publish my platform publically!

Strategy:
1. Primary public repo for everything but content, which is .gitignored
2. Secondary private repo for content. This can be a symlink (it will be) or just a github repo, doesn't really matter.
3. Content also a repo
4. On the deploy.yaml, we use a token to pull the content repo and deploy it

Remaining problem: the index.xml will still be fucked up becase no access to git history to find recent files. Need to figure out how to do this with frontmatter I guess.

Tertiary: continue pulling upstream updates into my fork
`git remote add upstream https://github.com/jackyzha0/quartz.git`
`git pull upstream v4`

Now I have:

origin → your fork (read/write)
upstream → the original repo (read-only)

# RSS
Generated RSS feed for last 10 most recent posts.
See version control - still a challenge here.
One potentially solution is just generating the index.xml locally, and comitting to version control. This would allow me to access EITHER
- file history
- git history

Which the github runner doesn't have.

Alternative:
Use frontmatter.

# Don't fuck up file rendering with audio tags
Right now, I think since audio tags are unclosed, the rendering is getting confused
This either means either
- the s3 uploader needs to add closing tags
- the renderer needs to be smarter and deal with unclosed tags