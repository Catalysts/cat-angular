'use strict';

angular.module('cat.service.state', [
    'ui.router'
])

/**
 * @ngdoc service
 * @name cat.service.state:CatStateService
 * @description
 * This service provides functionality to browse though the states.
 */
    .service('catStateService', function CatStateService($state, $stateParams) {

        function StateStackElement(state, stateParams) {
            this.state = state;
            this.stateParams = stateParams;
        }

        var _stateStack = [];

        /**
         * Pushes a new state, which is different to the current state, onto the state stack.
         *
         * @param state state you want to push
         * @param stateParams state parameters of the state
         */
        this.push = function (state, stateParams) {
            var isSame = _.isEqual(state, $state.current) && _.isEqual(stateParams, $stateParams);
            if (state !== undefined && !state.abstract && !isSame) {
                _stateStack.push(new StateStackElement(state, stateParams));
            }
        };

        /**
         * Returns the latest state from the state stack.
         *
         * @returns {StateStackElement} state stack element
         */
        this.last = function () {
            return _stateStack[_stateStack.length - 1];
        };

        /**
         * Returns and removes the latest differant state from the state stack.
         *
         * @returns {StateStackElement} state stack element
         */
        this.pop = function () {
            var lastState;

            // Get the latest state which is not the current state.
            do {
                lastState = _stateStack.pop();
            } while (lastState !== undefined && _.isEqual(lastState.state, $state.current) && _.isEqual(lastState.stateParams, $stateParams));

            return lastState;
        };

        /**
         * Returns and removes the latest state from the state stack.
         *
         * @returns {StateStackElement} state stack element
         */
        this.lastAndRemove = function () {
            return _stateStack.pop();
        };

        /**
         * Goes to the previous state (if there exists one).
         */
        this.goBack = function (defaultBackState) {
            var backState = defaultBackState || '^.list';
            var backStateParams;
            var lastState = this.pop();
            if (lastState !== undefined) {
                backState = lastState.state.name;
                backStateParams = lastState.stateParams;
            }
            $state.go(backState, backStateParams);
        };
    })

    .run(function ($rootScope, catStateService) {
        $rootScope.$on('$stateChangeSuccess', function (evt, toState, toParams, fromState, fromParams) {
            catStateService.push(fromState, fromParams);
        });
    }
);