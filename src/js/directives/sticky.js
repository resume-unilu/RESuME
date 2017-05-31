angular.module('miller')
  .directive('sticky', function($log, $window, $timeout) {
    return {
      restrict: 'AE',
      scope:{

      },
      link: function(scope, element, attrs) {
        var w  = angular.element(window),
            pl = angular.element('<div class="sticky-placeholder"></div>'),

            offsetTop = parseInt(attrs.offset || 100),
            _is_bottom_visible = true,
            _is_top_visible    = false;

        pl.insertBefore(element);
        // clone css style

        scope.is_top_visible = false;

        var resize = function(){
          // $log.log('::sticky -> resize()')
          wh = w.height();
          evaluate();
        }

        var evaluate = function() {
          var ot = pl.offset().top,
              ws = w.scrollTop();

          // bottom visibility
          _is_bottom_visible = wh + ws > ot;

          // top visibility
          _is_top_visible = ws + offsetTop < ot;

          $log.log('::sticky -> evaluate() -id:', attrs.id, '-btm:', _is_bottom_visible, '-top:', _is_top_visible, '-ot:', ot, offsetTop)

          if(scope.is_top_visible != _is_top_visible) {
            if(!_is_top_visible){
              element.addClass('top-sticky')
            } else {
              element.removeClass('top-sticky');
            }
            scope.is_top_visible = _is_top_visible;
          }

          if(scope.is_visible != _is_bottom_visible){
            if(!_is_bottom_visible){
              element.addClass('sticky');
            } else {
              element.removeClass('sticky');
            }

            scope.is_visible = _is_bottom_visible;
          }
        }

        // var onScroll = _.debounce(evaluate, 3, {leading: true});
        // var onResize = _.debounce(resize, 100, {leading: true})

        $timeout(function(){
          
          // once the sticky is visible, it loads the comments, NOT BEFORE!
          w.on('scroll', evaluate);
          w.on('resize', resize);
          resize();
          $log.log('::sticky ready.');
        }, 200);
        
        scope.$on('$destroy', function(){
          w.off('scroll', evaluate);
          w.off('resize', resize);
          $log.log('::sticky killed.');
        })
        

      }
    }
  });