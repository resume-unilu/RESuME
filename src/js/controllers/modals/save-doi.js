angular.module('miller')
  .controller('SaveDoiModalCtrl', function($log, $scope, storyId, StoryDOIMetadataFactory, EVENTS) {
    // $scope.currentMetadata;
    // $scope.storedMetadata
    $scope.storyId = storyId;
    
    // $scope.isSaving
    // $scope.should_update_doi = false

    // load stored doi. If the promise is rejected (not found)
    $scope.loadCurrentMetadata = function(options){
      return StoryDOIMetadataFactory.getMetadata(angular.extend({}, options, {id: storyId}), function(res) {
        $log.log('[GET] SaveDoiModalCtrl -> loadCurrentMetadata() success, doi:', res.DOI, '- with params:', options);
        $scope.currentMetadata = res;
        $scope.doi = res.DOI;
      }, function(res) {
        $log.warn('[GET] SaveDoiModalCtrl -> loadCurrentMetadata() error, request status:',res.status, 'with params:', res);
      }).$promise
    };

    // load DOI if any
    StoryDOIMetadataFactory.get({id: storyId}, function(res) {
      // if success load actual stored DOI metadata
      $log.log('[GET] SaveDoiModalCtrl -> init remote doi SUCCESS :', {doi: res.doi, url: res.url});
      $scope.should_update_doi = true;
      $scope.loadCurrentMetadata({test:true})
    }, function(res) { // else 
      $log.warn('[GET] SaveDoiModalCtrl -> init remote doi FAILED:', res);
    }).$promise.finally(function() {
      $scope.loadCurrentMetadata({test:true})
    });

    //
    $scope.confirm = function(){
      $scope.is_saving = true;
      
      // send metadata; then send DOI.
      StoryDOIMetadataFactory.updateMetadata({id: storyId}, {},function(res) {
        $log.log('[POST] SaveDoiModalCtrl updateMetadata() success, doi:', res.DOI);
        
        // create/update doi
        if($scope.should_update_doi){
          $scope.localUpdateDoi($scope.doi);
          $scope.$hide();
          $scope.$emit(EVENTS.MESSAGE, 'DOI updated!');
        } else{
          StoryDOIMetadataFactory.save({id: storyId}, {}, function(res) {
            $log.log('[POST] SaveDoiModalCtrl DOI save() success, doi:', res.DOI, 'url:');
            $scope.is_saving = false;
            $scope.localUpdateDoi($scope.doi);
            $scope.$hide();
            $scope.$emit(EVENTS.MESSAGE, 'DOI created!');
          }, function(err) {
            $scope.is_saving = false;
          })
        }
      }, function(err) {
        $scope.is_saving = false;
        $scope.log_message = err.data;
        $log.warn('SaveDoiModalCtrl loadCurrentMetadata() error, request status:',err.status, 'with params:', err);
      })
    }
  });