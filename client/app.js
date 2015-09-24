var app = angular.module("greenfeels", ["greenfeels.services, greenfeels.home, greenfeels.journal, greenfeels.graph, ui.router"]);

app.config(["$stateProvider, $urlRouteProvider", function($stateProvider, $urlRouteProvider) {

  $stateProvider
    .state("home", {
      // Parent state of home; load home.html, set controller, use initial state (first prompt)
      views: {

        nav: {
          // TODO: Nav views
        },

        page: {
          templateUrl: "./home/home.html",
          controller: "HomeController"
        }

      }
    })
    .state("home.initial", {
      // Initial nested state; display first prompt
      views: {

        initial: {
          templateUrl: "./home/home.init.html"
        }

      }
    })
    .state("home.selected", {
      // Selected state of home; load second prompt, display text input and submit button
      views: {

        selected: {
          templateUrl: "./home/home.selected.html"
        }
        
      }
    })
    .state("journal", {

    })
    .state("graph", {

    })
    .state("signin", {

    })
    .state("signup", {

    });


}]);