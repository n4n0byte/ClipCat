require('dotenv').config();
import APIManager from "./clipDownloader/apiManager";
import Clip from "./models/clip";

const manager = new APIManager()

<<<<<<< HEAD
var streamerList = ["ludwig", "Sykkuno", "CohhCarnage", "sodapoppin", "Mizkif", "Greekgodx", "EsfandTV"]
var test = [] as any[];
=======
var streamerList = ["ludwig","Sykkuno","CohhCarnage","sodapoppin","Mizkif","Greekgodx","EsfandTV"]
var test = [] as any;
>>>>>>> parent of ff8f1a3... Clip download poc
var ids = [] as number[];
var processedVodList = [] as Clip[];

streamerList.forEach(element => {
    manager.getBroadcasterId(element, broadcasterIdCallback);
});

function broadcasterIdCallback(data:any){
    manager.getClips(data,ClipListCallback);
}

function ClipListCallback(data:any){
    ids.push(data.data[0].broadcaster_id);
    data.data.forEach((element:any) => {
        test.push(element);
    });

    if (ids.length == streamerList.length) {
      
        test.forEach((clip: any) => {
            processedVodList.push(new Clip(clip));
        });
        
    }
 }


 setTimeout(() => {
    console.log(ids.length + " : " + streamerList.length);
    console.log(ids)
}, 1000)

