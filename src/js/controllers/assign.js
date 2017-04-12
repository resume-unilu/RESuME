/**
 * @ngdoc function
 * @name miller.controller:PulseCtrl
 * @description
 * # AssignCtrl
 * Used by Chief Reviewers, this controller allows both to assign reviewers
 * to stories and to set the final decision for publication/refusal.
 */
angular.module('miller')
  .controller('AssignCtrl', function ($scope, $log, $modal, ReviewFactory, UserFactory, RUNTIME, EVENTS) {
    $log.log('⏱ AssignCtrl ready');

    
    var addReviewModal,
        finalDecisionModal;

    // those are for our listofitems template
    $scope.mainStatename = 'assign.all';

    $scope.availableRoutes = [
      {
        state: 'assign',
        urls: RUNTIME.routes.assign
      }
    ]; // ['pending', 'done'];
    
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
    };
    

    /*
      for reviewmodal typeahead 
    */
    $scope.suggestReviewer = function(query, options) {
      // if(!$scope.user.is_staff){
      //   $log.warn('🍔 CoreCtrl -> suggestReviewer is avaialble to staff only, you should not be here.'); 
      // }
      $log.log('⏱ AssignCtrl -> suggestReviewer', query, options);
      var filters = options || {};
      return UserFactory.getReviewers({}).$promise.then(function(response) {
        return response.results;
      });
    };

    /*
      Add a review modal
      Cfr also locationChangeSuccess listener 
    */
    $scope.addReview = function(story) {
      $log.log('⏱ AssignCtrl -> open addReviewModal.');
      
      addReviewModal = $modal({
        scope: $scope, 
        controller: 'AddReviewModalCtrl',
        resolve:{
          story: function() {
            return story
          }
        },
        templateUrl: RUNTIME.static + 'templates/partials/modals/add-review.html',
        id: 'addReview',
      });
      addReviewModal.$promise.then(addReviewModal.show);
    }

    $scope.finalDecision = function(story) {
      $log.log('⏱ AssignCtrl -> open finalDecisionModal.');
      finalDecisionModal = $modal({
        scope: $scope, 
        controller: 'FinalDecisionModalCtrl',
        resolve:{
          story: function() {
            return story
          }
        },
        templateUrl: RUNTIME.static + 'templates/partials/modals/final-decision.html',
        id: 'addReview',
      })
      finalDecisionModal.$promise.then(finalDecisionModal.show);
    }

    $scope.sync();
    $scope.$on(EVENTS.PARAMS_CHANGED, function(){
      $log.log('⏱ AssignCtrl @EVENTS.PARAMS_CHANGED');
      $scope.sync();
    });
  })