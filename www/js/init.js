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

})();
