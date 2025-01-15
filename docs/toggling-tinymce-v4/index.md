---
layout: post
title: Toggling TinyMCE v4
permalink: toggling-tinymce-v4
date: '2016-12-06 11:38:32'
---

Here's an easy way to turn on and off the TinyMCE editor for version 4.

```javascript
document.getElementById('toggle-tinymce').addEventListener('click', function(e) {
  e.preventDefault();

  var editorID = this.dataset.editorId;
  var editor   = tinymce.EditorManager.get(editorID);

  if (editor) {
    editor.remove();
  } else {
    editor = tinymce.EditorManager.createEditor(editorID, tinyMCE.settings);
    editor.render();
  }
});
```

You simply then need to create a link or button as such:

```html
<a href="#" id="toggle-tinymce" editor-id="your-editor-id">Toggle</a>
```

That's it. It will remove the TinyMCE if enabled, and if not, it will re-render by re-creating the editor with settings provided by `tinyMCE.settings`.
