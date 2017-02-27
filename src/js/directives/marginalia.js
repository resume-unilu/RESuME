/*
  Load comments related to the current story.
*/
angular.module('miller')
  .directive('marginalia', function($log, $window, $timeout, CommentFactory, RUNTIME) {
    return {
      restrict: 'AE',
      templateUrl: RUNTIME.static + 'templates/partials/directives/marginalia.html',// ',// template: '<div style="background:gold;height:150px; width:300px;"><div ng-click="highlightSelectedText($event)">add comment</div></div>',
  
      scope: {
        whenvisible: '&'
      },

      link: function(scope, element, attrs) {
        var t_eva, // timeout promise for evaluate function
            t_res, // timeout promise for resize function
            t_delay = 600, // $timeout delay
            
            w = angular.element(window),

            wh, // window height

            ws; // window scrolltop

        scope.is_visible = false;
        

        var evaluate = function() {
          var ot = element.offset().top,
              ws = w.scrollTop(),
              is_visible = wh + ws - 200 > ot;
          
          if(is_visible != scope.is_visible){
            scope.is_visible = is_visible;
            if(is_visible)
              scope.whenvisible()
          }
          $log.log('::marginalia -> evaluate() is_visible:', is_visible, '- wh:', wh, '- ws:', ws)
        }

        var resize = function(){
          $log.log('::marginalia -> resize()')
          wh = w.height();
        }


        // add listener for internal is_visible

        // do the resize and evaluate once
        $timeout(function(){
          resize();
          evaluate();

          // once the marginalia is visible, it loads the comments, NOT BEFORE!
          w.scroll(_.debounce(evaluate, t_delay));
          w.on('resize', _.debounce(resize, t_delay));
        }, 200);
        $log.log('::marginalia ready.')
      }
    }
  })