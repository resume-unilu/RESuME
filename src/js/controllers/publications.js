/**
 * @ngdoc function
 * @name miller.controller:PublicationCtrl
 * @description
 * # PublicationCtrl
 * Handle the publication page.
 */
angular.module('miller')
  .controller('PublicationsCtrl', function ($scope, $log, $state, $timeout, $q, AuthorFactory, TagFactory, RUNTIME, EVENTS) {
    $log.log('🔭 PublicationsCtrl welcome');
    // the list of links, both main writings and other secondary writings.
    $scope.mainStatename = 'publications.all';
    $scope.availableRoutes = [
      {
        state: 'publications',
        urls: RUNTIME.routes.publications.writing
      },
      {
        state: 'publications',
        urls: RUNTIME.routes.publications.tags
      }
    ];

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

    // list of service premises to build the hallof fames
    var HallOfFames = [];


    $scope.hallOfFame = {};

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
      
      $log.log('🔭 PublicationsCtrl sync()', $scope.state);
      
      // if its one of the "monographies", we get the publishable items associated. Optioanlly we can even deliver something
      if(RUNTIME.monographies.indexOf($scope.state) !== -1) {
        HallOfFames.push(TagFactory.hallOfFame({
          tag__filters: JSON.stringify({
            category: 'publishing'
          }),
          orderby: 'slug',
          filters: JSON.stringify(filters),
          exclude: JSON.stringify(exclude),
          limit: 10
        }, function(res){
          $scope.hallOfFame.publishings= {
            count: res.count,
            results: res.results
          }
        }, function(){
          debugger
        }).$spromise);
      } else{
        delete $scope.hallOfFame.publishings
      }

      // add the hall of fame top authors promise to the queue
      HallOfFames.push(AuthorFactory.hallOfFame({
        filters: JSON.stringify(filters),
        exclude: JSON.stringify(exclude),
        limit: 10
      }, function(res){
        $scope.hallOfFame.topAuthors = {
          count: res.count,
          results: res.results
        }
      }).promise);



      $q.all(HallOfFames, function(){
        $log.log('🔭 PublicationsCtrl sync() $q.all() finished', $scope.state);
      });
      // chain of eventssyn
      
    }

    $scope.sync();
    $scope.$on(EVENTS.PARAMS_CHANGED, function(){
      $log.log('🔭 PublicationsCtrl @EVENTS.PARAMS_CHANGED');
      $scope.sync();
    });

    

  });
