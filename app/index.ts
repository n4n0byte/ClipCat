require('dotenv').config();
import APIManager from "./clipDownloader/apiManager";
import ClipMerger from "./clipMerger/clipMerger";
import Clip from "./models/clip";

const manager = new APIManager();
const clipMerger = new ClipMerger();

var streamerList = ["ludwig", "Sykkuno", "HasanAbi", "sodapoppin", "Mizkif", "xQcOW", "Trainwreckstv"]
var test = [] as any;
var ids = [] as number[];
var processedVodList = [] as Clip[];
var args = process.argv.slice(2);
var numberOfClips = 30;

function broadcasterIdCallback(data: any) {
    manager.getClips(data, ClipListCallback);
}

function ClipListCallback(data: any) {
    ids.push(data.data[0].broadcaster_id);
    data.data.forEach((element: any) => {
        test.push(element);
    });

    if (ids.length == streamerList.length) {
        // do stuff

        test.forEach((clip: any) => {
            processedVodList.push(new Clip(clip));
        });

        // sort on most viewed
        processedVodList.sort((lhs, rhs) => { return rhs.viewCount - lhs.viewCount })

        // get first X clips
        var selectedClips = processedVodList.slice(0, numberOfClips) as Clip[];

        // download selected clips
        manager.downloadClips(selectedClips);
        
    }
}

if (args.length == 0){

    streamerList.forEach(element => {
        manager.getBroadcasterId(element, broadcasterIdCallback);
    });    
} else{
    if (args[0] == "merge"){
        clipMerger.BatchUpscaleClipResolutions();
    }
    if (args[0] == "mark"){
        clipMerger.markClips();
    }
}
