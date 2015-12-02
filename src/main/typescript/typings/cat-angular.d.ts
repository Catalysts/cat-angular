interface CatMessageService {
    addMessages(type:string, messages:Array<string>):void;
}

declare var cat:{
    util:{
        generateUUID():string;
    };
};