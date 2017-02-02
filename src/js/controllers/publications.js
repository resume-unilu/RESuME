/**
 * @ngdoc function
 * @name miller.controller:PublicationCtrl
 * @description
 * # PublicationCtrl
 * Handle the publication page.
 */
angular.module('miller')
  .controller('PublicationsCtrl', function ($scope, $log, $state, $timeout, AuthorFactory, RUNTIME, EVENTS) {
    $log.log('🔭 PublicationsCtrl welcome');
    // the list of links, both main writings and other secondary writings.
    $scope.urls = RUNTIME.stories;
    
    if($state.params.slug)
      $scope.slug = $state.params.slug;

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
      
      // transform filterrs from initials (they are for publication story, not for story.authors)
      var initials = $state.current.resolve.initials(),
          params = {
            limit: 10
          },
          filters = {},
          exclude = {};

      if(initials.filters){
        try{
          filters = angular.extend(JSON.parse(initials.filters), $scope.filters);
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
      
      AuthorFactory.hallOfFame({
        filters: JSON.stringify(filters),
        exclude: JSON.stringify(exclude)
      }, function(res){
        $scope.hallOfFame = {
          count: res.count,
          results: res.results
        }
      })
    }

    $scope.sync();
    $scope.$on(EVENTS.PARAMS_CHANGED, function(){
      $log.log('🔭 PublicationsCtrl @EVENTS.PARAMS_CHANGED');
      $scope.sync();
    });

    

  });
