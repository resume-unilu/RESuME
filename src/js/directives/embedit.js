/**
 * @ngdoc function
 * @name miller.directives:embedit
 * @description
 * # embedit
 * allows embedding of html. 
 * If an object and a language are provided, it handles the translation.
 */
angular.module('miller')
  /*
    Like embedit, translated according to $rootScope language.
    use:
    
    ```
    <span rewording value='object' default='{{data.name}}'></span>
    ```
    
    where object is 

    object = {
      fr_FR: 'krkrkrkr',
      en_US
    }

  */
  .directive('rewording', function($rootScope, EVENTS) {
    return {
      restrict : 'A',
      scope: {
        value: '=',
        follow: '=',
        highlight: '&?' // highlight function
      },
      template: '<span ng-bind-html="renderedValue"></span>',
      link: function(scope, element, attrs) {
        scope.render = function(event, language) {
          if(!language) {
            return;
          }
          var _renderedValue = attrs.default;

          if(typeof scope.value == 'object') {
            _renderedValue = _.get(scope.value, language);
            if(!_renderedValue)
              _renderedValue = _(scope.value).filter().first()
          }

         

          if(scope.highlight) {
            scope.renderedValue = scope.highlight({text: _renderedValue});
          } else {
            scope.renderedValue = _renderedValue || attrs.default;
          }
        }
        scope.$on(EVENTS.LANGUAGE_CHANGED, scope.render);
        
        scope.follow && scope.$watch('follow', function(v) {
          if(v)
            scope.render(null, $rootScope.language);
        });

        scope.render(null, $rootScope.language);
      }
    }
  })
  .directive('embedit', function($sce, $timeout, $filter) {
    return {
      restrict : 'A',
      scope:{
        embedit: '=',
        stretch: '=',
        language: '=',
        firstline: '='
      },
      link: function(scope, element, attrs) {
        // console.log('::embedit @link, language:', scope.language, scope.embedit)
        // markdownit options
        var options = {
          breaks:       true,
          linkify:      true,
          html: true
        }, 
        disable = ['image', 'heading'],
        stretching_timeout = 10000,
        stretching_time = 0,
        stretching;

        scope.do_strech = function(){
          var els = element.find('iframe').width('100%').height('100%').attr('height', '100%');
          if(stretching)
            $timeout.cancel(stretching);
          if(!els.length){
            if(stretching_time > stretching_timeout) {
              console.warn('embedit :: skipping stretching iframe, time exceeded.');
            } else {
              console.log('embedit :: iframe not found, but stretch is set to true. Calling do_stretch again in a few ms...');
              stretching = $timeout(scope.do_strech, 300);
              stretching_time +=300;
            }
          } else{
            element.css('opacity', 1)
            console.log('embedit :: iframe Stretched.');
          }
        }

        scope.render = function(language) {
          if(!scope.embedit)
            return;
          // get contents
          if(language && typeof scope.embedit == 'object') {            
            var altlanguage =  _.filter(scope.embedit, _.identity).pop(),
                contents = scope.embedit[language] || scope.embedit['en_US'] || altlanguage || '';
          } else {
            contents = scope.embedit
          }

          if(attrs.excerpt) {
            contents = $filter('tokenize')(contents, parseInt(attrs.excerpt) || 32)
          }

          if(attrs.markdown){
            var md = new window.markdownit(options)
                .disable(disable);
            contents = attrs.markdown=='inline'? md.renderInline(contents): md.render(contents)
          } else {
            // smplie '\n'
            contents = contents.split(/[\n\r]+/).join('<br/>')
          }
            
          if(scope.firstline) {
            contents = contents.split(/<br\s?\/?>/).shift();
          }
            
          
          element.html(contents);



          if(scope.stretch){
            scope.do_strech();
          }
          // autoplay from attrs. Works only on iframe.
          if(attrs.autoplay){
            var  src = element.find('iframe').attr('src');
            element.find('iframe').attr('src', src + (src.indexOf('?') == -1? '?': '&') + 'autoplay=1');
            console.log('embedit :: Activating autoplay on iframe...', src)
          }
        };
        
        if(scope.stretch){
          // element.css('opacity', 0)
        }
        // enable listeners
        if(scope.language && typeof scope.embedit == 'object') {
          scope.$watch('language', scope.render);
        } else {
          scope.$watch('embedit', scope.render);
        }

        // if(attrs.watch)
        //   scope.$watch('embedit', function(obj){
        //     if(obj)
        //       scope.render
        //   });
      }
    }
  });