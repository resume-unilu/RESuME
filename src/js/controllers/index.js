/**
 * @ngdoc function
 * @name miller.controller:indexCtrl
 * @description
 * # IndexCtrl
 */
angular.module('miller')
  .controller('IndexCtrl', function ($scope, $log, $filter, $location, writings, news, RUNTIME) {
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
        story.excerpt[i] = $filter('tokenize')(story.data.abstract[i], 38)

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
    $scope.popularTags = RUNTIME.routes.publications.tags

    var allTags = []
    RUNTIME.routes.publications.tags.concat(RUNTIME.routes.publications.writing).forEach(function (tag) {
      allTags.push([
        tag.name || tag.slug,
        7,
        '/publication?orderby=-date,-date_last_modified&filters={"tags__slug__and":["'+ tag.slug +'"]}'
      ])
    })

    // allTags.forEach(function (tag) {
    //   var displayName = tag.name || tag.slug;
    //   $scope.cloudData.push({text: displayName, weight: 1, link: "https://google.com"})
    // })

    // $scope.visitTag = function (tag) {
    //   var newLocation = '/publication?orderby=-date,-date_last_modified&filters={"tags__slug__and":["'+ tag +'"]}'
    //   // JSON.stringify(newLocation)
    //   console.log($location.path(newLocation))
    // }

    // tagcloud
    var canvas = document.getElementById('tagcloud')
    console.log(canvas.width)
    console.log(allTags)
    WordCloud(canvas, {
      list: allTags,
      classes: 'force-pointer',
      click: function(item) {
        console.log(item)
        console.log($location.path(item[2]))
      },

      // gridSize: Math.round(16 * 470 / 1024),
      // weightFactor: function (size) {
      //   return Math.pow(size, 2.3) * 470 / 1024;
      // },

      gridSize: Math.round(12 * canvas.width / 1024),
      weightFactor: function (size) {
        return Math.pow(size, 2.3) * canvas.width / 1024;
      },
      rotateRatio: 0,

    });


    $log.debug('IndexCtrl welcome',$scope.news);
  });
