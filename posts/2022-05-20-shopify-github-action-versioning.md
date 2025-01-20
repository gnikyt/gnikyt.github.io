---
layout: post
title: Shopify Github Action for versioning
permalink: shopify-github-action-versioning
date: '2022-05-20 16:16:20'
---

Shopify recently updated their admin panel again and started to display the value of `theme_version` from `config/settings_schema.json` onto the theme listing page. Example (yellow highlight):

[![Shopify theme version example](/assets/images/posts/shopify-versioning.png)](/assets/images/posts/shopify-versioning.png)

With our setup, all our client themes are connected to Github and every release gets tagged a version in SYMVER format.

Depending on a developer or release manager to manually update `config/settings_schema.json` before releasing is not ideal; even with a process guide or release checklist, there is a chance it can be missed. We wanted an automated solution to update the `theme_version` value upon a tag being pushed to the `master` branch.

We have come up with the following solution (`.github/workflows/schema_version.yml`):

```yaml
name: Schema version

on:
  create:
    tags: [ v* ]

jobs:
  replacement:
    runs-on: ubuntu-latest
    if: startsWith(github.ref, 'refs/tags/v')
    steps:
      - name: Checkout repo
        uses: actions/checkout@v2

      - name: Update settings_schema.json
        run: |
          sed -i 's/"theme_version": ".*"/"theme_version": "'${GITHUB_REF_NAME:1}'"/g' config/settings_schema.json

      - name: Commit changes
        uses: EndBug/add-and-commit@v9
        with:
          push: origin HEAD:master
          default_author: github_actions
          message: "Updated settings_schema.json to version {% raw %}'${{ github.ref_name }}'{% endraw %}"
          add: config/settings_schema.json
```

Now, anytime a version tag gets pushed to the `master` branch, the action will do the following:

1. Confirm the action to only run upon tagging; *lines 3-5*
2. Confirm the steps will only run if tagging happened; *line 10*
3. Checkout the repository; *lines 12-13*
4. Utilize `sed` to inline-replace the `theme_version` value to `${GITHUB_REF_NAME}` (removes the `v`); *line 17*
5. Commit the changes to the schema with a commit message containing the version; *lines 19-25*

[![Shopify theme version output example](/assets/images/posts/shopify-versioning-github.png)](/assets/images/posts/shopify-versioning-github.png)

Hopefully this is a helpful starting point for any other developers looking to do the same process.
