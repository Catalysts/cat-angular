interface jQueryInstance extends Array<HTMLElement> {

}

interface jQuery extends Function {
    (selector:string|jQueryInstance|HTMLElement): jQueryInstance;
    param(data:any, simple?:boolean):string;
}

declare var $:jQuery;