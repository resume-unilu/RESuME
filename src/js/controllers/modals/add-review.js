angular.module('miller')
  .controller('AddReviewModalCtrl', function ($scope, $log, $q, story, ReviewFactory) {
    $log.info('AddReviewModalCtrl ready with crazy scope', arguments);

    $scope.reviewers = [];

    $scope.confirm = function() {
      if(!$scope.reviewers.length){
        $log.warn('AddReviewModalCtrl -> confirm() without any reviewers?');
        return
      }

      $log.info('AddReviewModalCtrl -> confirm()');

      $q.all(_($scope.reviewers).map(function(assignee){
        // create a review for this poor man.
        var p = ReviewFactory.save({},{
          assignee: assignee.id,
          story: story.id,
          category: 'double',
          contents:''
        });
        return p.$promise;
        // the poor man becomes a reviewer.
      }).value()).then(function(results){

        story.reviews = story.reviews.concat(results.map(function(a, i){
          a.assignee = $scope.reviewers[i];
          return a;
        }));
         $scope.$hide();
      }, function(){});



    };

    $scope.dismiss = function() {

    };
  });