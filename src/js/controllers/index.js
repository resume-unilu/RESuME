/**
 * @ngdoc function
 * @name miller.controller:indexCtrl
 * @description
 * # IndexCtrl
 */
angular.module('miller')
  .controller('IndexCtrl', function ($rootScope, $scope, $log, $filter, $location, writings, news, keywords, RUNTIME) {
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

    var tagsContextFn = prepareTagsContext(false)
    writings.results.forEach(tagsContextFn)

    $scope.coverstories = _.take(writings.results, 3);//.shift();
    $scope.otherstories = _.takeRight(writings.results, writings.results.length - 3); //writings.results;
    // check cover of coverstory
    // if($scope.coverstory && $scope.coverstory.covers.length){
    //   var maincover = _.first($scope.coverstory.covers);

    //   $scope.coverstory.cover = _.get(maincover, 'metadata.thumbnail_url') || maincover.snapshot;

    // }


    $scope.news = news.results.map(excerpt);
    // tagcloud

    $scope.$watch('language', function (newValue, oldValue) {
      if (newValue === oldValue) {
        return;
      }
      drawWordCloud(keywords, newValue);

    });
    drawWordCloud(keywords, $rootScope.language);

    $log.debug('IndexCtrl welcome',$scope.news);
  });

function prepareKeywordList(rawKeywords, language) {
  if (rawKeywords.length === 0) {
    return
  }
  var res = [];
  var sizeSteps = rawKeywords.length / 5;
  rawKeywords.forEach(function (tag, i) {
    var currentStep = i === 0 ? 0 : parseInt((i * sizeSteps) / rawKeywords.length)
    var size = 7 - currentStep
    var name = getTranslatedTag(tag, language);

    res.push([
      name,
      size,
      '/publications?orderby=-date,-date_last_modified&filters={"tags__slug__and":["'+ tag.slug +'"]}'
    ])
  })
  return res;
}

function drawWordCloud(keywords, language) {
  var canvas = document.getElementById('tagcloud');
  var allTags = prepareKeywordList(keywords, language);

  WordCloud(canvas, {
    list: allTags,
    classes: 'force-pointer',
    click: function(item) {
      window.location.href = item[2]
    },
    color: function (word, weight) {
      if (weight >= 7) return '#4ECDC4';
      if (weight >= 5) return '#225a54';
      return '#1d4d48';
    },
    gridSize: Math.round(12 * canvas.width / 1024),
    weightFactor: function (size) {
      return Math.pow(size, 2.3) * canvas.width / 1024;
    },
    rotateRatio: 0,

  });
}