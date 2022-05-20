---
layout: post
title: Shopify Github Action for versioning
permalink: shopify-github-action-versioning
date: '2022-05-20 16:16:20'
---

Shopify recently updated their admin panel again and started to display the value of `theme_version` from `config/settings_schema.json` onto the theme listing page. Example (yellow highlight):

[![Shopify theme version example](/assets/images/2022/05/shopify-versioning.png)](/assets/images/2022/05/shopify-versioning.png)

With our setup, all our client themes are connected to Github and every release gets tagged a version in SYMVER format.

Depending on a developer or release manager to manually update `config/settings_schema.json` before releasing is not ideal; even with a process guide or release checklist, there is a chance it can be missed. We wanted an automated solution to update the `theme_version` value upon a tag being pushed to the `master` branch.

We have come up with the following solution:

```yaml
# .github/workflows/schema_version.yml

name: Schema version

on:
  create:
    tags: [ v* ]
    branches: [ master ]

jobs:
  version:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v2

      - name: Update settings_schema.json
        run: |
          sed -i 's/"theme_version": ".*"/"theme_version": "'${GITHUB_REF_NAME:1}'"/g' config/settings_schema.json

      - name: Commit settings_schema.json
        uses: EndBug/add-and-commit@v9
        with:
          push: origin HEAD:main
          default_author: github_actions
          message: "Updated settings_schema.json theme_version value to '${{ github.ref_name }}'"
          add: config/settings_schema.json
```

Now, anytime a version tag gets pushed to the `master` branch, the action will do the following:

1. Confirm the action to only run upon tagging the master branch; *lines 5-7*
2. Checkout the repository; *lines 13-14*
3. Utilize `sed` to inline-replace the `theme_version` value to `${GITHUB_REF_NAME}` (removes the `v`); *lines 16-18*
4. Commit the changes to the schema with a commit message containing the version; *lines 20-26*

[![Shopify theme version output example](/assets/images/2022/05/shopify-versioning-github.png)](/assets/images/2022/05/shopify-versioning-github.png)

Hopefully this is a helpful starting point for any other developers looking to do the same process.
