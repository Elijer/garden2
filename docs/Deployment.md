The deployment strategy is to use the `deploy.zsh` script to just build locally, and then build from a Dockerfile, push image to dockerhub, and deploy to Railway whenever a new image is dropped.

This has a lot of simplicity advantages, like not having to deal with private repo credentials on cloud (`garden_content` is private).

It also may have advantage of allowing the index.xml to build from the sub-repo (not sub-module) locally via git history dates, which is really hard remotely.