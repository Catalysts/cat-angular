'use strict';

angular.module('cat.service.message', [
    'cat.config.messages'
])

/**
 * @ngdoc service
 * @name cat.service.message:catValidationMessageHandler
 */
    .service('catValidationMessageHandler', function CatValidationMessageHandler($globalMessages, catValidationService) {
        this.handleRejectedResponse = function (rejection) {
            $globalMessages.clearMessages('error');

            if (!!rejection.data.error) {
                var error = '[' + rejection.status + ' - ' + rejection.statusText + '] ' + rejection.data.error;
                if (!!rejection.data.cause) {
                    error += '\n' + rejection.data.cause;
                }
                $globalMessages.addMessage('error', error);
            }

            catValidationService.updateFromRejection(rejection);
        };
    })

/**
 * @ngdoc service
 * @name cat.service.message:$globalMessages
 */
    .service('$globalMessages', function CatGlobalMessages($rootScope) {

    function Message(data) {
        data = data || {};
        this.text = data.text || '';
        this.type = data.type;
        this.timeToLive = data.timeToLive || 0;
    }

    var messages = {};

    var self = this;

    this.getMessages = function (type) {
        if (!type) {
            return [];
        }

        return _.map(messages[type], function (message) {
            return message.text;
        });
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

    this.clearDeadMessages = function () {
        for (var type in messages) {
            messages[type] = _.filter(messages[type], function (message) {
                return message.timeToLive > 0;
            });
        }
    };

    this.addMessage = function (type, message, flash) {
        if (!type) {
            return;
        }

        if (!messages[type]) {
            self.clearMessages(type);
        }

        messages[type].push(new Message({
            text: message,
            type: type,
            timeToLive: flash ? 1 : 0
        }));
    };

    this.decreaseTimeToLive = function () {
        for (var type in messages) {
            _.forEach(messages[type], function (message) {
                message.timeToLive--;
            });
        }
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
        self.clearDeadMessages();
        self.decreaseTimeToLive();
    });
});
