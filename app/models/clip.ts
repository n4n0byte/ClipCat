export default class Clip {

    readonly name:string;
    readonly clipUrl:string;
    readonly twitchVodUrl:string;
    readonly streamerId:string;
    readonly gameid:number;
    readonly title:string;
    readonly viewCount:string;
    readonly date:Date;

    constructor(rawClip:any){
        this.name = rawClip.broadcaster_name;
        this.clipUrl = 
        this.twitchVodUrl = rawClip.url;
        
    }

}