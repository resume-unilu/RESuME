angular.module('miller')
  .directive('rangy', function($log, $rootScope, angularLoad, RUNTIME) {
    return {
      restrict: 'AE',
      templateUrl: RUNTIME.static + 'templates/partials/directives/rangy.html',// ',// template: '<div style="background:gold;height:150px; width:300px;"><div ng-click="highlightSelectedText($event)">add comment</div></div>',
      
      scope: {
        actor: '=',
        target: '=',
        highlights: '='
      },
      link: function(scope, element, attrs) {
        if(!attrs.container){
          $log.error('💾 rangy directive needs a container scope babe.');
          return;
        }

        var  idnum  = 0;
        
        

        scope.commented = function(err, comment){
          debugger
          if(err){
            $log.log('💾 rangy > commented() received an error:', err);
            return
          }
          debugger
        }


        $log.log('💾 rangy lazy loading rangy lib ... on: #'+ attrs.container)
        angularLoad.loadScript(RUNTIME.static + 'js/scripts.rangy.min.js').then(function() {
          $log.log('💾 rangy lib loading done; rangy.initialized:', rangy.initialized);
          if(!rangy.initialized)
            rangy.init();

          if(!$rootScope.rangy)
            $rootScope.rangy = {}
          
          if(!$rootScope.rangy.highlighters){
            $rootScope.rangy.highlighters = {};
            $rootScope.rangy.highlighters.highlight = rangy.createHighlighter();
            $rootScope.rangy.highlighters.highlight.addClassApplier(rangy.createClassApplier('highlight', {
              ignoreWhiteSpace: true,
              tagNames: ["span", "a"],
            }));
          }
          // $rootScope.rangy.highlighter.deserialize('type:textContent|5782$5919$1$highlight crazy${"data-id":"123456"}$')
          // prepare class applier, one for each comment ... no comment
          scope.prepareSelectedText = function(event) {
            $log.log('💾 rangy prepareSelectedText')
            if(rangy.getSelection().isCollapsed)
              return;
            // get top
            var offset = angular.element('#' + attrs.container).offset();

            element.css({'z-index':10,position: 'absolute', top: event.pageY - offset.top, left:event.pageX - offset.left});
            var h = $rootScope.rangy.highlighters.highlight.highlightSelection("highlight");
            scope.highlight = {
              h: h[0],
              s: $rootScope.rangy.highlighters.highlight.serializeHighlight(h[0])
            }
          };
          
          function createHighlighter(classname){
            if($rootScope.rangy.highlighters[classname])
              return $rootScope.rangy.highlighters[classname];
            var h = rangy.createHighlighter();
            h.addClassApplier(rangy.createClassApplier(classname, {
              ignoreWhiteSpace: true,
              tagNames: ["span", "a"],
              // normalize: true,
              exclusive: true
            }));
            $rootScope.rangy.highlighters[classname] = h
            return h;
          }

          /* render highlights */
          scope.renderHighlights = function(serializeds) {  
            serializeds.forEach(function(d) {
              // get clannema
              // var comments = ['type:textContent|4063$4150$1$s.120.c.1$${"hl":""}','type:textContent|4063$4159$5$s.120.c.2$${"hl":""}','type:textContent|6145$6291$2$highlight$${"data-id":"123456","data-highlight-id":"123456"}', 'type:textContent|5782$5919$1$highlight$${"data-highlight-id":"123456"}', ]
              var id = d.split('$')[3], // e.g: 'type:textContent|4063$4150$1$s.120.c.1$${"hl":""}' -> s.120.c.1
                  h;

              if(scope.serializedHighlights.indexOf(id) == -1) {
                h = createHighlighter(id);
                h.deserialize(d.contents.highlight);
                scope.serializedHighlights.push(id);
              }
            });
            $log.log('💾 rangy -> renderHighlights() serializedHighlights:', scope.serializedHighlights);
          };

        


          angular.element('#' + attrs.container).on('click', scope.prepareSelectedText);
          
          


          

          scope.$watchCollection('highlights', function(highlights) {
            if(highlights && highlights.length)
              scope.renderHighlights(highlights)
            else
              $log.log('💾 rangy @highlights no highlights found.');
          });

          // from story hidden comments serialized.

          // $rootScope.rangy.highlighter.deserialize('type:textContent|6145$6291$2$highlight$${"data-id":"123456"}|5139$5525$3$highlight$${"data-id":"ciao cazzo"}|4865$5545$5$highlight crazy$${"data-id":"ciao beddo"}')

        }).catch(function() {
        // There was some error loading the script. Meh
          $log.warn('💾 rangy lib error', 'ooooo');
        });
      }
    }
  })