/**
 * @ngdoc function
 * @name miller.controller:ChapterCtrl
 * @description
 * # ChapterCtrl
 * Handles story (probably tagged as chapters) in stories tagged as collection.
 * route url: `http://localhost:8000/story/<slug-collection>/<slug-chapter>`
 * Please make sure that $scope.$parent.$parent.setDocuments exists and is CoreCtrl.
 */
angular.module('miller')
  .controller('ChapterCtrl', function($scope, $timeout, chapter) {
    $scope.chapter = chapter;
    $scope.chapter.isWritable = $scope.hasWritingPermission($scope.user, $scope.chapter);
    $scope.isChapter = true;

    $scope.setDocuments = function(items){
      var documents = [];

      $scope.sidedocuments = 0;
      
      documents = _(items)
        .map(function(d){
          // check if it is in the story.documents list
          for(var i=0;i<chapter.documents.length;i++){
            if(chapter.documents[i].slug == d.slug){
              $scope.sidedocuments += !!d.citation.length;
              return angular.extend({
                _type: d._type,
                _index: d._index,
                citation: d.citation
              }, chapter.documents[i]);
            }
          }

          for(i=0;i<chapter.stories.length;i++){
            if(chapter.stories[i].slug == d.slug){
              $scope.sidedocuments += !!d.citation.length;
              return angular.extend({
                _type: d._type,
                _index: d._index,
                citation: d.citation
              }, chapter.stories[i]);
            }
          }
          $scope.sidedocuments++;
          // this is another story or a footnote or a missing document (weird)
          // will be lazily filled with stuffs later
          return d;
        }).value();
      $timeout(function(){
        $scope.$parent.$parent.setDocuments(documents);
      }, 1000)
      
    }
  });