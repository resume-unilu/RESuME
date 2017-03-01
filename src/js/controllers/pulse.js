/**
 * @ngdoc function
 * @name miller.controller:PulseCtrl
 * @description
 * # PulseCtrl
 * socket connection for user notifications.
 * Used directly below CoreCtrl
 */
angular.module('miller')
  .controller('PulseCtrl', function ($scope, $rootScope, $log, RUNTIME, EVENTS) {
    $log.log('⚡ PulseCtrl ready');
    
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
        }
      }

        $rootScope.$emit(EVENTS.SOCKET_USER_COMMENTED_STORY, d)
      }
    }

    socket.onopen = function() {
      $log.log('⚡ PulseCtrl online');
    }

    socket.onclose = function(e) {
      $log.warn("⚡ PulseCtrl socket closed.", e);
    }

    socket.onerror = function(e) {
      $log.error("⚡ PulseCtrl socket error", e);
    }

    // Call onopen directly if socket is already open
    if (socket.readyState == WebSocket.OPEN)
      socket.onopen();

    $rootScope.realtime = function(message, group) {
      // enrich message with broadcast group
      // if(group)
      //   message._broadcast_group = group;
      //   message._prefilter
      // socket.send(message);
    }
  });
  