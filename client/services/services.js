angular.module('greenfeels.services', [])

.factory('Prompts', ['$http', function ($http) {
  //get prompt #1 for intial state view of home page
  var getPrompt1 = function () {
    return $http({
      method: 'GET',
      url: '/api/prompts'
    })
    .then(function (resp) {
      //do something to select appropriate prompt
      return resp.data;
    });
  };

  //get prompt #2 for selected state view of home page 
  var getPrompt2 = function (emoji) {
    return $http({
      method: 'GET',
      url: '/api/prompts'
    })
    .then(function (resp) {
      //do something to select appropriate prompt
      return resp.data;
    });
  };

  return {
    getPrompt1: getPrompt1,
    getPrompt2: getPrompt2
  };
}])

.factory('Posts', ['$http', function ($http) {
  //retrieves all of user's posts
  var getAll = function () {
    return $http({
      method: 'GET',
      url: '/api/posts'
    })
    .then(function (resp) {
      return resp.data;
    });
  };

  //adds user's post
  var addPost = function (post) {
    return $http({
      method: 'POST',
      url: '/api/posts',
      data: post
    });
  };

  return {
    getAll: getAll,
    addPost: addPost
  };
}])

.factory('Auth', ['$http', '$location', '$window', function ($http, $location, $window) {
  
  var signin = function(user) {
    return $http({
      method: 'POST',
      url: '/api/users/signin',
      data:user
    })
    .then(function(resp) {
      return resp.data.token;
    });
  };

  var signup = function (user) {
    return $http({
      method: 'POST',
      url: '/api/users/signup',
      data: user
    })
    .then(function (resp) {
      return resp.data.token;
    });
  };

  var isAuth = function () {

  };

  var signout = function () {

  };

  return {
    signin: signin,
    signup: signup,
    isAuth: isAuth,
    signout: signout
  };

}]);
