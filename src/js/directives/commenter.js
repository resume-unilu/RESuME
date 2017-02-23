/*
  It allows to leave comments on a specific target by a specific actor ...
*/
angular.module('miller')
  .directive('commenter', function($log, $rootScope, angularLoad, CommentFactory, RUNTIME) {
    return {
      restrict: 'AE',
      templateUrl: RUNTIME.static + 'templates/partials/directives/commenter.html',// ',// template: '<div style="background:gold;height:150px; width:300px;"><div ng-click="highlightSelectedText($event)">add comment</div></div>',
      scope: {
        target: "=",
        actor: "=",
        highlight: '=',
        commented: '&',
        discarded: '&'
      },
      link: function(scope, element, attrs) {
        // scope.content = 'A nice way to fit this space here. I love it!\n This is foching awesome'
        // scope.quote = 'this is the quoted part'
        scope.leaveComment = function(comment) {
          $log.log(':: commenter > leaveComment() called');
          if(scope.isLoading){
            $scope.warn(':: commenter is already doing something')
            return
          }
          scope.isLoading = true;
          
          CommentFactory.save({
            contents: JSON.stringify({
              'content': scope.content,
              'quote': scope.quote || ''
            }),
            highlights: scope.highlight? scope.highlight.s: '',
            story: scope.target.id
          }, function(res){
            scope.content = ''
            scope.quote = ''
            scope.isLoading = false
            $log.log(':: commenter > leaveComment() success', res);
            scope.commented({error: null, comment: res});
          }, function(err){
            if(err.data) {
              scope.errors = err.data
            }
            scope.isLoading = false;
            $log.error(':: commenter > leaveComment() failed', err);
            scope.commented({error: err, comment:null});
          })
        };

        // press on discard button. It is normally enabled once the "quote" is in place
        scope.discard = function(event) {
          $log.log(':: commenter > discard()');
          scope.discarded();
          event.stopImmediatePropagation();
        };

        // watch for direct quotations
        scope.$watch('highlight', function(highlight) {
          $log.log(':: commenter @highlight:',highlight);
          if(highlight && highlight.h){
            scope.quote = highlight.h.getText();
          } else{
            scope.quote = null
          }
        });
      }
    }
  })