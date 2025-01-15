# gnikyt blog

gnikyt.com -- Code ramblings.

This blog is powered by simple Markdown files and produces a statically-generated website.

Generated is handled by a bunch of crude Bash scripts to do things such as:

* Process the frontmatters
* Process the pages and posts Markdown into HTML and TXT versions
* Generate an RSS feed of posts
* Generate a sitemap
* Tidy resulting HTML and XML
* and more...

Each page and post gets its own directory, for example, if a post was under `posts/2025-01-01-hello-world.md`, then the result would be pushed out as:

```
docs/hello-world/
  index.html
  index.txt
  index.md
```

## Requirements

* `bash` - For processing and generation.
* `sed` - For HTML generation support from Markdown.
* `lynx` - For TXT generation support from HTML.
* `tidy` - For cleaning resulting HTML and XML.

## Building

`bin/build`

Example output:

```
Generating posts...
[2021-11-16-some-article.md] Generated
...
[2023-12-07-another.md] Generated
Completed: 63 posts

Generating pages...
[about.md] Generated
[404.md] Generated
[robots.md] Generated
Completed: 3 pages

Generating index...
Completed

Generating RSS...
Completed

Generating sitemap...
Completed

Tidying markup...
Completed
```

## Misc

* `docs` directory is pointing to Github to use for the hosting of the content on the domain name.
* Anything in `static` is copied directly into `docs` after generation is completed.
* This was previously powered by Jekyll but it was quiet large for my needs and I wanted something more simple to run.
