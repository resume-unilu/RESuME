/**
 * @ngdoc function
 * @name miller.controller:WritingCtrl
 * @description
 * # DraftCtrl
 * handle saved story writing ;)
 */
angular.module('miller')
  .controller('WritingCtrl', function ($rootScope, $scope, $log, $q, $modal, $filter, $timeout, story, localStorageService, StoryFactory, StoryTagsFactory, StoryDocumentsFactory, CaptionFactory, MentionFactory, DocumentFactory, AuthorFactory, EVENTS, RUNTIME) {
    $log.debug('WritingCtrl writing title:', story.title, '-id:', story.id, '- current language:',$scope.language);

    $scope.isDraft = false;
    $scope.isSaving = false;
    $scope.isCollection = false;

    $scope.story = story;
    
    // just to be sure
    if(typeof $scope.story.metadata !== 'object'){
      $scope.story.metadata = {
        title: {},
        abstract: {}
      }
    }

    // if multilanguage fields do not exists for metadata
    ['title', 'abstract'].forEach(function(field){
      if($scope.language && !$scope.story.metadata[field][$scope.language]){
        $scope.story.metadata[field][$scope.language] = story[field]
      }
    });

    $scope.id    = story.id;
    
    // form will be linked to current languages. Cfr watch language below.
    $scope.title    = $scope.story.metadata.title[$scope.language];
    $scope.abstract = $scope.story.metadata.abstract[$scope.language];
    $scope.contents = story.contents;

    // $scope.date     = story.date;
    $scope.keywords = _.filter(story.tags, {category: 'keyword'});

    
    $scope.displayedTags = _.filter(story.tags, function(d){
      if(d.slug == 'collection'){
        $scope.isCollection = true
      }
      return d.category != 'keyword';
    });

    $scope.metadata = {
      status: story.status,
      owner: story.owner
    };

    $scope.setStatus = function(status) {
      $scope.metadata.status = status;
      $scope.save();
    };


    var initialItems = {
      doc: _.map(story.documents, 'slug'),
      voc: _.map(story.stories, 'slug')
    };
    /*
      Save or delete documents according to text contents.
    */
    $scope.sideItems = [];
    $scope.setDocuments = function(items) {
      $log.log('WritingCtrl -> setDocuments()', items.length);
      // get the difference (store item.slug only)
      var tobesaved   = {
            doc: [],
            voc: []
          },
          tobedeleted = {
            doc: [],
            voc: []
          },
          tobekept = {
            doc: [],
            voc: []
          };

      
      
      // which document / stories needs to be saved?
      for(var i=0; i<items.length; i++) {
        var t = items[i]._type == 'block-doc'? 'doc' : items[i]._type;
        if(!initialItems[t])
          continue; // just ignore other types
        else if(initialItems[t].indexOf(items[i].slug) === -1) 
          tobesaved[t].push(items[i].slug);
        else
          tobekept[t].push(items[i].slug);
      }

      tobedeleted.doc = _.difference(initialItems.doc, tobekept.doc, tobesaved.doc);
      tobedeleted.voc = _.difference(initialItems.voc, tobekept.voc, tobesaved.voc);

      $log.log('... tobesaved:', tobesaved)
      $log.log('... tobedeleted:', tobedeleted)
      $log.log('... tobekept:', tobekept)
     
      // if something needs to be done, start the chain
      // if(tobesaved.voc.length || tobedeleted.voc.length || tobesaved.doc.length || tobedeleted.doc.length ){
        $q.all(_.compact(
          _.uniq(tobesaved.doc).map(function(slug) {
            var p = CaptionFactory.save({
              story: story.id,
              document: {
                slug: slug
              }
            }, function(res) {
              $log.warn('... CaptionFactory.save success', res);
              // documents.push(res);
              // update initialItems.doc ;)
            }, function(err) {
              $log.warn('... CaptionFactory.save failed', err);
            }).promise;
            return p;
          })
          .concat(_.uniq(tobesaved.voc).map(function(slug) {
            $log.log('... saving voc->story slug:', slug);
            var p = MentionFactory.save({
              from_story: story.id,
              to_story: {
                slug: slug
              }
            }, function(res) {
              $log.log('... saving voc->story success', res);
              // documents.push(res);
              // update initialItems.doc ;)
            }, function(err) {
              $log.warn('... saving voc->story success failed miserably: ', err);
            }).promise;
            return p;
          }))
          .concat(_.uniq(tobedeleted.doc).map(function(slug) {
            $log.log('... deleting doc->story slug:', slug)
          }))
          .concat(_.uniq(tobedeleted.voc).map(function(slug) {
            $log.log('... deleting voc->story slug:', slug)
          }))
          //   return CaptionFactory.save({
          //     story: story.id,
          //     document: d
          //   }, function(res){
          //     console.log('saved', res);
          //   }).promise
          // }))
        )).then(function(results){
          $log.log('... setDocuments() done. Results:', results)
          
          if(results.length){
            $scope.save();
            // $scope.$parent.setDocuments(documents);
          } else {
            //  $scope.$parent.setDocuments(documents);
          }

          $scope.sideItems = items;
        });
      
    };

    // handle markdown preview of its contents....
    var refresh;
    $scope.setMarked = function(marked) {
      $log.log('WritingCtrl > setMarked()');
      $scope.marked = marked;
      if(refresh)
        $timeout.cancel(refresh);
      refresh = $timeout(function(){$rootScope.$emit(EVENTS.RANGY_REFRESH)}, 1000);
    };

    $scope.setCover = function(doc) {
      $log.debug('WritingCtrl -> setCover() doc:', doc.id);
      $scope.isSaving = true;
      $scope.lock();
      StoryFactory.patch({id: story.id}, {
        covers: [doc.id]
      }).$promise.then(function(res) {
        $log.debug('WritingCtrl -> setCover() doc success', res);
        $scope.story.covers = [doc];
        $scope.unlock();
        $scope.isSaving =false;
      });
    }

    $scope.removeCover = function(doc) {
      $log.debug('WritingCtrl -> removeCover() doc:', doc.id);
      if($scope.isSaving){
        $log.warn('wait, try again in. Is still saving.')
        return;
      }
      $scope.isSaving = true;
      $scope.lock();
      StoryFactory.patch({id: story.id}, {
        covers: []
      }).$promise.then(function(res) {
        $log.debug('WritingCtrl -> removeCover() doc success', res);
        $scope.story.covers = [];
        $scope.unlock();
        $scope.isSaving =false;
      }, function(err){
        $log.error('WritingCtrl -> removeCover() doc error', err);
        $scope.unlock();
        $scope.isSaving =false;
      });
    }

    $scope.references = [];
    $scope.lookups = [];// ref and docs and urls...

    // atthach the tag $tag for the current document.
    $scope.attachTag = function(tag) {
      $log.debug('WritingCtrl -> attachTag() tag', arguments);
      if($scope.isSaving){
        $log.warn('wait, try again in. Is still saving.')
        return
      }
      $scope.isSaving = true;
      $scope.lock();
      // partial update route
      return StoryFactory.patch({id: story.id}, {
        tags: _.compact(_.map($scope.displayedTags, 'id').concat(_.map($scope.keywords, 'id')))
      }).$promise.then(function(res) {
        $log.debug('WritingCtrl -> attachTag() tag success', res);
        $scope.unlock();
        $scope.isSaving =false;
        return true;
      }, function(){
        // error
        $scope.unlock();
        $scope.isSaving =false;
        return false;
      });
    };

    /*
      Detach a tag that was attached before.
    */
    $scope.detachTag = function(tag) {
      $log.debug('WritingCtrl -> detachTag() tag', arguments, $scope.displayedTags);
      $scope.isSaving = true;
      $scope.lock();
      // partial update route
      return StoryFactory.patch({id: story.id}, {
        tags: _.map($scope.displayedTags, 'id')
      }).$promise.then(function(res) {
        $log.debug('WritingCtrl -> detachTag() tag success', res);
        $scope.unlock();
        $scope.isSaving =false;
        return true;
      }, function(){
        // error
        return false;
      });
    };

    $scope.suggestAuthors = function(query, options) {
      $log.log('WritingCtrl -> suggestAuthors', query, options);
      var filters = angular.extend(options || {}, {
        fullname__icontains: query
      });
      console.log(filters)
      $log.log('FILTERS:', filters)
      return AuthorFactory.get({
        filters: JSON.stringify(filters),
        exclude: JSON.stringify({
          id__in:_.map($scope.story.authors, 'id')
        })
      }).$promise.then(function(response) {
        return response.results;
      });
    };

    $scope.suggestReferences = function(service) {
      if(!service)
        DocumentFactory.get(function(){
          console.log('list');
        });
    };

    var coversModal = $modal({
      controller: 'CoversModalCtrl', 
      templateUrl: RUNTIME.static + 'templates/partials/modals/covers.html',
      show: false,
      scope: $scope
    });
  
    
    $scope.openCoversModal = function(){
      coversModal.$promise.then(function(){
        $log.log('WritingCtrl -> openCoversModal()');
        coversModal.show();
      });
    }

    $scope.save = function() {
      $log.debug('WritingCtrl @SAVE');
      $scope.$emit(EVENTS.MESSAGE, 'saving');
      $scope.lock();
      if($scope.isSaving){
        $log.warn('wait, try again in. Is still saving.')
        return
      }
      $scope.isSaving = true;
      
      var update = angular.extend({
        title: $scope.title,
        abstract: $scope.abstract,
        contents: $scope.contents,
        metadata: JSON.stringify($scope.story.metadata),
        date: $scope.date,
        authors: _.map($scope.story.authors, 'id')
      }, $scope.metadata);

      StoryFactory.update({id: story.id}, update, function(res) {
        console.log(res)
        $log.debug('WritingCtrl @SAVE: success');
        $scope.$emit(EVENTS.MESSAGE, 'saved');
        $scope.unlock();
        $scope.isSaving = false;
        // disable stopping change status, cfr core controller
        $scope.toggleStopStateChangeStart(false);
      }, function(){
        $scope.isSaving = false;
      });
    };

    // listener for save event.
    $scope.$on(EVENTS.SAVE, $scope.save);

    // listener for SOCKET_USER_COMMENTED_STORY event, cfr. PulseCtrl.
    $rootScope.$on(EVENTS.SOCKET_USER_COMMENTED_STORY, function(e, data){
      if(data.target.id == story.id){
        $log.log('StoryCtrl @SOCKET_USER_COMMENTED_STORY, update the comment list!')
        if(data.info.comment.highlights) {
          $scope.story.highlights.push(data.info.comment.highlights);
        }
        data.info.comment.unread = true;
        // $scope.comments.unshift(data.info.comment);
        // $scope.commentsCount++;
        // $scope.commentsNextParams.offset = +!!$scope.commentsNextParams.offset + 1;

        $scope.$apply();
      }
    })
    
    // listener for contents
    $scope.$watch('contents', function(v, p){
      if(!v || v == p)
        return;
      $scope.toggleStopStateChangeStart(true);
    });

    // listener for language specific metadata
    $scope.$watch('language', function(v, p){
      if(!v || v == p)
        return;
      ['title', 'abstract'].forEach(function(d){
        $scope[d] = $scope.story.metadata[d][v] || $scope[d];
      });
      
      $log.log('WritingCtrl @language');

    });

    $scope.$watch('title', function(v){
      if($scope.language)
        $scope.story.metadata.title[$scope.language] = v;
    });

    $scope.$watch('abstract', function(v){
      if($scope.language)
        $scope.story.metadata.abstract[$scope.language] = v;
    });

    // enable stateChengestart by default
    // $scope.toggleStopStateChangeStart(false);
  });
  
