/**
 * @ngdoc function
 * @name miller.controller:PulseCtrl
 * @description
 * # PulseCtrl
 * socket connection for user notifications.
 * Used directly below CoreCtrl
 */
angular.module('miller')
  .controller('ReviewCtrl', function ($scope, $rootScope, $log, $state, review, ReviewFactory, RUNTIME, EVENTS) {
    $log.log('⏱ ReviewCtrl ready');

    
    $scope.fields = [
      'thematic','interest', 'originality', 'innovation', 'interdisciplinarity', 'methodology', 'clarity', 'argumentation','structure', 'references', 'pertinence'];

    $scope.availableStatuses = [
      'draft', 'complete', 'refusal', 'bounce'
    ];
    
    // initial status
    $scope.reviewStatus = ''+review.status;
    // you can edit a review only if it is not completed and if you're the assignee...
    // save method on api side enforces this.
    $scope.is_assignee = review.assignee.username == $scope.user.username;
    $scope.is_editable = $scope.is_assignee && (review.status == 'draft' || review.status == 'initial');


    $scope.save = function(){
      $log.debug('⏱ ReviewCtrl @SAVE');
      $scope.$emit(EVENTS.MESSAGE, 'saving');
      $scope.lock();
      if($scope.isSaving){
        $log.warn('wait, try again in. Is still saving.')
        return
      }
      $scope.isSaving = true;

      answers = {}
      // remap: we patch object only for some fields.
      for(s in $scope.fields){
        var field = $scope.fields[s];
        answers[field] = $scope.review[field]
        answers[field + '_score'] = $scope.review[field + '_score'] || 0
      }

      answers.contents = JSON.stringify($scope.review.contents);
      
      answers.status = 'draft';
      
      ReviewFactory.patch({
        id: review.id
      }, answers, function(review){
        $scope.review = review;
        $log.debug('⏱ ReviewCtrl @SAVE: success');
        $scope.$emit(EVENTS.MESSAGE, 'saved');
        $scope.unlock();
        $scope.isSaving = false;
        $scope.toggleStopStateChangeStart(false);
      }, function(err){
        $log.warn('⏱ ReviewCtrl @SAVE: error', err);
        $scope.$emit(EVENTS.MESSAGE, 'error!');
        $scope.unlock();
        $scope.isSaving = false;
      })
    };


    $scope.finalize = function(status){
      $log.debug('⏱ ReviewCtrl -> finalize() status:', status);
      $scope.$emit(EVENTS.MESSAGE, 'closing the review');
      $scope.lock();
      if($scope.isSaving){
        $log.warn('wait, try again in. Is still saving.')
        return;
      }
      $scope.isSaving = true;

      var answers = {}
      // remap: we patch object only for some fields.
      for(s in $scope.fields){
        var field = $scope.fields[s];
        answers[field] = $scope.review[field]
        answers[field + '_score'] = $scope.review[field + '_score'] || 0
      }

      answers.contents = JSON.stringify($scope.review.contents);
      answers.status   = status;

      ReviewFactory.patch({
        id: review.id
      }, answers, function(res){
        $log.debug('⏱ ReviewCtrl -> finalize(): success', res);
        
        $scope.unlock();
        $scope.isSaving = false;
        $state.go('report',{id: review.id});
      }, function(err){
        $log.warn('⏱ ReviewCtrl @SAVE: error', err);
        $scope.$emit(EVENTS.MESSAGE, 'Your request cannot be resolved. Is the review submitted already?');
        $scope.unlock();
        $scope.isSaving = false;
      })
    }

    // autosave draft with debounce.
    var autosave = _.debounce(function(){
      $scope.save();
    }, 5000, {
      leading: true,
      trailing: false
    });

    // calculate final score based on fields.
    $scope.$watch('review', function(r, p){
      if(r){
        var filledIn = _.filter(r, function(d, k){
          return k.indexOf('_score') != -1;
        })
        $scope.points = filledIn.reduce(function(a,b){
          return a + b;
        });
        
        $scope.is_valid = _.compact(filledIn).length == $scope.fields.length && (r.contents.text || '').trim().length > 0;
        $log.log('⏱ ReviewCtrl @review - points:', $scope.points, '- can be submitted:',$scope.is_valid, '- filled in fields:',_.compact(filledIn).length);
        
        if($scope.is_editable)
          autosave();
        
      }
    }, true)

    $scope.review = review;
    $scope.$on(EVENTS.SAVE, $scope.save);
  }); 
  