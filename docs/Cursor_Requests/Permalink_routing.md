Hey can you look through th way that Quartz is structured and help me strategize about how I might prepare to make sure that, if a "permalink" or permialink array exists in the frontmatter of a page (like a post - one of the markdown documents that gets published on the blog), then
1) The url that page is served on is at that permalink (or just the first permalink, if an array)
2) The tag and folder pages link to that permalink
3) Which is really just to say, the graph that links to all pages considered the permalink, in the case I described, as the URL that the page is served at.

I would still like the path, where it is served at now, to be a REDIRECT to this new url, but I want th permalink - when it exists - to be the location the page is served at.

So for pages where no permalink has been aded, by default that will be served at their path.

For example, a page that, in the content/ folder, is at content/notes/page.md, if it has a permalink of "example", will just be served at /example

And all folder pages and tag pages will link to it there.

But if that same page lacks a permalink, then it should be served still at notes/page

And the breadcrumb display should STILL effectively link using the path of course, as it does now.

Does that make sense? I'm trying to figure out how to do this and need help, but I still don't really understand the underling routing structure in quartz and will need to understand that I think to update this behavior