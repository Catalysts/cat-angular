interface LodashArrayWrapper<T> {
    map<S>(fun:(element:T)=>S):Array<S>;
    reduce<S>(fun:(result:S, next:T)=>S):S;
    value():T;
}
interface LodashObjectWrapper<T> {
    keys():Array<string>;
    value():T;
}

interface lodash extends Function {
    <T>(data:Array<T>): LodashArrayWrapper<T>;
    <T>(data:T): LodashObjectWrapper<T>;
    isEmpty(obj:Object|Array<any>):boolean;
    assign(target:Object, ...sources:Array<Object>):Object;
    map<T>(source:Array<any>, fun:(element:any)=>T):Array<T>;
    merge(target:Object, ...sources:Array<Object>):Object;
    memoize(fun:Function):Function;
    forEach<T>(iter:Array<T>, fun:(element:T)=>void):void;
    keys(obj:Object):Array<string>;
    isUndefined(obj:any):boolean;
    isArray(obj:any):boolean;
    isString(obj:any):boolean;
    isObject(obj:any):boolean;
}

declare var _:lodash;