/**
 * @ngdoc function
 * @name miller.directives:lazy
 * @description
 * # marked
 * transform markdown data in miller enhanced datas
 */
angular.module('miller')
  .directive('codediff', function($log, angularLoad, RUNTIME) {
    return {
      restrict: 'A',
      scope: {
        raw: '=',
        diff: '='
      },
      template: "<div ng-class='{\"ready\": isReady}' id='versioned-contents'><textarea></textarea></div>",
      link: function(scope, el, attributes){
        scope.isReady = false;
        $log.log('::codediff loading...')
        angularLoad.loadScript(RUNTIME.static + 'js/lib/simplemde.min.js').then(function() {
          $log.log('::codediff lib loading done.');

          var cm = CodeMirror.fromTextArea(el.find('textarea')[0], {
            lineNumbers: false,
            readOnly: true,
            lineWrapping: true,
            mode: 'markdown'
          });

          cm.setValue(scope.raw)

          var displayDiff = function(diff) {
            if(typeof diff != 'object') {
              // reset diff if any;
              $log.log('::codediff -> displayDiff() no diff to display, codediff is ready.');
              scope.isReady = true;
              return
            }
            $log.log('::codediff -> displayDiff()');

            var lovely = /\[\-(.+?)\-\]|\{\+(.+?)\+\}/g

            // get lines to highlight
            for(var i in diff) {
              $log.log('::codediff', i, diff[i])

              // get line offset, the starting line (hence the -1)
              var loffset = i.match(/\+(\d+)[,\d\s]+?@@$/)[1] - 1;

              // concerned lines for this section:
              var lines = diff[i].split(/\n/);
              // $log.log('::codediff', lines);
              for(var j=0, jl=lines.length; j < jl; j++) {
                // match [32m till first [m and get chars info
                // $log.log('::codediff', j,lines[j])
                // has remarquable diffs?
                var hasDiffs = lines[j].match(lovely),
                    line = loffset + j - 1,
                    contents = lines[j].replace(lovely, function(m, del, add) {
                      return del || add;
                    }),
                    charoffset = 0;
                // set line style  based on what it matched.
                if(hasDiffs){
                  // cm.replaceRange(lines[j], {
                  cm.replaceRange(contents, {
                    line: line,
                    ch: 0
                  }, {
                    line:line,
                    ch: line.length
                  })
                  // add line class according to the nature of lovely match.
                  // if both add and del have been matched, it suhould be gray; otherwise light green or pink.
                  cm.addLineClass(line, 'wrap','mod');
                }

                while ((match = lovely.exec(lines[j])) != null) {
                  var isDel  = typeof match[1] != 'undefined',
                      left   = match.index - charoffset,
                      right  = match.index - charoffset + match[0].length - 4;

                  // $log.log('::codediff',"match found at " + match.index, match, 'on line:', line, charoffset, isDel);

                  // $log.log('::codediff',"match found at " + match.index, match[0], match[0].length, 'offset:', charoffset, 'ch:', left, right)
                  // $log.log('     matchC:', contents);
                  // $log.log('     matchO:', lines[j]);
                  cm.doc.markText({
                    line: line,
                    ch: left
                  }, {
                    line: line,
                    ch: right
                  }, {
                    className: typeof match[1] == 'undefined'? 'add': 'del'
                  })

                  // if(isDel)
                  //   charoffset = charoffset + match[0].length;
                  // else
                  charoffset += 4;

                  // add specific mark at line.
                }


                // lines[j].spli(/\[32m [m/, function(){
                //   console.log(args);

                // })
                scope.isReady = true;
              }


            }
          }
          // calculate diffs, watch;

          scope.$watch('diff', displayDiff);

          $log.log('::codediff ready.');
        })
      }
    }
  })
  .directive('mde', function ($log, $timeout, $modal,  $filter, DocumentFactory, StoryFactory, markdownItService, angularLoad, RUNTIME) {
    return {
      restrict: 'AE',
      scope: {
        mde: '=',
        settoc: '&',
        setdocs: '&',
        setmarked: '&',
        language: '=',
        diffs: '='
      },
      templateUrl: RUNTIME.static + 'templates/partials/directives/mde.html',
      link: function(scope, el, attributes){
        $log.log('::mde lib loading...')
        angularLoad.loadScript(RUNTIME.static + 'js/lib/simplemde.min.js').then(function() {
          $log.log('::mde lib loading done.');

          // active tab
          scope.activeStates = [];

          // toggle mde directive display to block.
          scope.isReady = true;
          // preview enabled or disabled
          scope.isPreviewEnabled = false;

          // secretize bookmarks. Automatically clean the code sent to initialvalue
          // will set SetBookmarks
          $log.log('::mde @link, language:', scope.language);

          var simplemde,
              timer,
              timer_recompile,
              timer_preview,
              wand = el.find('.wand').hide(),
              textarea = el.find('textarea').hide(),
              toolbox =  el.find('.toolbox').hide(),
              contents = $('#contents'),
              lookups=[],
              referenceModal = $modal({
                scope: scope,
                title: 'h',
                controller: 'EnrichModalCtrl',
                template: RUNTIME.static + 'templates/partials/modals/mde-enrich.html',
                show: false
              });

          function init(){
            textarea.show();
            wand.show();
            toolbox.show();

            simplemde = new SimpleMDE({
              element: textarea[0],
              spellChecker: false,
              status: false,
              toolbar: false,
              toolbarTips: false,
              initialValue: scope.mde
            });

            // assign overlay
            // simplemde.codemirror.addOverlay({
            //     name: 'invisibles',
            //     token:  function nextToken(stream) {
            //         var ret,
            //             spaces  = 0,
            //             peek    = stream.peek() === ' ';

            //         if (peek) {
            //             while (peek && spaces < Maximum) {
            //                 ++spaces;

            //                 stream.next();
            //                 peek = stream.peek() === ' ';
            //             }

            //             ret = 'whitespace whitespace-' + spaces;
            //         } else {
            //             while (!stream.eol() && !peek) {
            //                 stream.next();

            //                 peek = stream.peek() === ' ';
            //             }

            //             ret = 'cm-eol';
            //         }

            //         return ret;
            //     }
            // });


            var cursor,
                pos,
                stat,
                followCursor,
                // table of contents hash. Are there differences?
                pcursor;// = simplemde.codemirror.display.find('.Codemirror-cursor');


            // given a position, calculate the corresponding paragraph.
            //
            var currentBlockIndex = -1,
                currentBlock,
                footnotePattern = /\[\^\d+/;

            function moveCurrentBlock(pos) {
              // get paragraph / item number counting lines
              var blockIndex = 0,

                  NONE       = 'N',
                  EMPTY_LINE = 'E',
                  BLOCK      = 'B',
                  HEADER     = 'H',
                  FOOTNOTE   = 'F',

                  prevToken = NONE,
                  c =0;

              // simplemde.codemirror.doc.eachLine(0, pos.line + 1, function(line){
              //   var t = line.text.trim(),
              //       s = t.slice(0,5),// first 5 charcters
              //       token = t.length == 0? EMPTY_LINE: s.charAt(0) == '#'? HEADER: s.match(footnotePattern) ? FOOTNOTE: BLOCK;

              //   if((token === EMPTY_LINE && (prevToken === BLOCK  || prevToken === HEADER || prevToken === FOOTNOTE)) || (token === BLOCK && prevToken === HEADER))
              //     blockIndex++;
              //   console.log(c, t.substring(0, 20), token, '- before: ', prevToken, blockIndex);
              //   c++;
              //   prevToken = token;

              // });

              if(blockIndex == currentBlockIndex){
                // do nothing, it's the same as before.
                return
              }
              // currentBlockIndex = blockIndex;
              if(currentBlock)
                currentBlock.removeClass('active');

              // toggle class 'active' to block (paragraph, headings etc..) in contents window..
              currentBlock = contents.children().eq(blockIndex);
              if(!currentBlock.length)
                return;
              currentBlock.addClass('active');

              // calculate offsets.
              var ot = currentBlock[0].offsetTop,
                  lt = simplemde.codemirror.charCoords({line: pos.line, ch: 0}, "local").top;
              // $log.log('     l:', pos, '- p:', blockIndex, '- ot:', ot, '- tline:', lt);

              // contents.css('transform', 'translateY('+(lt - ot + 50)+'px)');
              // debugger
            }

            // listener codemirror@cursorActivity
            function move(){
              if(timer)
                clearTimeout(timer);

              timer = setTimeout(function(){

                if(simplemde.codemirror.display.cursorDiv.firstChild){
                  // console.log('moving cruising', simplemde.codemirror.getSelection(), 'crui')
                  cursor = {
                    top: simplemde.codemirror.display.cursorDiv.firstChild.offsetTop,
                    left: simplemde.codemirror.display.cursorDiv.firstChild.offsetLeft,
                    height: simplemde.codemirror.display.cursorDiv.firstChild.offsetHeight
                  };
                  wand.css('transform', 'translateY('+(cursor.top+cursor.height)+'px)');

                  if(followCursor)
                    toolbox.css('transform', 'translate('+(cursor.left)+'px,'+(cursor.top)+'px)');

                  // check cursor position: is it inside a BOLD or ITALIC?
                  pos = simplemde.codemirror.getCursor("start");
                  stat = simplemde.codemirror.getTokenAt(pos);

                  moveCurrentBlock(pos);

                  scope.activeStates = (stat.type || '').split(' ');
                  scope.$emit('mde.activestates', scope.activeStates);
                  scope.$apply();
                }
              }, 20);


            }



            // // listener for the selection object.
            var _isSelection;
            function beforeSelectionChange(e, sel){
              var isSelection = (sel.ranges[0].head.ch - sel.ranges[0].anchor.ch) !== 0;
              // selection is on and it has changed.
              if(isSelection && isSelection != _isSelection){
                toolbox.addClass('active');
              } else if(!isSelection && isSelection != _isSelection){
                toolbox.removeClass('active');
              }

              _isSelection = isSelection
            }



            /*
              Recompile with marked, analyzing the documents and
              the different stuff in the contents.
            */
            var _ToCHash,
                _docsHash;

            function recompile(){
              // $log.debug('::mde -> recompile() ...');
              var marked   = markdownItService(simplemde.value(), false, true),
                  ToCHash = md5(JSON.stringify(marked.ToC)),
                  docsHash = md5(_.map(marked.docs,'slug').join('--'));

              if(_ToCHash != ToCHash){
                $log.log('::mde -> recompile() items ToC:',marked.ToC.length, 'docs:', marked.docs.length, ToCHash);
                scope.settoc({items:marked.ToC});
              }
              if(_docsHash != docsHash){
                $log.log('::mde -> recompile() items docs:', _docsHash);
                scope.setdocs({documents: marked.docs});

              }
              scope.setmarked({marked: marked});
              // scope.$apply();
              // apply toc hash not to reload twice
              _ToCHash = ToCHash;
              _docsHash = docsHash;

              move();
            }

            // listener codemirror@update
            // update event, recompile after n milliseconds
            function onUpdate(e){
              var value = simplemde.value();
              if(textarea.val() != value){
                scope.mde = value; // set model
                textarea.val(value); // get headers after some time
              }
              move();
              if(timer_recompile)
                clearTimeout(timer_recompile);
              timer_recompile = setTimeout(function(){
                recompile();
                scope.$apply()
              }, 100);
            }

            // listener codemirror@changeEnd
            function onChange(e, change){
              var from = change.from;
              var text = change.text.join("\n");
              var removed = change.removed.join("\n");
              var to =  simplemde.codemirror.posFromIndex(simplemde.codemirror.indexFromPos(from) + text.length);

              simplemde.codemirror.markText(from, to, {
                className: 'mde-modified'
              })
            };

            // listener codemirror@focus
            function onFocus(e) {
              toolbox.show();
              wand.show()
            };
            // listener codemirror@focus
            function onBlur(e) {
              toolbox.hide();
              wand.hide();
            };
            // listener
            function beforeChange(){
              // debugger
            }

            simplemde.codemirror.on('update', onUpdate);
            simplemde.codemirror.on('cursorActivity', move);
            simplemde.codemirror.on('beforeSelectionChange', beforeSelectionChange);
            simplemde.codemirror.on('beforeChange', beforeChange);
            simplemde.codemirror.on('change', onChange);
            // simplemde.codemirror.on('focus', onFocus);
            // simplemde.codemirror.on('blur', onBlur);

            // if a settoc, ask for recompiling
            if(scope.settoc)
              timer_recompile = setTimeout(recompile, 20);

          }

          // listen window event, instance specific
          // var _isToolbarVisible;
          // $(window).on('scroll.mde', function(){
          //   var toolbarOffset = el.offset().top - st,
          //       isToolbarVisible =  toolbarOffset > 100;

          //   if(!isToolbarVisible)
          //     toolbox.css('transform', 'translate(0px,'+(100 - toolbarOffset)+'px)');
          //   else if(isToolbarVisible!==_isToolbarVisible)
          //     toolbox.css('transform', 'translate(0px,0px)');


          //   _isToolbarVisible = isToolbarVisible;
          // });

          // // on destry, destroy scroll event
          // scope.$on("$destroy", function(){
          //   $(window).off('scroll.mde');
          // });

          /*
            Modal tabs
          */

          // open modal tab and store previously open tab in this scope.
          scope.setTab = function(tab){
            scope.tab = tab;
          };
          scope.tab = 'CVCE';

          // preview url
          scope.previewUrl = function(url){
            if(timer_preview)
              $timeout.cancel(timer_preview);
            // check url
            var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&&#37;@!\-\/]))?/;
            if(!regexp.test(url)){
              $log.error('::mde -> previewUrl() url provided:', url, 'is not valid');
              return false;
            }
            url = url.replace('#', '.hash.');
            timer_preview = $timeout(function(){
              $log.debug('::mde -> previewUrl() url:', url);
              scope.suggestMessage = '(loading...)';
              // embedService.get(url).then(function(data){
              //   $log.debug(':: mde -> previewUrl() received:', data)
              //   scope.embed = data;
              //   scope.suggestMessage = '(<b>done</b>)';
              // });
            }, 20);
          };

          // suggest from different archives, w timeout
          var previous ;
          scope.suggestResults = [];
          scope.suggestMessage = '';
          scope.suggest = function(query, service){
            $log.log('::mde -> suggest()', scope.query, query);

            if(query.length < 3) {
              scope.suggestMessage = '(write something more)';
              scope.suggestResults = [];
              return;
            }

            // reset counters and lookups
            scope.lookups = [];
            scope.count = 0;
            scope.next = undefined;

            scope.suggestMessage = '(loading...)';
            // internal search
            if(service == 'favourite'){
              DocumentFactory.get({
                filters: JSON.stringify(query.length > 2? {contents__icontains: query}: {})
              },function(res){
                $log.log('::mde -> showReferenceModal documents loaded', res.results.length);

                scope.lookups = res.results;
                scope.suggestMessage = '(<b>' + res.count + '</b> results)';
              });
              return;
            } else if(service == 'glossary') {
              var params = {
                tags__slug: 'glossary'
              }
              if(query.length > 2)
                params.contents__icontains = query;

              StoryFactory.get({
                filters: JSON.stringify(params)
              },function(res){
                $log.log('::mde -> showReferenceModal documents loaded', res.results.length);

                scope.glossary = res.results;
                scope.suggestMessage = '(<b>' + res.count + '</b> results)';
              });
              return;
            }


          };

          // open
          scope.showReferenceModal = function(){
            if(scope.activeStates.indexOf("link") !== -1){
              $log.warn('oh dear, you should not click on it')
              return;
            }
            // if there is already a link, should add it.
            referenceModal.$promise.then(function(){
              $log.log('::mde -> showReferenceModal called');
              referenceModal.show();
            });

            // DocumentFactory.get(function(res){
            //   $log.log('::mde -> showReferenceModal documents loaded', res.results.length);

            //   scope.lookups = res.results;
            // });
            // console.log(simplemde)
            // debugger
          };



          scope.addDocument = function(type, contents, reference, url, embed){
            var slug;

            $log.debug('::mde -> addDocument() type:', type);

            if(type=='bibtex'){
              $log.debug('    reference:', bibtexParse.toJSON(reference));
              return;
            }


            if(type=='glossary'){
              referenceModal.hide();
              SimpleMDE.drawLink(simplemde,{
                // text: scope.selectedDocument.title,
                url: 'voc/' + scope.selectedDocument.slug
              });
              return;
            }

            if(type == 'crossref'){
              embed = angular.extend({
                type: type
              }, scope.selectedDocument || {});
              url = embed.doi;
              $log.debug('::mde -> addDocument() embed:', embed);

            }
            // case it is an url
            if(type=='url' || type == 'crossref'){
              if(!embed.title){ // should try again or wait a little
                referenceModal.hide();
                SimpleMDE.drawLink(simplemde,{
                  url: url
                });
                return;
              }
              slug = $filter('slugify')(embed.title).substr(0,100);
              // check reference and add this to the document metadata
              if(reference){
                embed.bibtex = reference;
              }

              DocumentFactory.save({
                title: embed.title,
                data: embed,
                type: (embed.type|| 'link').toLowerCase(),
                // slug:  slug,
                url: url
              }, function(res){
                $log.debug('::mde -> addDocument() document saved:', res.slug, res.id, res.short_url);
                if(res.slug){
                  referenceModal.hide();
                  if(type =='crossref') {
                    simplemde.codemirror.replaceSelection(
                      simplemde.codemirror.getSelection()
                      + '\n\n'
                      + embed.fullCitation
                      + ' [doi](doc/' + res.slug + ')'
                      + '\n\n'
                    );
                  } else {
                    SimpleMDE.drawLink(simplemde,{
                      url: 'doc/' + res.slug
                    });
                  }
                }
              }, function(err){
                // ignore duplicates (slug field) and put it directly.
                if(err.data.slug && _.keys(err.data).join('') == 'slug'){
                  if(type =='crossref') {
                    simplemde.codemirror.replaceSelection(
                      simplemde.codemirror.getSelection()
                      + '\n\n'
                      + embed.fullCitation
                      + ' [doi](doc/' + slug + ')'
                      + '\n\n'
                    );
                  } else {
                    SimpleMDE.drawLink(simplemde,{
                      url: 'doc/' + slug
                    });
                  }
                } else {
                  $log.error('::mde -> addDocument() cannot save document', err);
                }
              });
              return;
            }




            if(!scope.selectedDocument) {
              $log.warn('::mde -> addDocument() no document selected');
              return;
            }

            if(type == 'CVCE'){ // prefix it
              slug = 'cvce-'+scope.selectedDocument.details.doi;
              $log.debug('::mde -> addDocument() doc:', slug);
              DocumentFactory.save({
                title: scope.selectedDocument.title,
                // contents: JSON.stringify(scope.selectedDocument),
                data: scope.selectedDocument,
                // metadata: JSON.stringify(scope.selectedDocument),
                type: (scope.selectedDocument.type|| 'link').toLowerCase(),
                slug:  slug,
                url: url
              }, function(res){
                $log.debug('::mde -> addDocument() document saved:', res.slug, res.id, res.short_url);
                if(res.slug){
                  referenceModal.hide();
                  SimpleMDE.drawLink(simplemde,{
                    url: 'doc/' + res.slug
                  });
                }
              }, function(err){
                // debugger
                // ignore duplicates and put it directly.
                if(err.data.slug){
                  $log.debug('::mde -> addDocument() document already saved:', slug);
                  SimpleMDE.drawLink(simplemde,{
                    url: 'doc/' + slug
                  });
                }
              });
              return;
            }

            // document type
            if(scope.selectedDocument.type == 'bibtex'){

              SimpleMDE.drawLink(simplemde,{
                // text: '('+ scope.selectedDocument.metadata.author + ' '+ scope.selectedDocument.metadata.year +')',
                url: 'doc/' + scope.selectedDocument.slug
              });
            }
            // the document has been selected.
            $log.debug('::mde -> addDocument() doc:', scope.selectedDocument);
            // lock ui
            // draw link at the end of the db
            referenceModal.hide();
            SimpleMDE.drawLink(simplemde,{
              url: 'doc/' + scope.selectedDocument.slug
            });
          };

          scope.selectDocument = function(doc){
            $log.log('::mde -> selectDocument()', doc.id);

            if(scope.selectedDocument && scope.selectedDocument.id == doc.id){
              // $log.log('::mde -> selectDocument() unselecting previous', doc.url);
              scope.isSomethingSelected = false;
              scope.selectedDocument = false;
            } else {
            scope.isSomethingSelected = true;
            scope.selectedDocument = angular.copy(doc);
            }
          };

          scope.$on('mde.toolbox', function(event, data) {
            // debugger
            scope.action(data.action);
          })

          scope.action = function(action) {
            if(action == 'togglePreview'){
              scope.isPreviewEnabled = !scope.isPreviewEnabled;
            }
            SimpleMDE[action](simplemde);
          };

          // take into account custom font-face rendering.
          $timeout(init, 50);
          return;

        })
      }
    };
  });