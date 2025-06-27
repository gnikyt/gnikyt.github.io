---
layout: post
title: Building a BASH template engine
permalink: building-bash-template-engine
date: '2025-05-22 14:09:31'
category: cmd
---

Earlier this year I migrated my blog away from Jekyll because it was such a large setup for such a small blog to maintain. I wanted something more "portable" without libraries, so I settled to build my blog and it's generation with BASH.

Everything needed was built out: frontmatter processing, Markdown to HTML generation, post handling, page handling, category support, RSS support, sitemap support, and more.

Originally, I wrote a very basic template handler which essentially just sniffed the first few characters of a string to know an action to take, example: `${inc:file.html}` would include a file into the template, `${var}` would replace itself with the applicable variable, and so on. It began getting more complex where I required some basic if/else statements and looping, which was something difficult with the basic template handler I originally wrote.

I decided to rebuild it from scratch, taking inspiration from Mustache syntax, and ensuring it was more than just a simple find and replace operation as it was before.

The plan was to do the following:

* Detect the applicable template tags
* For each template tag:
    * Parse it character-by-character to determine:
        * It's operation type
        * It's optional ask
        * It's optional contents
        * And more
* Once determined, run the applicable operation to produce a result
* Take the result and replace the original template tag with that result

Initial supports I targeted:

* **Variables**: `{{VAR}}`
* **Variables with filters**: `{{VAR|UPPERCASE|REPLACE x y}}`
* **If statements**: `{{#VAR}}I exist!{{/VAR}}`
* **Unless statements**: `{{^VAR}}I do not exist!{{/VAR}}`
* **Partial includes**: `{{>file.html}}`
* **Looping**: `{{@FOREACH var}}{{KEY}}: {{VALUE}}{{/FOREACH var}}`
* **Custom functions**: `{{@MONEY USD}}4500{{/MONEY USD}}`

The method I chose, since BASH is limited, was to go character-by-character through the input.

* If `{` was the current character, I peek ahead to know if the next character is also a `{`
* If the current character and next are both `{{`, I know this is a variable or block
* Next, the inside is parsed until `}}`
* If determined to be a block, then everything after `}}` until `{{/` is captured
* Once everything is captured, depending on the operation, it would run specific functions to replace the input contents with the parsed contents

[I built a library to handle this](https://githuib.com/gnikyt/be) called `be`.

Example usage, with custom functions and filters:

```bash
#!/bin/bash

. ./be

be_bold() {
  local input
  input=$(cat -)
  echo "<strong>${input}</strong>"
}

be_replace() {
  local input
  input=$(cat -)
  echo "${input//$1/$2}"
}

be_capitalize() {
  local input
  input=$(cat -)
  echo "${input^}"
}

NAME="Joe"
LIKES="hockey,soccer"
TPL=$(cat <<EOF
  Well, well, hello {{NAME}}!
  {{#LIKES}}
    So {{NAME|REPLACE e ey|BOLD}}, I heard you like:
    {{@FOREACH LIKES ,}}
      {{KEY1}}) {{VALUE|CAPITALIZE}}{{^LAST}}; and {{/LAST}}
    {{/FOREACH LIKES ,}}
    {{@RAW}}Won't be processed: {{NAME}}{{/RAW}}
  {{/LIKES}}
EOF
)

echo "$TPL" | be
```

Output:

```
  Well, well, hello Joe!
  
    So <strong>Joey</strong>, I heard you like:
    1) Hockey; and 
    2) Soccer
```

BASH is definately not the best solution for a template engine, however, you can view the entire solution on [here](https://githuib.com/gnikyt/be/tree/master/be) and modify for your needs.
