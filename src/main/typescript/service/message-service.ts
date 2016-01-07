class Message {
    text:string;
    type:string;
    timeToLive:number;

    constructor(data:any = {}) {
        this.text = data.text || '';
        this.type = data.type;
        this.timeToLive = data.timeToLive || 0;
    }
}

interface ICatMessagesService {
    getMessages(type?:string):Array<string>;
    hasMessages(type?:string):boolean;
    clearMessages(type?:string):void;
    clearDeadMessages():void;
    addMessage(type:string, message:string, flash?:boolean):void;
    addMessages(type:string, messages:Array<string>):void;
    setMessages(type:string, messages:Array<string>):void;
    decreaseTimeToLive():void;
}


/**
 * @ngdoc service
 * @name cat.service.message:$globalMessages
 */
class CatMessageService implements ICatMessagesService {
    private messages:{[key:string]:Array<Message>} = {};

    constructor($rootScope) {
        $rootScope.$on('$stateChangeSuccess', () => {
            this.clearDeadMessages();
            this.decreaseTimeToLive();
        });
    }

    getMessages(type?:string):Array<string> {
        if (!type) {
            return [];
        }

        return _.map(this.messages[type], (message) => {
            return message.text;
        });
    }

    hasMessages(type?:string) {
        if (!type) {
            return false;
        }

        return !!this.messages[type] && this.messages[type].length !== 0;
    }

    clearMessages(type?:string) {
        if (!type) {
            this.messages = {};
            return;
        }

        this.messages[type] = [];
    }

    clearDeadMessages() {
        for (let type in this.messages) {
            this.messages[type] = _.filter(this.messages[type], (message:Message) => {
                return message.timeToLive > 0;
            });
        }
    }

    addMessage(type:string, message:string, flash:boolean = false) {
        if (!type) {
            return;
        }

        if (!this.messages[type]) {
            this.clearMessages(type);
        }

        this.messages[type].push(new Message({
            text: message,
            type: type,
            timeToLive: flash ? 1 : 0
        }));
    }

    decreaseTimeToLive() {
        for (let type in this.messages) {
            _.forEach(this.messages[type], (message) => {
                message.timeToLive--;
            });
        }
    }

    addMessages(type:string, messages:Array<string>) {
        if (!type) {
            return;
        }

        _.forEach(messages, (message) => {
            this.addMessage(type, message);
        });
    }

    setMessages(type:string, messages:Array<string>) {
        if (!type) {
            return;
        }

        this.clearMessages(type);
        if (!!messages) {
            this.addMessages(type, messages);
        }
    }
}


/**
 * @ngdoc service
 * @name cat.service.message:catValidationMessageHandler
 */
class CatValidationMessageHandler {

    constructor(private $globalMessages:ICatMessagesService,
                private catValidationService:ICatValidationService) {

    }

    handleRejectedResponse(rejection) {
        this.$globalMessages.clearMessages('error');

        if (!!rejection.data && !!rejection.data.error) {
            let error = '[' + rejection.status + ' - ' + rejection.statusText + '] ' + rejection.data.error;
            if (!!rejection.data.cause) {
                error += '\n' + rejection.data.cause;
            }
            this.$globalMessages.addMessage('error', error);
        }

        this.catValidationService.updateFromRejection(rejection);
    }
}


angular
    .module('cat.service.message', [
        'cat.config.messages'
    ])
    .service('catValidationMessageHandler', [
        '$globalMessages',
        'catValidationService',
        CatValidationMessageHandler
    ])
    .service('$globalMessages', [
        '$rootScope',
        CatMessageService
    ]);