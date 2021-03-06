/**
 * @ngdoc function
 * @name miller.controller:indexCtrl
 * @description
 * # IndexCtrl
 */
angular.module('miller')
  .controller('IndexCtrl', function ($scope, $log, $filter, writings, news) {
    $log.debug('IndexCtrl welcome', writings, news);
    $scope.setOG({
      type: 'platform'
    });

    function excerpt(story) {
      story.excerpt = {}
      if(story.tags && story.tags.length && _.filter(story.tags, {slug: 'collection', category:'writing'}).length){
        story.is_collection = true
      }
      story.keywords = _.filter(story.tags, {category: "keyword"})
      for(var i in story.data.abstract)
        story.excerpt[i] = $filter('tokenize')(story.data.abstract[i], 32)

      return story
    }

    writings.results = writings.results.map(excerpt);

    $scope.coverstories = _.take(writings.results, 3);//.shift();
    $scope.otherstories = _.takeRight(writings.results, writings.results.length - 3); //writings.results;
    
    // check cover of coverstory
    // if($scope.coverstory && $scope.coverstory.covers.length){
    //   var maincover = _.first($scope.coverstory.covers);

    //   $scope.coverstory.cover = _.get(maincover, 'metadata.thumbnail_url') || maincover.snapshot;

    // }


    $scope.news = news.results.map(excerpt);
    $log.debug('IndexCtrl welcome',$scope.news);


  });
  