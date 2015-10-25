/**
 * New angular file
 */

 (function(window){
 
  // creating global namespace for our App.
  window.mychart= {}; 

  var app = angular.module('myapp', ['ngRoute','mychart']);

  app.config(['$routeProvider',function($routeProvider){
  }]);

}(window));