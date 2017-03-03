/**
 * @ngdoc function
 * @name miller.controller:PulseCtrl
 * @description
 * # PulseCtrl
 * socket connection for user notifications.
 * Used directly below CoreCtrl
 */
angular.module('miller')
  .controller('PulseCtrl', function ($scope, $rootScope, $log, PulseFactory, RUNTIME, EVENTS) {
    $log.log('⚡ PulseCtrl ready');
    
    $scope.pulsationsCount = 0; // number of unread events.
    $scope.pulsations = []

    if(!RUNTIME.settings.wshost){
      $log.warn('⚡ PulseCtrl disabled, no wshost received; please check your miller settings.');
      return;
    }

    var socket = window.socket = new ReconnectingWebSocket(RUNTIME.settings.wshost + '?session_key=' +  RUNTIME.settings.session_key);

    socket.onmessage = function(e) {
      $log.log('⚡ PulseCtrl @onmessage raw data:',e.data)
      
      var d = e.data;
      if(typeof e.data != 'object'){
        try{
          d = JSON.parse(e.data);
        } catch(err){
          $log.log('⚡ PulseCtrl @onmessage: unable to json parse data: ', e.data, '- error received:',err)
          return
        }
      }
      // alert only
      if($scope.user && d.actor && d.actor.username != $scope.user.username)
        $scope.pulsationsCount++;
      
      switch(d.verb){
        case 'commented': // and of course target_type is story.
          $rootScope.$emit(EVENTS.SOCKET_USER_COMMENTED_STORY, d);
          $scope.pulsations.unshift(d);
          break;
        case 'uncommented':
          $rootScope.$emit(EVENTS.SOCKET_USER_UNCOMMENTED_STORY, d)
          break;
      }
      $scope.$apply();
    }

    socket.onopen = function() {
      $log.log('⚡ PulseCtrl online');
      
      if($scope.user.username){
        PulseFactory.unread({}, function(res){
          $scope.pulsationsCount = res.count;
        });
      }
    }

    socket.onclose = function(e) {
      $log.warn("⚡ PulseCtrl socket closed.", e);
    }

    socket.onerror = function(e) {
      $log.error("⚡ PulseCtrl socket error", e);
    }

    // Call onopen directly if socket is already open
    if (socket.readyState == WebSocket.OPEN) {
      socket.onopen();
    }

    $scope.resetPulsations = function(){
      if($scope.isLoading){
        $log.warn('⚡ PulseCtrl > resetPulsations() still loading...');
        return;
      }
      $log.log('⚡ PulseCtrl > resetPulsations()');
      $scope.isLoading = true;
      PulseFactory.reset({}, function(res){
        $scope.pulsationsCount = 0;
        $scope.isLoading = false;
        $scope.pulsations = [];
      }, function(err){
        $log.warn('⚡ PulseCtrl > loadPulsations() failed!', err);
        $scope.isLoading = false;

      });
    }

    $scope.loadPulsations = function(){
      if($scope.isLoading){
        $log.warn('⚡ PulseCtrl > loadPulsations() still loading...');
        return;
      }
      $log.log('⚡ PulseCtrl > loadPulsations()');
      
      $scope.isLoading = true;

      PulseFactory.noise({}, function(res){
        $scope.pulsations = res.results;
        $scope.isLoading = false;
        $log.log('⚡ PulseCtrl > loadPulsations() success!');
        
      }, function(err){
        $log.warn('⚡ PulseCtrl > loadPulsations() failed!', err);
      });
    }

    $scope.rangyHighlight = function(highlight){
      $log.log('⚡ PulseCtrl > rangyHighlight()');
      $rootScope.$emit(EVENTS.RANGY_FOCUS, highlight)
    }
  });
  