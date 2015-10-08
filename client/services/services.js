angular.module('greenfeels.services', [])

.factory('Prompts', ['$http', function($http) {
  var firstPrompts = [
  'Hi! How are you doing?',
  'Hey! How are you feeling?',
  'Hey! Wanna record how you\'re feeling?'
  ];
  // Get prompt #1 for intial state view of home page
  var getFirstPrompt = function() {
    return firstPrompts[Math.floor(Math.random() * firstPrompts.length)];
  };

  var secondPrompts = [
    [ // 😄
    'Awesome! Do you want to record any thoughts?',
    'That\'s great! Is there anything you want to write down?'
    ],
    [ // 😊
    'Good! Is there anything you\'d like to write down?',
    'Good! Want to write something about your mood?'
    ],
    [ // 😌
    'Would you like to record any of your thoughts?',
    'Is there anything you want to write down?',
    'Are there any details about your mood that you want to record?',
    'Would you like to write about how you\'re feeling?'
    ],
    [ // 😐
    'Would you like to record any of your thoughts?',
    'Is there anything you want to write down?',
    'Are there any details about your mood that you want to record?',
    'Would you like to write about how you\'re feeling?'
    ],
    [ // 😕
    'Would you like to record any of your thoughts?',
    'Is there anything you want to write down?',
    'Are there any details about your mood that you want to record?',
    'Would you like to write about how you\'re feeling?'
    ],
    [ // 😒
    'Is there anything you\'d like to write about how you\'re feeling?',
    'Are there any details about your mood that you want to record?'
    ],
    [ // 😞
    'Is there anything you\'d like to write about how you\'re feeling?',
    'Are there any details about your mood that you want to record?'
    ],
    [ // 😣
    'Is there anything you\'d like to write about how you\'re feeling?',
    'Are there any details about your mood that you want to record?'
    ] 
    ];

  // Get prompt #2 for selected state view of home page.
  // The `emotion` argument is the integer representing
  // the emoji that was selected.
  var getSecondPrompt = function(emotion) {
    var appropriatePrompts = secondPrompts[emotion];
    return appropriatePrompts[Math.floor(Math.random() * appropriatePrompts.length)];
  };

  return {
    getFirstPrompt: getFirstPrompt,
    getSecondPrompt: getSecondPrompt
  };
}])

.factory('Entries', ['$http', '$window', function($http, $window) {
  // Retrieves all of user's entries
  var getAll = function(lastSeen) {
    console.log(lastSeen);
    var username = $window.localStorage.getItem('moodlet.username');
    if (!username) {
      return;
    }

    return $http({
      method: 'GET',
      url: '/api/users/' + username + '/entries',
      headers: {
        'x-access-token': $window.localStorage.getItem('moodlet'),
        'x-last-seen': lastSeen
      }
    })
    .then(function(resp) {
      return resp.data;
    });
  };

  var methodEntry = function(method){
    return function(id,data){
      var username = $window.localStorage.getItem('moodlet.username');
      if (!username) {
        return;
      }
      return $http({
        method: method,
        url: '/api/users/' + username + '/' + 'entries' + '/' + id,
        headers: {'x-access-token': $window.localStorage.getItem('moodlet')},
        data:data
      })
      .then(function(resp) {
        return resp.data;
      });
    };
  };

  var getEntry = methodEntry('GET');
  var updateEntry = methodEntry('PUT');
  var deleteEntry = methodEntry('DELETE');

  // Adds user's entry
  var addEntry = function(post) {
    var username = $window.localStorage.getItem('moodlet.username');
    if (!username) {
      return;
    }
    return $http({
      method: 'POST',
      url: '/api/users/' + username + '/entries',
      headers: {'x-access-token': $window.localStorage.getItem('moodlet')},
      data: post
    });
  };

  var getWords = function(emotion) {
    var username = $window.localStorage.getItem('moodlet.username');
    if (!username) {
      return;
    }
    return $http({
      method: 'GET',
      url: '/api/users/' + username + '/words/' + emotion,
      headers: {'x-access-token': $window.localStorage.getItem('moodlet')}
    });
  };

  return {
    getAll: getAll,
    addEntry: addEntry,
    getEntry: getEntry,
    updateEntry: updateEntry,
    deleteEntry: deleteEntry,
    getWords: getWords
  };
}])

.factory('Auth', ['$http', '$window', function($http, $window) {

  var signin = function(user) {
    return $http({
      method: 'POST',
      url: '/api/users/signin',
      data: user
    })
    .then(function(resp) {
      return resp.data.token;
    });
  };

  var signup = function(user) {
    return $http({
      method: 'POST',
      url: '/api/users',
      data: user
    })
    .then(function(resp) {
      return resp.data.token;
    });
  };

  var isAuth = function() {
    return !!$window.localStorage.getItem('moodlet');
  };

  return {
    signin: signin,
    signup: signup,
    isAuth: isAuth,
  };

}])

.factory('Twemoji', function() {
    // Shared CDN host
    var urlBase = 'http://twemoji.maxcdn.com/';
    // Index corresponds to emotion value
    var imgs = [
    '1f604.png',
    '1f60a.png',
    '1f60c.png',
    '1f610.png',
    '1f615.png',
    '1f612.png',
    '1f614.png',
    '1f62b.png'
    ];
    // Getter takes int(0 - 7) as emotion and
    // int(16, 36, or 72) as size of image in pixels.
    // Use this function to fill in the `src=""` attribute
    // of an <img> tag.
    var getTwemojiSrc = function(emotion, size) {
      return urlBase + size + 'x' + size + '/' + imgs[emotion];
    };

    return {
      getTwemojiSrc: getTwemojiSrc
    };

  })

.factory('Spinner', function() {

    // Forgive the dangling commas. This was copied in from the generator.
    var opts = {
      lines: 17, // The number of lines to draw
      length: 7, // The length of each line
      width: 14, // The line thickness
      radius: 42, // The radius of the inner circle
      scale: 1, // Scales overall size of the spinner
      corners: 1, // Corner roundness (0..1)
      color: '#000', // #rgb or #rrggbb or array of colors
      opacity: 0.25, // Opacity of the lines
      rotate: 0, // The rotation offset
      direction: 1, // 1: clockwise, -1: counterclockwise
      speed: 1, // Rounds per second
      trail: 21, // Afterglow percentage
      fps: 20, // Frames per second when using setTimeout() as a fallback for CSS
      zIndex: 2e9, // The z-index (defaults to 2000000000)
      className: 'spinner', // The CSS class to assign to the spinner
      top: '50%', // Top position relative to parent
      left: '50%', // Left position relative to parent
      shadow: false, // Whether to render a shadow
      hwaccel: false, // Whether to use hardware acceleration
      position: 'absolute' // Element positioning
    };

    var create = function() {
      return new Spinner(opts);
    };

    return {
      create: create
    };

  });