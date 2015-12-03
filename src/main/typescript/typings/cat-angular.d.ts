interface CatMessageService {
    addMessages(type:string, messages:Array<string>):void;
}


//
//declare var cat:{
//    SearchRequest:()=>any,
//    util:{
//        generateUUID():string;
//    };
//};

interface Window {
    cat: any;
}