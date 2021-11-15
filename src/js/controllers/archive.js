angular.module('miller')
  .controller('ArchiveCtrl', function ($scope, $log, $state, $timeout, $q, AuthorFactory, TagFactory, RUNTIME, EVENTS) {
    $scope.rootStatename = 'archives';
    $scope.mainStatename = 'archives.all';
    $scope.noFiltering = true;
    $scope.availabileOrderby = [];
  });