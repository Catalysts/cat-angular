/**
 * Created by Mustafa on 27.07.2015.
 */


describe('CatGlobalMessages', function () {
    'use strict';

    var catMessageService;

    var messages1 = ['message1', 'message2', 'message3', 'message4'];
    var messages2 = ['message5', 'message6', 'message7', 'message8'];
    var messages3 = ['message9', 'message10', 'message11', 'message12'];

    beforeEach(function () {
        angular.module('cat.service.message.test', []);
        module('cat.service.message');
        module('cat.service.message.test');

        inject(function (_$globalMessages_) {
            catMessageService = _$globalMessages_;
        });

        //setMessage already tested here, otherwise all other tests would not work
        catMessageService.setMessages(1, messages1);
        catMessageService.setMessages(2, messages2);
        catMessageService.setMessages(3, messages3);

    });

    describe('hasMessages', function () {

        it('should return that there is a element', function () {

            var result = catMessageService.hasMessages(1);
            expect(result).toEqual(true);
        });

        it('sshould return that there is no element', function () {

            var result = catMessageService.hasMessages(4);
            expect(result).toEqual(false);
        });
        it('should return that there is no element because no parameter', function () {
            var result = catMessageService.hasMessages();
            expect(result).toEqual(false);
        });
    });


    describe('getMessages', function () {

        it('should return getMessages', function () {

            var result = catMessageService.getMessages(1);
            expect(result).toEqual(messages1);
        });

    });

    describe('clearMessages', function () {

        it('should return clearMessages with id 1', function () {

            catMessageService.clearMessages(1);
            var result = catMessageService.hasMessages(1);
            expect(result).toBe(false);
            result = catMessageService.hasMessages(2);
            expect(result).toBe(true);
            result = catMessageService.hasMessages(3);
            expect(result).toBe(true);

        });
    });

    describe('addMessage', function () {

        it('should add Message ', function () {
            catMessageService.clearMessages(1);
            var result = catMessageService.hasMessages(1);
            expect(result).toBe(false);
            catMessageService.addMessage(1, messages1);
            result = catMessageService.hasMessages(1);
            expect(result).toBe(true);
        });
    });

})
;

