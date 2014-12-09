/**
 * Created by tscheinecker on 05.05.2014.
 */
'use strict';

angular.module('cat.service.message').service('$globalMessages', function CatGlobalMessages($rootScope) {
    var messages = {};

    var self = this;

    this.getMessages = function (type) {
        if (!type) {
            return [];
        }

        return messages[type];
    };

    this.hasMessages = function (type) {
        if (!type) {
            return false;
        }

        return !!messages[type] && messages[type].length !== 0;
    };

    this.clearMessages = function (type) {
        if (!type) {
            messages = {};
            return;
        }

        messages[type] = [];
    };

    this.addMessage = function (type, message) {
        if (!type) {
            return;
        }

        if (!messages[type]) {
            self.clearMessages(type);
        }

        messages[type].push(message);
    };

    this.addMessages = function (type, messages) {
        if (!type) {
            return;
        }

        _.forEach(messages, function (message) {
            self.addMessage(type, message);
        });
    };

    this.setMessages = function (type, messages) {
        if (!type) {
            return;
        }

        self.clearMessages(type);
        if (!!messages) {
            self.addMessages(type, messages);
        }
    };

    $rootScope.$on('$stateChangeSuccess', function () {
        self.clearMessages();
    });
});
