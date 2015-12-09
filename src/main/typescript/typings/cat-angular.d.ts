interface CatRequestConfig extends IRequestConfig {
    catValidationContextId?:string;
}

interface CatHttpPromiseCallbackArg<T> extends IHttpPromiseCallbackArg<T> {
    config?:CatRequestConfig;
}

interface Window {
    cat: any;
}