/**
 * @ngdoc function
 * @name miller.controller:coreCtrl
 * @description
 * # CoreCtrl
 * common functions go here.
 */
angular.module('miller')
  .controller('StoryCtrl', function ($rootScope, $scope, $log, story, StoryFactory, CommentFactory, QueryParamsService, EVENTS) {
    $scope.story = story;

    // is the story editable by the current user?
    $scope.story.isWritable = $scope.hasWritingPermission($scope.user, $scope.story);

    $scope.story.isUnderReview = story.status == 'review' || story.status == 'editing';
    
    // is the layout table or other?
    $scope.layout = 'inline';



    // openGRaph metadata coming from the story
    $scope.setOG({
      title: story.metadata.title[$scope.language] || story.title,
      description: story.metadata.abstract[$scope.language] || story.abstract,
      image: _(story.covers).map(function(d){
        return _.get(d,'snapshot') || 
               _.get(d,'metadata.thumbnail_url') || 
               _.get(d,'metadata.urls.Publishable') ||
               _.get(d,'metadata.urls.Preview') || 
               _.get(d,'metadata.url');
      }).first()
    })

    // set status DRAFT or PUBLIC to the document.
    $scope.setStatus = function(status){
      $log.debug('StoryCtrl -> setStatus - status:', status);
      
      if(!$scope.user.is_staff)
        return;
        
      $scope.$emit(EVENTS.MESSAGE, 'saving');

      StoryFactory.update({
        id: $scope.story.id
      }, {
        title: $scope.story.title,
        status: status
      }, function(res) {
        console.log('StoryCtrl -> setStatus - new status:',res)
        $scope.story.status = res.status;
        $scope.$emit(EVENTS.MESSAGE, 'saved');
        $scope.unlock();
      });
    };

    $scope.comments = [];
    $scope.commentsCount = 0;
    $scope.isLoadingComments = false;
    $scope.commentsNextParams = {};

    $scope.loadComments = function(){
      if($scope.isLoadingComments) {
        $log.warn('StoryCtrl > loadComments() is busy loading...!')
        return;
      }
      $scope.isLoadingComments = true;
      $log.log('StoryCtrl > loadComments() loading...')
        
      StoryFactory.getComments(angular.extend({
        id: story.id,
        orderby: '-date_created'
      }, $scope.commentsNextParams), function(res){
        $scope.comments = ($scope.comments || []).concat(res.results);
        $scope.commentsCount = res.count;
        $scope.commentsNextParams = QueryParamsService(res.next || '');
        
        $scope.isLoadingComments = false;
        $log.log('StoryCtrl > loadComments() loaded. Next:', $scope.commentsNextParams)
      }, function(e){
        $scope.isLoadingComments = false;
        $log.error(e)
      })
    }

    $scope.moreComments = function() {
      $scope.loadComments();
    }

    // if commented, reset comments list before reloading.
    $scope.commented = function(error, comment){
      $log.log('StoryCtrl > commented() deprecaed');
    };

    $scope.removeComment = function(comment) {
      comment.disappear = true;
      if($scope.isLoadingComments) {
        $log.warn('StoryCtrl > removeComment() is busy loading...!')
        return;
      }

      $log.log('StoryCtrl > removeComment() comment:', comment.short_url);
      $scope.isLoadingComments = true;

      CommentFactory.delete({
        id: comment.short_url
      }, function(res){
        $scope.isLoadingComments = false;
        $log.log('StoryCtrl > removeComment() success!', comment.short_url);
      }, function(){
        $scope.isLoadingComments = false;
      });
    }




    $scope.download = function() {
      StoryFactory.download({
        id: $scope.story.id
      }).$promise.then(function(result) {
        var url = URL.createObjectURL(new Blob([result.data]));
        var a = document.createElement('a');
        a.href = url;
        a.download = result.filename;
        a.target = '_blank';
        a.click();
      })
      .catch(function(error) {
        console.log(error); // in JSON
      });
    }

    $scope.listener = function(event, data, callback) {
      $log.log('StoryCtrl > listener, event:', event, data);
      
      switch(event){
        case EVENTS.MARKDOWNIT_FOCUS:
          // cfr. in service MarkdownitService idx is the item index 
          // of every special link. Each link will then have a special id 'item-N'
          // N revealing the ordering.
          $scope.focusedIdx = data.idx
          break;
        case EVENTS.MARKDOWNIT_FULLSIZE:
          $rootScope.fullsize(data.slug.replace(/\//g,'-'), data.type);
          break;
        case EVENTS.MARKDOWNIT_RESOLVE:
          $rootScope.resolve(data.slug.replace(/\//g,'-'), data.type, callback);
          break;
      }
    }


    $log.log('StoryCtrl ready, title:', story.title, 'isWritable:', $scope.story.isWritable);
    // $scope.cover = _(story.documents).filter({type: 'video-cover'}).first();

    // $scope.hasCoverVideo = $scope.cover !== undefined;
    
    // guess if there's a document interview
    // cfr corectrl setDocuments function.
    $scope.setDocuments = function(items) {
      $log.log('StoryCtrl > setDocuments items n.:', items.length, items);
      var documents = [];

      $scope.sidedocuments = 0;

      documents = _(items)
        .map(function(d){
          // check if it is in the story.documents list
          for(var i=0;i<story.documents.length;i++){
            if(story.documents[i].slug == d.slug){
              $scope.sidedocuments += !!d.citation.length;
              return angular.extend({
                _type: d._type,
                _index: d._index,
                citation: d.citation
              }, story.documents[i]);
            }
          }

          for(i=0;i<story.stories.length;i++){
            if(story.stories[i].slug == d.slug){
              $scope.sidedocuments += !!d.citation.length;
              return angular.extend({
                _type: d._type,
                _index: d._index,
                citation: d.citation
              }, story.stories[i]);
            }
          }
          $scope.sidedocuments++;
          // this is another story or a footnote or a missing document (weird)
          // will be lazily filled with stuffs later
          return d;
        }).value();

      $log.log('StoryCtrl > setDocuments items n.:', items.length, '- documents n:', documents.length, '- sideDocuments:', $scope.sidedocuments );
      // $rootScope.emit(documents = documents;
      $scope.$parent.setDocuments(documents);
    };

    // given the shortUrl, preload the comment item
    // params uids: list of shortUrls to preload.
    $scope.commentsSelected = function(uids) {
      // debugger
      debugger
      $log.log('StoryCtrl > commentsSelected uids:', uids);
    }    
    
    // listener for SOCKET_USER_COMMENTED_STORY event, cfr. PulseCtrl.
    $rootScope.$on(EVENTS.SOCKET_USER_COMMENTED_STORY, function(e, data){
      if(data.target.id == story.id){
        $log.log('StoryCtrl @SOCKET_USER_COMMENTED_STORY, update the comment list!')
        if(data.info.comment.highlights) {
          $scope.story.highlights.push(data.info.comment.highlights);
        }
        data.info.comment.unread = true;
        $scope.comments.unshift(data.info.comment);
        $scope.commentsCount++;
        $scope.commentsNextParams.offset = +!!$scope.commentsNextParams.offset + 1;

        $scope.$apply();
      }
    })

    // listener for SOCKET_USER_UNCOMMENTED_STORY event, cfr. PulseCtrl.
    $rootScope.$on(EVENTS.SOCKET_USER_UNCOMMENTED_STORY, function(event, data) {
      if(data.target.id == story.id){
        $log.log('StoryCtrl @SOCKET_USER_UNCOMMENTED_STORY, update the comment list!', $scope.comments);
        // present i scope comments?
        
        $scope.commentsCount--;
        var commentIndex = _.findIndex($scope.comments, {short_url: data.info.comment.short_url});
        if(commentIndex !== -1){
          $scope.comments.splice(commentIndex, 1);
          $scope.commentsNextParams.offset = Math.max(+!!$scope.commentsNextParams.offset - 1, 0);
        }

        if(data.info.comment.highlights) {
          //indexOf()
          var highlightIndex = $scope.story.highlights.indexOf(data.info.comment.highlights);
          if(highlightIndex !== -1){
            $scope.story.highlights.splice(highlightIndex, 1);
          }
          //$scope.story.highlights.push(data.info.comment.highlights);
        }
        // look for the data id 
      }
    });
  });
  