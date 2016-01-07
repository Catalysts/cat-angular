interface CatConversionFunctions {
    toClient(serverData?:any, context?:any):any;
    toServer(clientData?:any, context?:any):any;
}

/**
 * @ngdoc service
 * @name cat.service.conversion:catConversionService
 * @module cat.service.conversion
 *
 * @description
 * This service handles the transformation between server and client side data.
 *
 * @constructor
 */
class CatConversionService {

    constructor(private catConversionFunctions:CatConversionFunctions) {
    }

    toClient(serverData, context) {
        return this.catConversionFunctions.toClient(serverData, context);
    }

    toServer(clientData) {
        return this.catConversionFunctions.toServer(clientData);
    }
}

function _convertToClientModel(data, context) {
    if (!_.isUndefined(context) && _.isFunction(context.model)) {
        return new context.model(data);
    }

    return data;
}

function _convertToClientData(serverData, context) {
    if (_.isUndefined(serverData)) {
        return undefined;
    }

    if (_.isArray(serverData)) {
        return _.map(serverData, (data) => {
            return _convertToClientModel(data, context);
        });
    }

    if (_.isNumber(serverData.totalCount)) {
        let copy = _.clone(serverData);
        let facets = [];

        if (!!serverData.facets) {
            facets = _.map(serverData.facets, function (facet) {
                return new window.cat.Facet(facet);
            });
        }

        let result = {
            totalCount: serverData.totalCount,
            facets: facets,
            elements: _.map(serverData.elements, function (elem) {
                return _convertToClientData(elem, context);
            })
        };

        delete copy.totalCount;
        delete copy.elements;
        delete copy.facets;

        return _.assign(result, copy);
    }

    if (!_.isUndefined(context)) {
        return _convertToClientModel(serverData, context);
    }

    return serverData;
}

angular.module('cat.service.conversion', [])
/**
 * @ngdoc object
 * @name cat.service.conversion:catConversionFunctions
 * @module cat.service.conversion
 *
 * @description
 * Value holding functions used by {@link cat.service.conversion:catConversionService catConversionService}
 *
 * @constructor
 */
    .value('catConversionFunctions', {
        toClient: _convertToClientData,
        toServer: (clientData, context) => {
            return clientData;
        }
    })
    .service('catConversionService', [
        'catConversionFunctions',
        CatConversionService
    ]);