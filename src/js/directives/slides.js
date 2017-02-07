/**
 * @ngdoc function
 * @name miller.directives:embedit
 * @description
 * # slides
 * Vertical carousel for homepage
 */
angular.module('miller')
  .directive('slides', function($log, $timeout, $rootScope) {
    return {
      link: function(scope, element, attrs) {
        scope.isVertical = !!attrs.vertical;
        scope.currentIndex = 0;
        scope.numSlides = [0,1,2];

        scope.currentHeight = 0;
        scope.currentOffset = 0;

        var timer;
        var UP = -1,
            DOWN = +1;

        scope.direction = DOWN;

        scope.loop = function() {
          // last slide or first slide?
          if(scope.direction == DOWN && scope.currentIndex ==  scope.numSlides.length -1) {
            scope.direction = UP;
          } else if(scope.direction == UP && scope.currentIndex == 0) {
            scope.direction = DOWN;
          }


          var index = scope.currentIndex + scope.direction;
          // $log.log('slides loop(), next idnex:', index)
          scope.jumpTo(index)
        }

        scope.next = function(){
          // calculate next element.find('.slide')
          scope.jumpTo(scope.currentIndex + 1);
        }

        scope.prev = function(){
          // calculate next element.find('.slide')
          scope.jumpTo(scope.currentIndex - 1);
        }

        scope.jumpTo = function(index){
          if(!scope.isDOMready) {
            $log.warn('No RAIL FOUND');
            return
          }

          index = Math.max(Math.min(index, scope.numSlides.length - 1), 0);

          if(index != scope.currentIndex){
            scope.currentIndex = index;
            scope.slide();
          }
        }

        scope.pause = function() {
          // console.log('paused.')
          if(timer)
            $timeout.cancel(timer);
        }

        scope.play = function() {
          // console.log('play!')
          if(timer)
            $timeout.cancel(timer);
          if(typeof attrs.autoscroll != 'undefined')
            timer = $timeout(scope.loop, 3000);
        }

        // do resize in height
        scope.slide = function(){
          // console.log('resize for', scope.currentIndex)
          var slide = element.find('.slide').get(scope.currentIndex);
          
          scope.currentHeight = slide.clientHeight;
          
          // if(scope.isVertical)
          scope.currentOffset = slide.offsetTop;

          if(attrs.adapt)
            element.height(scope.currentHeight);

          $rootScope.$emit('lazyImg:refresh');
          
          if(timer)
            $timeout.cancel(timer);
          if(typeof attrs.autoscroll != 'undefined')
            timer = $timeout(scope.loop, 6000);
        }

        
        $timeout(function(){
          scope.isDOMready = true;
          scope.slide();
        },0)
      }
    }
  });