if (document.getElementById('instagram-feed')) {
  var userFeed = new Instafeed({
    target      : 'instagram-feed',
    get         : 'user',
    userId      : 28731503,
    accessToken : '28731503.094d5ca.fae36b394ed74458a282d7410ed1606a',
    limit       : 8,
    resolution  : 'low_resolution',
    template    : '<li><a href="{{link}}" tagret="_blank"><img src="{{image}}" /><span>&#9829; {{likes}}</span></a></li>'
  });
  userFeed.run();
}

var youtube = document.querySelector('iframe[src*=youtu]');
if (youtube) {
  var new_youtube   = '<div class="video-wrapper">'+youtube.outerHTML+'</div>';
  youtube.outerHTML = new_youtube;
}