interface CatLoadingServiceOptions {
    timeout:number;
    animationDuration:number;
}

class CatLoadingService {
    private activeCount = 0;
    private startTime;
    private startTimer;
    private stopTimer;

    constructor(private $rootScope:IRootScopeService,
                private $timeout:ITimeoutService,
                private usSpinnerService,
                private CAT_LOADING_SERVICE_DEFAULTS:CatLoadingServiceOptions) {
        let stateChangeInProgress = false;

        $rootScope.$on('$stateChangeStart', () => {
            if (!stateChangeInProgress) {
                this.start();
                stateChangeInProgress = true;
            }

        });
        $rootScope.$on('$stateChangeSuccess', () => {
            this.stop();
            stateChangeInProgress = false;
        });
        $rootScope.$on('$stateChangeError', () => {
            this.stop();
            stateChangeInProgress = false;
        });
    }

    start() {
        if (!this.activeCount && !this.startTimer) {
            if (!!this.stopTimer) {
                this.$timeout.cancel(this.stopTimer);
                this.stopTimer = undefined;
            }
            this.startTimer = this.$timeout(() => {
                this.usSpinnerService.spin('loading-spinner');
                this.$rootScope['loading'] = true;
                this.startTime = new Date().getTime();
            }, this.CAT_LOADING_SERVICE_DEFAULTS.timeout);
        }
        this.activeCount++;
    }

    stop() {
        this.activeCount--;
        if (!this.activeCount && !this.stopTimer) {
            if (!!this.startTimer) {
                this.$timeout.cancel(this.startTimer);
                this.startTimer = undefined;
            }
            let now = new Date().getTime();
            let stopTimeout = this.CAT_LOADING_SERVICE_DEFAULTS.timeout + (Math.max((this.CAT_LOADING_SERVICE_DEFAULTS.animationDuration - (now - this.startTime)), 0));
            this.stopTimer = this.$timeout(() => {
                this.usSpinnerService.stop('loading-spinner');
                this.$rootScope['loading'] = false;
            }, stopTimeout);
        }
    }
}

/**
 * @ngdoc service
 * @name cat.service.loading:loadingService
 */
angular.module('cat.service.loading', ['angularSpinner'])
    .constant('CAT_LOADING_SERVICE_DEFAULTS', {
        timeout: 50,
        animationDuration: 200
    })
    .service('loadingService', [
        '$rootScope',
        '$timeout',
        'usSpinnerService',
        'CAT_LOADING_SERVICE_DEFAULTS',
    ]);
