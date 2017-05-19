/**
 * @ngdoc function
 * @name miller.controller:AuthorsCtrl
 * @description
 * # AuthorsCtrl
 * list our authors!
 */
angular.module('miller')
  .controller('AuthorsCtrl', function ($scope, $log, RUNTIME, EVENTS) {
    $log.log('⏱ AuthorsCtrl ready');
    $scope.mainStatename = 'authors.all';

    $scope.availableRoutes = [
      {
        state: 'authors',
        urls: RUNTIME.routes.authors.writing
      },
      {
        state: 'authors',
        urls: RUNTIME.routes.authors.tags
      }
    ];

    $scope.availabileOrderby = [
      {
        label:'publishedrecently',
        value:'-stories__date'
      },
      {
        label:'lastnameaz',
        value:'data__lastname'
      },
      {
        label:'lastnameza',
        value:'-data__lastname'
      },
    ];

    $scope.sync = function(){
      $scope.ordering = _.get(_.find($scope.availabileOrderby, {value: $scope.qs.orderby}),'label') || 'lastnameaz';
    };
    $scope.sync();
    $scope.$on(EVENTS.PARAMS_CHANGED, function(){
      $log.log('⏱ AuthorsCtrl @EVENTS.PARAMS_CHANGED');
      $scope.sync();
    });
  });
  