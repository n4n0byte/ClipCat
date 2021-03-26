import APIManager from "../clipDownloader/apiManager";

export default class Clip {

    readonly name:string;
    readonly clipUrl:string;
    readonly twitchVodUrl:string;
    readonly streamerId:number;
    readonly gameid:number;
    readonly title:string;
    readonly viewCount:number;
    readonly date:string;

    constructor(rawClip:any){
        var manager = new APIManager();
        this.name = rawClip.broadcaster_name;
        this.clipUrl = manager.makeClipLink(rawClip.thumbnail_url);
        this.twitchVodUrl = rawClip.url;
        this.streamerId = rawClip.broadcaster_id;
        this.gameid = rawClip.game_id;
        this.title = rawClip.title;
        this.viewCount = rawClip.view_count;
        this.date = rawClip.created_at;
    }

}