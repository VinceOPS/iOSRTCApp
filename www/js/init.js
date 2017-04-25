(function() {

'use strict';

var cordova = window.cordova;

window.addEventListener("load", function() {
    document.addEventListener("deviceready", onDeviceReady);
});

function onDeviceReady() {
    if (window.device.platform === "iOS") {
        initializeIosBehavior();
    }

    setTimeout(function () {
        loadScriptFile('js/apprtc.debug.js');
        loadScriptFile('js/appwindow.js');
    }, 200);

    initializeCallKit();
}

function initializeIosBehavior() {
    // Pollute global namespace with WebRTC stuff
    cordova.plugins.iosrtc.debug.enable("*");
    cordova.plugins.iosrtc.registerGlobals();

    window.addEventListener("orientationchange", function () {
        // NOTE: hack, but needed due to CSS transitions and so on.
        [0, 500, 1000, 1500].forEach(function (delay) {
            setTimeout(cordova.plugins.iosrtc.refreshVideos, delay);
        });
    });

    // avoid iOS WebSocket crash:
    // https://github.com/eface2face/cordova-plugin-iosrtc/issues/12
    loadScriptFile('js/ios-websocket-hack.js');
}

function loadScriptFile(path) {
    var script = document.createElement("script");

    script.type = "text/javascript";
    script.src = path;
    script.async = false;
    document.getElementsByTagName("head")[0].appendChild(script);
}

function initializeCallKit() {
    console.log('**** initializeCallKit');
    var callKitService = new CallKitService();

    function CallKitService() {
        var callKit;
        var callUUID;

        return {
            hasCallKit: function() {
                return typeof CallKit !== "undefined" && callKit;
            },
            register: function(callChanged, audioSystem) {
                if (typeof CallKit !== "undefined") {
                    callKit = new CallKit();
                    callKit.register(callChanged, audioSystem);
                }
            },
            reportIncomingCall: function(name, params) {
                if (this.hasCallKit()) {
                    callKit.reportIncomingCall(name, params, function(uuid) {
                        callUUID = uuid;
                    });
                }
            },
            startCall: function(name, isVideo) {
            if (this.hasCallKit()) {
                callKit.startCall(name, isVideo, function(uuid) {
                    callUUID = uuid;
                });
            }
            },
            callConnected: function(uuid) {
                if (this.hasCallKit()) {
                    callKit.callConnected(callUUID);
                }
            },
            endCall: function(notify) {
                if (this.hasCallKit()) {
                    callKit.endCall(callUUID, notify);
                }
            },
            finishRing: function() {
                if (this.hasCallKit()) {
                    callKit.finishRing();
                }
            }
        };
    }

    callKitService.register(function callChanged(obj) {
        console.log('**** callChanged');
        console.log(obj);
    }, function audioSystem(message) {
        console.log('**** audioSystem');
        console.log(message);
    });

    setTimeout(function() {
        var currentUuid = '';
        console.log('**** reportIncomingCall');
        callKitService.reportIncomingCall('Mighty Dev', 
            {video: true},
            function(uuid) {
                console.log('uuid = ' + uuid);
                currentUuid = uuid;
            });
    }, 5000);
}

})();
