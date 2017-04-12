/**
 * @ngdoc function
 * @name miller.controller:BlogCtrl
 * @description
 * # BlogCtrl
 * list stories of type blogpost.
 */
angular.module('miller')
  .controller('BlogCtrl', function ($scope, $log, RUNTIME, EVENTS) {
    $log.log('⏱ BlogCtrl ready');
    $scope.mainStatename = 'blog.all';

    $scope.availableRoutes = [
      {
        state: 'blog',
        urls: RUNTIME.routes.blog
      }
    ];

    $scope.availabileOrderby = [
      {
        label:'newest',
        value:'-date,-date_last_modified'
      },
      {
        label:'oldest',
        value:'date,-date_last_modified'
      },
      {
        label:'titleaz',
        value:'title'
      },
      {
        label:'titleza',
        value:'-title'
      },
    ];

    $scope.sync = function(){
      $scope.ordering = _.get(_.find($scope.availabileOrderby, {value: $scope.qs.orderby}),'label') || 'newest';
    };
    $scope.sync();
    $scope.$on(EVENTS.PARAMS_CHANGED, function(){
      $log.log('⏱ BlogCtrl @EVENTS.PARAMS_CHANGED');
      $scope.sync();
    });
  });
  