require('dotenv').config();
import APIManager from "./clipDownloader/apiManager";

const manager = new APIManager()

var streamerList = ["ludwig","Sykkuno","CohhCarnage","sodapoppin","Mizkif","Greekgodx","EsfandTV"]
var test = [];
var ids = [] as number[];


streamerList.forEach(element => {
    manager.getBroadcasterId(element, broadcasterIdCallback);
});

function broadcasterIdCallback(data:any){
    console.log(data);
    manager.getClips(data,ClipListCallback);
}

function ClipListCallback(data:any){
    console.log(data);
    ids.push(data.data[0].broadcaster_id);
    data.data.forEach((element:any) => {
        test.push(element);
    });

    if(ids.length = streamerList.length){
        // do stuff
        manager.makeClipLink("https://clips-media-assets2.twitch.tv/AT-cm%7C812257925-preview-480x272.jpg")       
        
    }
 }

console.log(test.length + "NOTICE ME");
