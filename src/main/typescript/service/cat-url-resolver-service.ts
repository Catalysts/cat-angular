/**
 * Created by Mustafa on 05.08.2015.
 */

interface ICatUrlResolverService {
    getTabTemplate(tab:string, config:ICatDetailConfig):string;
}

class CatUrlResolverService implements ICatUrlResolverService {
    getTabTemplate(tab:string, config:ICatDetailConfig) {
        let parentUrl = config.endpoint.getEndpointName();
        let parentTemplateNamePrefix = config.endpoint.getEndpointName();
        let currentEndpoint = config.endpoint;

        while (!_.isUndefined(currentEndpoint.parentEndpoint)) {
            currentEndpoint = config.endpoint.parentEndpoint;
            let parentEndpointName = currentEndpoint.getEndpointName();

            parentUrl = parentEndpointName + '/' + parentUrl;

            parentTemplateNamePrefix = parentEndpointName + '-' + parentTemplateNamePrefix;
        }
        return parentUrl + '/' + tab + '/' + parentTemplateNamePrefix + '-' + tab + '-list.tpl.html';
    }
}


angular
    .module('cat.url.resolver.service', [])
    .service('urlResolverService', [
        CatUrlResolverService
    ]);

