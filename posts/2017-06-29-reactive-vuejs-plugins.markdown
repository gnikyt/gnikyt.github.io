---
layout: post
title: Reactive VueJS plugins
permalink: reactive-vuejs-plugins
date: '2017-06-29 12:36:22'
---

VueJS has been my go-to framework from building small to medium-sized frontend applications and add-ins. Its simply great - easy to develop with and able to plug into existing systems as a simple view layer.

## Plugins & Reactivity

[Plugins in Vue](https://vuejs.org/v2/guide/plugins.html), allow you to extract code into a reusable module. The plugins allow you to create global mixins, methods, properties, and more. It has the added benefit of keeping your code modularized, clean, and doesn't pollute your app's main instance.

[Reactivity in Vue](https://vuejs.org/v2/guide/reactivity.html) is simply a way of describing something that watches for changes in state/data and reacts to it. Vue watches for changes in data, which in turn causes the component to re-render, showing the updated state.

## Use Case

As mentioned, creating plugins can keep your code modularized and your main app instance clean. There could be many reasons you'd need a plugin to track data (be reactive).

One example is if you're depending on a third-party service for data. You need to request this data, process it, save it, and display it. This takes time. By the time the request is completed your Vue instance may be rendered and your data will not display.

## Building

Let's build a sports ticker to show the latest score result from some sports teams.

The key to making your data reactive in your plugin is simple... create a new Vue instance that holds the data.

```javascript
// plugins/sports-ticker.js

/**
 * Simple sports ticker class
 */
class SportsTicker {
  /**
   * @constructor
   */
  constructor(Vue, team) {
    this.team = team;

    // Lets make a new instance to store the data
    this.storeVM = new Vue({
      data() {
        return {
          team,
          gameTime: null,
          score: {
            home: null,
            away: null,
          },
        };
      },
    });
    
    // Fetch the scores
    this.fetchData();
  }

  /**
   * Gets the state of the data
   * @return {Object}
   */
  get state() {
    return this.storeVM.$data;
  }
  
  /**
   * Simple fetch to grab the data
   */
  fetchData() {
    fetch(`https://some-api.com/games/${this.team}/last`)
      .then(resp => resp.json())
      .then((data) => {
        this.state.gameTime = data.game_time;
        this.state.score = {
          home: data.home_score,
          away: data.away_score
        };
      })
    ;
  }
}

export default {
  /**
   * Install sports ticker plugin
   * @param {Vue} Vue - Vue instance
   * @param {Object} options - Options for the plugin
   */
  install: (Vue, options = {}) => {
    Vue.prototype.$SportsTicker = new SportsTicker(
      Vue,
      options.team
    );
  },
};

// Usage: import SportsTicker from 'plugins/sports-ticket'; Vue.use(SportsTicker);

```

That's all that's to it.

What we've done is created a class to keep our logic separate from the Vue plugin installation code. Then, we register the plugin with the options (in this case, just the team name). In the SportsTicker class, we create a new Vue instance with its own data store filled with dummy/default data. We create a `get state` method so we can quickly access the data of the Vue instance we created. Next, we fetch the data, process it, and write it back to our Vue instance.

With all this in play, our data is now reactive.

```html
<template v-if="$SportsTicker.state.gameTime">
  {% raw %}
  {{ $SportsTicker.state.team }}'s last game results: {{ $SportsTicker.state.score.home }} - {{ $SportsTicker.state.score.away }}
  {% endraw %}
</template>
```

Because the data is reactive, the above view snippet will not show until we have data (checking `gameTime` is not null in this case). When the data is processed, it will trigger Vue to render the template and show the data.

All we needed to do was create our own Vue instance for the plugin to store the data, with a simple method to access it (`get state`).
