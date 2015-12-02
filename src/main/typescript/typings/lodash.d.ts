interface lodash {
    isEmpty(obj:Object|Array<any>):boolean;
    assign(target:Object, ...sources:Array<Object>):Object,
}

declare var lodash:lodash;
declare var _:lodash;