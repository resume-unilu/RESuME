angular.module('miller')
  .controller('FinalDecisionModalCtrl', function ($scope, $log, $q, story, ReviewFactory) {
    $log.info('FinalDecisionModalCtrl ready with crazy scope', arguments);

    $scope.reviewers = [];

    $scope.review = {
      status: false,
      contents: { 
      }
    };

    $scope.availableStatus = ['approved', 'bounce', 'refusal'];


    $scope.confirm = function() {
      if(!$scope.review.status){
        $log.warn('FinalDecisionModalCtrl -> confirm() without any finalStatus?');
        return
      }
      if($scope.isSaving){
        $log.warn('FinalDecisionModalCtrl -> confirm() please wait, is still saving data...')
      }
      $scope.isSaving = true;

      $log.info('FinalDecisionModalCtrl -> confirm()', $scope.review.status);

      ReviewFactory.close({
        story: story.id,
        contents: $scope.review.contents,
        status: $scope.review.status
      }, function(){
        $scope.isSaving = false;
        story.status = 'reviewdone';
        $scope.$hide();
      }, function(){
        debugger
        $scope.isSaving = false;
      })
      // $q.all(_($scope.reviewers).map(function(assignee){
      //   // create a review for this poor man.
      //   var p = ReviewFactory.save({},{
      //     assignee: assignee.id,
      //     story: story.id,
      //     category: 'double',
      //     contents:''
      //   });
      //   return p.$promise;
      //   // the poor man becomes a reviewer.
      // }).value()).then(function(results){
        
      //   story.reviews = story.reviews.concat(results.map(function(a, i){
      //     a.assignee = $scope.reviewers[i];
      //     return a;
      //   }));
      //    $scope.$hide();
      // }, function(){
      //   debugger
      // });


     
    };

    $scope.dismiss = function() {

    };
  });