/*
  It allows to leave comments on a specific target by a specific actor ...
*/
angular.module('miller')
  .directive('commenter', function($log, $rootScope, angularLoad, CommentFactory, EVENTS, RUNTIME) {
    return {
      restrict: 'AE',
      templateUrl: RUNTIME.static + 'templates/partials/directives/commenter.html',// ',// template: '<div style="background:gold;height:150px; width:300px;"><div ng-click="highlightSelectedText($event)">add comment</div></div>',
      scope: {
        target: "=",
        actor: "=",
        highlight: '=',
        commented: '&',
        discarded: '&',

        commentsSelected: '='
      },
      link: function(scope, element, attrs) {
        // shorturls of comments
        scope.cachedCommentsUid = [];
        scope.cachedComments = [];

        scope.comments = []

        scope.allowDiscard = !!scope.discarded
        // scope.content = 'A nice way to fit this space here. I love it!\n This is foching awesome'
        // scope.quote = 'this is the quoted part'
        scope.leaveComment = function(comment) {
          $log.log(':: commenter > leaveComment() called');
          if(scope.isLoading){
            $scope.warn(':: commenter is already doing something')
            return
          }
          scope.isLoading = true;

          var highlights = scope.highlight? scope.highlight.s: '';

          // if there are comments, we use their highlight range to "answer"
          // this is a confused workaround, sorry for that.
          // the goal of all this is: when you slect an already existing range on the page, you will automatically leacve your comment as "REPLY"
          // without directly reply to the comment.
          if(!scope.highlight && scope.comments.length && scope.commentSelectedHighlights){
            var highlightsParts = scope.commentSelectedHighlights.split('$'); 
            highlightsParts[3] = 'highlight';// as default rangy
            highlights = highlightsParts.join('$');
          }



          CommentFactory.save({
            contents: JSON.stringify({
              'content': scope.content,
              'quote': scope.quote || ''
            }),
            highlights: highlights,
            story: scope.target.id
          }, function(res){
            scope.content = ''
            // scope.quote = null
            scope.isLoading = false
            // res.contents = JSON.parse(res.contents);
            $log.log(':: commenter > leaveComment() success', res);
            scope.commented({error: null, comment: res});
            scope.comments.unshift(res);
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
          scope.content = ''
        });

        scope.$watchCollection('commentsSelected', function(uids) {
          if(uids && uids.length){
            // var uids_to_be_loaded = _.difference(uids, scope.cachedCommentsUid);
            CommentFactory.get({
              filters:JSON.stringify({
                short_url__in: uids
              })
            }, function(res){ 
              // console.log(res)
              scope.totalComments = res.count;
              scope.comments = res.results;

              // firt comment quotes
              var com = _(scope.comments, 'contents.quote').map().first();
              
              if(com){
                scope.quote = com.contents.quote;
                scope.commentSelectedHighlights = com.highlights;
              }
              // highlight

            })
          } else {
            scope.totalComments = 0;
            scope.comments = [];
          }
          
        });

        $rootScope.$on(EVENTS.SOCKET_USER_COMMENTED_STORY, function(event, data){

        })

        $log.log(':: commenter ready');
      }
    }
  })
  .directive('commenterQuote', function(){
    return {
      restrict: 'A',
      scope: {
        quote: '=commenterQuote'
      },
      link: function(scope, element, attrs){
        // shorten scope.quote
        scope.$watch('quote', function(text){
          if(text){
            var words = text.trim().split(/\s+/);
            
            element.html(words.length > 6? _.take(words, 3).concat(['[...]'], _.takeRight(words, 3)).join(' '):text);  
          }
        })        
      
      }
    }
  })