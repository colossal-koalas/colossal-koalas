var home = angular.module("greenfeels.home");

home.controller("HomeController", ["$scope", "$state", "Prompts", "Posts", function($scope, $state, Prompts, Posts) {
  // Upon load, initialize first prompt. Display of this prompt will depend on the state.
  // Cache the initial prompt in case we want to return to this state.
  var initPrompt = Prompts.getFirstPrompt();
  $scope.prompt = initPrompt;

  // Initialize a blank model for the post.
  $scope.post = { };

  // Handler for clicking on an emoji on the spectrum. Transitions state, changes to new prompt,
  // and captures the code of the selected emotion on the tentative post model.
  $scope.selectHandler = function($event) {
    $state.transitionTo("home.selected");
    $scope.prompt = Prompts.getSecondPrompt();
    $scope.post.emotion = $event.target.attr("data-emotion-id");
  };

  $scope.submit = function() {
    // TODO: Use submit service to submit the post to the server
    Posts.addPost(JSON.stringify($scope.post));
    $scope.post = { };
  };

}]);