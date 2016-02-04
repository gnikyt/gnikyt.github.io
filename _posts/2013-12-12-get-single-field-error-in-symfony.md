---
layout: post
title: 'Get Single Field Error in Symfony'
date: '2013-12-12 19:34:07.000000000 -03:30'
categories:
    - General
    - Programming
tags:
    - how-to
    - problem
    - programming
    - solved
    - symfony
    - tid-bit
    - twig
---
This is just a quick tid-bit/how-to!

Recently a project came up where special front-end actions and structures had to take place within the view of the Twig template once an error occurred on specific fields. It also didn't require enough attention to warrant creating a form theme.

This is a quick way to test if a field has errors; Simply do this inside your Twig template...

```liquid
{% raw %}{{ form.__field_name__.vars.errors|length }}{% endraw %}
```

The above code will show how many errors a certain field has. A usage example...

```liquid
{% raw %}
{% if form.__field_name__.vars.errors|length > 0 %}
  <div class="special-class-for-jquery">{{ form_errors(__field_name__) }}</div>
{% endif %}
{% endraw %}
```

Just replace __field_name__ with the field name you wish to use!