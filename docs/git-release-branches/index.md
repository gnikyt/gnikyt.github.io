---
layout: post
title: Git release branches
permalink: git-release-branches
date: '2021-03-10 11:12:19'
---

A method I like to utilize internally, which I've been slowly pushing into my open source work, is to create branches for each major/minor release. Many developers will say branches are meant to be short-lived, to be eventually merged into your main branch. I believe this is true for features and bugfixes, but there is a benefit to keeping branches around for the long term.

Essentially, if you follow symver (*[major].[minor].[patch]*) for versioning, you would create and maintain a branch for each *[major].[minor]* release. For example... if I tagged the production branch with `v9.0.0`, a new major release, I would create a supplementary branch `9.0`. If I then released a bugfix, `v9.0.1`, I would then issue a pull request to merge code for `v9.0.1` into branch `9.0` to keep it updated with patches.

```bash
$ git branch -l | sort -V
# ...
8.2
8.3
9.0
develop
master
```

By having your releases tagged and supplementing it with release branches, you will:

* Have the ability to rollback easily
* Have the ability to support multiple versions easily
* Have a easily navigable snapshot of previous releases

This may be overkill for small and personal projects, but when you're working with a team and potentially have to support multiple versions of a codebase, then this flow is easy to adopt.

Below is a script you can use to walk through your existing repository (assuming everything is tagged in symver format) and create the *[major].[minor]* branches for you.

```python
#!/usr/bin/env python
#
# Usage: `python release_branches.py`
#   For a "dry run": `DRY_RUN=1 python release_branches.py`
#

import subprocess
import re
from os import environ
from typing import List, Dict


def get_tag_list() -> List[str]:
    """
        Get list of tags, sorted.
    """

    # Ensure tags are in vX.Y.Z format
    mmp = re.compile(r"^v([0-9]+).([0-9]+).([0-9]+)$")

    # Get all tags that match the format
    tags = subprocess.getoutput(" ".join(("git", "tag", "-l"))).split("\n")
    result = list(filter(lambda tag: (mmp.match(tag) is not None), tags))
    result = [tag[1:] for tag in result]
    result.sort(reverse=True)
    return result


def major_minor_list(tags: List[str]) -> Dict[str, str]:
    """
        Create a list of major.minor versions.
    """

    mm = {}
    for tag in tags:
        # Strip off patch from tag
        cleaned_tag = ".".join(tag.split(".")[:-1])
        if cleaned_tag not in mm:
            # Add to dict if major.minor doesn't exist yet
            mm[cleaned_tag] = tag
    return mm


def make_branch(branch: str, tag: str) -> None:
    """
        Make a branch from a tag.
    """

    # Checkout tag, create branch of major.minor based on tag, push to BB
    subprocess.run(["git", "checkout", f"v{tag}"])
    subprocess.run(["git", "checkout", "-b", branch])
    subprocess.run(["git", "push", "origin", branch])


tags = get_tag_list()
mm = major_minor_list(tags)
for branch, tag in mm.items():
    print(f"Making branch '{branch}' based on tag of '{tag}'...")
    if environ.get('DRY_RUN') is None:
        make_branch(branch, tag)
    print(">> Complete")
```

Running with the `DRY_RUN` env supplied, you'll be able to see the branches it will created based on your existing tags before proceeding with the creation.
