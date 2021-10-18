angular.module('miller')
  .controller('ArchiveCtrl', function ($scope, $log, $state, $timeout, $q, AuthorFactory, TagFactory, RUNTIME, EVENTS) {
    $scope.lite = true;
    $scope.rootStatename = 'publications';
    $scope.mainStatename = 'publications.all';
    $scope.availableRoutes = [];
    $scope.availabileOrderby = [];
    $scope.sync = function(){

      // transform filterrs from initials (they are for publication story, not for story.authors)
      var initials = $state.current.resolve.initials(),
          params = {
            limit: 10
          },
          filters = {},
          exclude = {},
          ordering;

      ordering = _.get(_.find($scope.availabileOrderby, {value: $scope.qs.orderby}),'label')

      if(!ordering && initials.orderby)
        ordering = _.get(_.find($scope.availabileOrderby, {value: initials.orderby}),'label')

      if(!ordering)
        ordering = 'newest';


      $scope.ordering =  ordering;


      if(initials.filters){
        if($scope.state == 'publications.tags')
          initials.filters['tags__slug__all'] = [$state.params.slug];
        //    debugger;

        try{
          filters = angular.extend({}, initials.filters, $scope.filters);
        } catch(e){
          $log.warn('🔭 PublicationsCtrl sync() cannot parse filters correctly');
        }
      }
      if(initials.exclude){
        try{
          exclude = JSON.parse(initials.exclude);
        } catch(e){
          $log.warn('🔭 PublicationsCtrl sync() cannot parse filters correctly');
        }
      }

      $log.log('🔭 PublicationsCtrl sync()', $scope.state);

    }

    $scope.sync();
  });