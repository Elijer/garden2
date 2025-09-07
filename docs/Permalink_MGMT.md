# Tools
1. Aliases - these create relative redirects (I think)
2. Permalinks - these create absolute redirects (from site's root) - by default, Quartz only lets us define one but in the first garden repo I modified the code to allow for multiple.
3. Folder specific index.html:
- `publish: true` frontmatter seems to be required for this to work
- `title: Some Title` changes name of title in Folder page AND in explorer, but not URL
- Content ON THE INDEX.md itself allows you to make the folder page a whole thing! So cool!
- `permalink: some path`: This works too!

So the strategy is this - 
Go slow with publishing content. Make sure that every file has a permalink. Make them short, ideally a single word. Tell users that copying and pasting URL may break eventually, but if people complain, I can always add aliases when I move an article that has a big readership I guess.

How to do this?
Well, an example is that if your URL wherever is:
http://localhost:8080/Programming/Databases/The-Strengths-of-MongoDB

But you want to change the location, then just add a permalink for:

`permalink: /Programming/Databases/The-Strengths-of-MongoDB`

And how is this different than aliases? I guess a good way to think of it is just that aliases are relative to current file location. I think they are kind of confusing, but I guess if you wanted to give a file a ton of names maybe their okay. I wonder if this would work for folders too, so you can have this really fuzzy and forgiving filepath at each node of the url.