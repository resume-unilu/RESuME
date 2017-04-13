/**
 * @ngdoc function
 * @name miller.controller:ReviewsCtrl
 * @description
 * # ReviewsCtrl
 * Used by Reviewers, this controller allows to follow your review status.
 */
angular.module('miller')
  .controller('ReviewsCtrl', function ($scope, $log, RUNTIME, EVENTS) {
    $log.log('⏱ ReviewsCtrl ready');

    $scope.mainStatename = 'reviews.all';

    $scope.availableRoutes = [
      {
        state: 'reviews',
        urls: RUNTIME.routes.reviews
      }
    ]; // ['pending', 'done'];
    
    $scope.availabileOrderby = [
      {
        label:'newest',
        value:'-date_last_modified'
      },
      {
        label:'oldest',
        value:'date_last_modified'
      },
      {
        label:'statusaz',
        value:'status'
      },
      {
        label:'statusza',
        value:'-status'
      },
      {
        label:'typeaz',
        value:'category'
      },
      {
        label:'typeza',
        value:'-category'
      },
    ];

    $scope.sync = function(){
      $scope.ordering = _.get(_.find($scope.availabileOrderby, {value: $scope.qs.orderby}),'label') || 'newest';
    };
    $scope.sync();
    $scope.$on(EVENTS.PARAMS_CHANGED, function(){
      $log.log('⏱ ReviewsCtrl @EVENTS.PARAMS_CHANGED');
      $scope.sync();
    });
  });