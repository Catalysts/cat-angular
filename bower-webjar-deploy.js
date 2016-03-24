'use strict';

var gulp = require('gulp');
gulp.util = require('gulp-util');

var q = require('q');
var path = require('path');
var request = require('request');
var PusherClient = require('pusher-client');

var webjarPusherKey = '4a4afe0fcb8715518169';

function getWebjarDeploymentUrl(name, version, channelId) {
    return 'http://www.webjars.org/_bower/deploy?name=' + name + '&version=' + version + '&channelId=' + channelId;
}

function executeWebjarDeployment(name, version, cb) {
    var libVersion;

    if (typeof version === 'function') {
        libVersion = version();
    } else {
        libVersion = version;
    }

    gulp.util.log('Initiating webjar deploy');
    gulp.util.log('-- Establishing Pusher connection');
    var pusherClient = new PusherClient(webjarPusherKey);
    var channelId = name + '-' + libVersion + '_' + new Date().getTime();

    gulp.util.log('-- Subscribing to channel ' + gulp.util.colors.cyan(channelId));
    var channel = pusherClient.subscribe(channelId);

    var eventHandlers = {};

    function unsubscribe() {
        gulp.util.log('-- Unbinding event listeners');
        channel
            .unbind('update', eventHandlers.update)
            .unbind('success', eventHandlers.success)
            .unbind('failure', eventHandlers.failure);

        gulp.util.log('-- Usubscribing from channel');
        channel.unsubscribe(channelId);
    }

    eventHandlers.update = function (data) {
        gulp.util.log(data);
    };

    eventHandlers.success = function (data) {
        gulp.util.log(data);
        gulp.util.log('Received success message of webjar deployment!');
        unsubscribe();
        cb();
    };

    eventHandlers.failure = function (data) {
        gulp.util.log('Received failure during webjar deployment!');
        unsubscribe();
        cb(data);
    };

    gulp.util.log('-- Binding event listeners');
    channel
        .bind('update', eventHandlers.update)
        .bind('success', eventHandlers.success)
        .bind('failure', eventHandlers.failure);

    gulp.util.log('Starting webjar deployment...');

    request.post(getWebjarDeploymentUrl(name, libVersion, channelId),
        function (error) {
            if (!!error) {
                gulp.util.log('Post request for webjar deploy failed!');
                cb(error);
            }
        });
}

function registerWebjarDeploymentTask(name, version, options) {

    gulp.task(options && options.taskName || 'release-webjar-' + name, [], function (cb) {
        executeWebjarDeployment(name, version, cb);
    });
}

module.exports = registerWebjarDeploymentTask;