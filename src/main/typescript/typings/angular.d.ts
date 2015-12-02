interface AngularModule {
    service(name:string, def:Array<string|Object>);
    service(name:string, def:Object);
    config(def:Array<string|Function>);
    config(fun:Function);
    run();
    factory();
    directive();
    value(name:string, value:any);
    constant(name:string, value:any);
}

interface Angular {
    module(name:string, deps?:Array<string>):AngularModule;
}

declare var angular:Angular;