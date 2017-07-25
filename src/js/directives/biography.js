/**
 * @ngdoc function
 * @name miller.directives:biography
 * @description
 * # biography
 * BUild a smart biography based on activity date.
 */
angular.module('miller')
  .directive('biography', function($log, $rootScope, $window, $timeout, RUNTIME, EVENTS) {
      var FRAME_MARGIN_TOP = 15,
          FRAME_MARGIN = 35,
          LIFESPAN_HEIGHT = 90,
          ACTIVITY_HEIGHT = 25,

          utils = {};


      utils.calculateBoundaries = function(from, to, offset, ratio) {
        console.log('♾ biography from:', from, 'to:', yearTo, 'w:',(yearTo - from), 'l:',(from - biography.mindate))
        return {
          width: lifespan.ratio * (yearTo - from), 
          left: lifespan.ratio  * (from - biography.mindate)
        }
      };
    // #frame
    //   #lifespan
    //   #focus
    return {
      restrict : 'A',
      scope:{
        data: '='
      },
      templateUrl: RUNTIME.static + 'templates/partials/directives/biography.html',
      link: function(scope, element, attrs) {

        var isReady = false,

            biography = {
              element: element.find('.biography'),
              tooltip: element.find('.biography-tooltip'),
              height: 0,
              width: 0,
              years:{
                min: 0,
                max: 0,
                delta: 0
              },
              ratio: 0 // 1year in px
            },

            lifespan  = {
              years: {
                min: Infinity,
                max:-Infinity,
                delta: 0
              }
            },

            focus = {
              years: {
                min: 0,
                max: 0,
                delta: 0
              }
            }
            
            leftdate  = {},
            rightdate = {};
        
        scope.tooltip = {
          idx: -1
        };

        scope.init = function(){
          if(!scope.data.activities || !scope.data.activities.length) {
            $log.warning('♾ biography init(), no activities data available! Skipping')
            return;
          }

          // sort activities.
          scope.data.activities = scope.data.activities.sort(function(a, b){
            return a.start_date > b.start_date? 1: a.start_date == b.start_date? a.end_date > b.end_date? 1:-1: -1;
          })

          // get the height once
          biography.height = Math.max(300, FRAME_MARGIN_TOP + LIFESPAN_HEIGHT + scope.data.activities.length * 25);
          biography.element.height(biography.height);

          biography.years.max = (typeof scope.data.end_date == "string"? new Date(scope.data.end_date): new Date()).getFullYear();
          biography.years.min = (new Date(scope.data.start_date)).getFullYear();
          biography.years.delta   = biography.years.max - biography.years.min
          
          // calculate min/max date from data activities
          for(var i=0, l=scope.data.activities.length ; i <l; i++){ 
            if(scope.data.activities[i].start_date)
              lifespan.years.min = Math.min(scope.data.activities[i].start_date, lifespan.years.min)
            if(scope.data.activities[i].end_date)
              lifespan.years.max = Math.max(scope.data.activities[i].end_date, lifespan.years.max)
            else if (scope.data.activities[i].start_date){
              lifespan.years.max = Math.max(scope.data.activities[i].start_date, lifespan.years.max)
            }

            // scope.data.activities[i].timeline = {}
            // $log.log('♾ biography init()', scope.data.activities[i].start_date, scope.data.activities[i].end_date)
          } 
          if(!lifespan.years.min  || !lifespan.years.max){
            $log.warning('♾ biography -> init(), error in boundaries');
            return
          }
          // lifespan.years.min = 1938;
          // lifespan.years.max = 1939;
          lifespan.years.delta = lifespan.years.max - lifespan.years.min;
          // printout logs
          $log.log('♾ biography -> init(), biography:', biography, '- lifespan:', lifespan) //


          // $log.log('♾ biography -> n. activities:', scope.data.activities);
          isReady = true
          scope.render();

        }


        
        scope.render = function() { 
          if(!isReady)
            return;

          
          // get the width once.
          var availableWidth = parseInt(biography.element.width());
          
          if(biography.width == availableWidth) {
            // nothing needs to be recalculated, skipping.
            return
          }
          biography.width = availableWidth;
          biography.ratio = (biography.width - FRAME_MARGIN*2)/biography.years.delta;

          

          

          lifespan.width = biography.ratio*lifespan.years.delta;
          lifespan.left  = biography.ratio*(lifespan.years.min - biography.years.min);
          lifespan.right = biography.ratio*(biography.years.max-lifespan.years.max)
          lifespan.ratio = (biography.width - FRAME_MARGIN*2 - 20)/lifespan.years.delta;

          $log.log('♾ biography -> render() \n  biography:\n  - width:',biography.width,'\n  - ratio:', biography.ratio,'\n  - delta:',biography.years.delta, '\n\n  lifespan:\n  - width:', lifespan.width,'\n  - ratio:', lifespan.ratio,'\n  - delta:',lifespan.years.delta);


          // // for each activity, calculate activity width
          scope.data.activities = scope.data.activities.map(function(activity) {
            activity.height = ACTIVITY_HEIGHT;
            // activity.start_date
            activity.left = lifespan.ratio*(activity.start_date - lifespan.years.min);
            activity.right = lifespan.ratio*(lifespan.years.max - activity.end_date);

            
            if(!activity.end_date) {
              activity.end_date = activity.start_date;
              activity.end_date_fuzzy = true;
            }

            if(!activity.start_date) {
              activity.end_date = activity.end_date;
              activity.start_date_fuzzy = true;
            }

            // where is description?
            activity.uniqdate = activity.start_date == activity.end_date;


            activity.nodate = !activity.start_date && !activity.end_date;

            $log.log('♾ biography -> render()', activity.start_date, activity.end_date)

            var _left = activity.left + lifespan.ratio*(activity.end_date - activity.start_date) + 10,
                _right = (biography.width - FRAME_MARGIN*2 - 20) - lifespan.ratio*(activity.start_date - lifespan.years.min) + 40;

            if(!activity.uniqdate)
              _left += 29;


            activity.description.alignment = _left > _right? 'left': 'right';
            activity.description.left = _left;
            activity.description.right = _right;

            return activity;
          })


          scope.lifespan = lifespan;
          scope.biography = biography;
          
          
          
          $rootScope.$emit(EVENTS.RESIZE)
        }
        
        scope.showTooltip = function(activity, idx, event, lock){
          scope.tooltip = activity;
          scope.tooltip.idx = idx;
          var left = activity.left,
              bottom  = (scope.data.activities.length - idx) * ACTIVITY_HEIGHT + 10;

          scope.tooltip.left   = left;
          scope.tooltip.bottom = bottom;
          

          if(lock)
            scope.tooltip.locked = true;
          //   scope.tooltip.out;
        }

        scope.hideTooltip = function(force) {
          if(scope.tooltip.locked && !force){
            return
          } else if(scope.tooltip) {
            scope.tooltip.idx = -1;
          }
        }

        scope.cleanUp = function() {
          angular.element($window).off('resize', scope.render);
        }
        
        scope.init();
        angular.element($window).on('resize', scope.render);
        scope.$on('$destroy', scope.cleanUp);
      }
    }
  })