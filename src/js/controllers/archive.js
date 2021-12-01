angular.module('miller')
  .controller('ArchiveCtrl', function ($scope, $rootScope, $log, $state, $timeout, $q, AuthorFactory, TagFactory, RUNTIME, EVENTS, keywords) {
    $scope.rootStatename = 'archives';
    $scope.mainStatename = 'archives.all';
    $scope.tagsStateurl = '/archives-resume';
    $scope.noFiltering = false;
    $scope.keywords = keywords;
    $scope.maxKeywords = 100;
    $scope.displayedKeywords = [];

    var availableRoutes = ['writing', 'tags'];

    $scope.availableRoutes = availableRoutes
      .map(function(d){
        return RUNTIME.routes.publications[d].map(function (o) {
          o.state = 'publications';
          return o;
        })
      })
      .flat()
      .filter(function (route) {
        return route.slug !== 'revue-ecu-euro';
      });

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
        label:'lastmod',
        value:'-date_last_modified'
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
    $scope.getTranslatedTag = function (tag) {
      return getTranslatedTag(tag, $rootScope.language);
    }
    $scope.displayMoreKeywords = function () {
      if ($scope.displayedKeywords.length === $scope.keywords.length) {
        return
      }

      Array.prototype.push.apply($scope.displayedKeywords,
        $scope.keywords.slice($scope.displayedKeywords.length, $scope.displayedKeywords.length + 10))
    }
    $scope.displayMoreKeywords();
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
          $log.warn('🔭 ArchiveCtrl sync() cannot parse filters correctly');
        }
      }
      if(initials.exclude){
        try{
          exclude = JSON.parse(initials.exclude);
        } catch(e){
          $log.warn('🔭 ArchiveCtrl sync() cannot parse filters correctly');
        }
      }


    }

    $scope.sync();
  });