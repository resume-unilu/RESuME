/**
 * @ngdoc function
 * @name miller.directives:lazy
 * @description
 * # marked
 * transform markdown data in miller enhanced datas
 */
angular.module('miller')
  .constant('LAZY', {
    'QUALITY_HIFI': 'hifi',
    'QUALITY_SNAPSHOT': 'snapshot'
  })
  .directive('lazyCover', function($log, $timeout, LAZY, RUNTIME) {
    return {
      restrict : 'A',
      templateUrl: RUNTIME.static + 'templates/partials/directives/lazy-cover.html',
      scope: {
        media: '='
      },
      link: function(scope, element, attrs) {
        var url;

        scope.render = function(quality) {
          if(scope.media.type=='video' || scope.media.type=='rich'){ // no hifi for them!!!
            scope.quality =  LAZY.QUALITY_SNAPSHOT;
          } else {
            scope.quality = attrs.quality || LAZY.QUALITY_HIFI;
          }

          if(_.values(LAZY).indexOf(scope.quality) == -1){
            $log.error('lazy-cover: quality attribute should be one of these:', _.keys(LAZY), '- received:', attrs.quality);
            return
          }
          if(typeof scope.media != 'object'){
            $log.error('lazy-cover: media attribute should be an object, received:', scope.media)
            return
          }

          if(scope.media.metadata){
            scope.offsetx = scope.media.metadata.thumbnail_offset_x || 'center';
            scope.offsety = scope.media.metadata.thumbnail_offset_y || 'center';
          }
          
          switch(scope.quality){
            case LAZY.QUALITY_HIFI: 
              scope.src = scope.media.metadata? (scope.media.metadata.media_url || _.get(scope.media, 'metadata.urls.Publishable') || scope.media.metadata.thumbnail_url || scope.media.metadata.preview || scope.media.metadata.url || scope.media.attachment || scope.media.snapshot): (scope.media.attachment || scope.media.snapshot);
              break;
            case LAZY.QUALITY_SNAPSHOT:
              scope.src = scope.media.metadata? (scope.media.metadata.thumbnail_url || scope.media.metadata.preview || _.get(scope.media, 'metadata.urls.Preview')  || scope.media.snapshot || scope.media.attachment || scope.media.metadata.url): (scope.media.snapshot || scope.media.attachment);
              break;
          }
          $log.log('lazy-cover ready - src:', scope.src, 'quality:', scope.quality)
        }

        // scope.render();
        $timeout(scope.render, 0)
      }
    }
  })
  .directive('lazyImage', function ($log) {
    return {
      restrict : 'A',
      scope: {
        src: '='
      },
      link : function(scope, element, attrs) {
        $log.log(':::lazy on ',scope.src);

        element.addClass('lazy-box').css({
          'background-color': '#B7B2B2',
        }).html('<div class="loading">...</div>');
        
        function wakeup(){
          element.css({
            'background-size': attrs.size || 'cover',
            'background-position': 'center center',
            'background-repeat': 'no-repeat',
            'background-image': 'url(' + scope.src + ')'
          });
          element.find('.loading').hide();
        }

        scope.$watch('src', function(v){
          if(v)
            wakeup(); // or start watching for in page
        });

      }
    };
  })
  /*
    lazy placeholder for document or for stories, filled when needed only.
  */
  .directive('lazyPlaceholder', function($log, $rootScope, $compile, LAZY, RUNTIME) {
    return {
      //transclude: true,
      scope:{
       
      },
      templateUrl: RUNTIME.static + 'templates/partials/directives/lazy-placeholder.html',
      link : function(scope, element, attrs) {
        var slug = element.attr('lazy-placeholder'),
            type = element.attr('type');

        // its parent ist a footnote directive. we set the quality to snapshot
        if(scope.$parent.footnote){
          scope.quality = LAZY.QUALITY_SNAPSHOT;
        } else if(attrs.quality){
          scope.quality = attrs.quality;
        } else {
          scope.quality =  LAZY.QUALITY_HIFI;
        }

        scope.type = type;
        scope.user = $rootScope.user;
        
        scope.language = $rootScope.language;
        $log.log('⏣ lazy-placeholder on type:', type, '- slug:',slug, 'lang');
        
        scope.complete = function(res){
          // add to this local scope
          if(res){
            scope.resolved = res;
            $log.log('⏣ lazy-placeholder resolved for type:', type, '- slug:',slug);
            // force recompilation
            $compile(element.contents())(scope);

          } else {
            $log.error('⏣ lazy-placeholder cannot find slug:', slug);
          }
        }

        if($rootScope.resolve && typeof slug=='string'){
          $rootScope.resolve(slug, type, scope.complete);
        }

        scope.fullsize = function(slug, type){
          $rootScope.fullsize(slug, type);
        }
        
      }
    }
  })

  .directive('respectPreviousSibling', function($log, $timeout){
    return {
      scope:{
        update: '='
      },
      restrict : 'A',
      link: function(scope, element, attrs){
        $log.log('🚀 respect-previous-sibling ready')
        var p;

        function setHeight(){
          $log.log('🚀 respect-previous-sibling > setHeight()')
          // debugger
          $timeout.cancel(p)
          p = $timeout(function(){
            element.height(Math.max(element.prev()[0].offsetHeight, attrs.minHeight || 300));
          }, 500);
        }


        

        setHeight();
        angular.element(window).bind('resize', setHeight);


        // scope.$watch('update', function(){
        //   setHeight();
        // }, true);
      }
    }
  });

