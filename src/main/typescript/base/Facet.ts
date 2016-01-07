/**
 * @ngdoc function
 * @name cat.FacetTerm
 * @module cat
 *
 * @description
 * A 'FacetTerm' model used in conjunction with the cat-paginated directive where it represents a value of a group or
 * property which can be used to filter the shown list.
 * It consist of an id, a name and a count
 *
 * @param {Object} [data={}] the data used instantiate the object with. Usually this is the object representation
 * returned from the server.
 * @constructor
 */
class FacetTerm {
    id;
    name:string;
    count:number;

    constructor(data:any = {}) {
        this.id = data.id;
        this.name = data.name;
        this.count = data.count;
    }

}

/**
 * @ngdoc overview
 * @name Facet
 *
 * @description
 * A 'Facet' model which is used in conjunction with the cat-paginated directive where it represents a group or
 * which property which can be used to filter the shown list.
 * It has a name and an array of FacetTerms
 *
 * @param {Object} [data={}] the data used instantiate the object with. Usually this is the object representation
 * returned from the server.
 * @constructor
 */
class Facet {
    name:string;
    terms:Array<FacetTerm>;

    constructor(data:any = {}) {
        this.name = data.name;
        this.terms = _.map(data.facets, (facet) => {
            return new FacetTerm(facet);
        });
    }
}

window.cat = window.cat || {};
window.cat.Facet = Facet;
window.cat.FacetTerm = FacetTerm;