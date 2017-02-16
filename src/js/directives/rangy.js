angular.module('miller')
  .directive('rangy', function($log, $rootScope, angularLoad, RUNTIME) {
    return {
      restrict: 'AE',
      link: function(scope, element, attrs) {

        if(!attrs.container){
          $log.error('💬 rangy directive needs a container scope babe.');
          return;
        }
        $log.log('💬 rangy loading... on: #'+ attrs.container)
        angularLoad.loadScript(RUNTIME.static + 'js/scripts.rangy.min.js').then(function() {
          $log.log('💬 rangy lib loading done; rangy.initialized:', rangy.initialized);
          if(!rangy.initialized)
            rangy.init();

          var highlightSelectedText = function() {
            $rootScope.rangy.highlighter.highlightSelection("highlight");
            console.log($rootScope.rangy.highlighter.serialize())
          };

          if(!$rootScope.rangy) {
            $rootScope.rangy = {}

          }
          if(!$rootScope.rangy.highlighter){
            $rootScope.rangy.highlighter = rangy.createHighlighter();

            $rootScope.rangy.highlighter.addClassApplier(rangy.createClassApplier("highlight", {
              ignoreWhiteSpace: true,
              tagNames: ["span", "a"]
            }));
            
          }

          angular.element('#' + attrs.container).on('click', highlightSelectedText);
          
          $rootScope.rangy.highlighter.deserialize('type:textContent|5782$5919$1$highlight$')
          
          $rootScope.rangy.highlighter.deserialize('type:textContent|6145$6291$2$highlight$')

        }).catch(function() {
        // There was some error loading the script. Meh
          $log.warn('💬 rangy lib error', 'ooooo');
        });
      }
    }
  })