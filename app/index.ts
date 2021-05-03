require('dotenv').config();
import APIManager from "./clipDownloader/apiManager";
import ClipMerger from "./clipMerger/clipMerger";
import Clip from "./models/clip";
var Ffmpeg = require('fluent-ffmpeg');
var fs = require('fs');

const manager = new APIManager(daysToQueryFor);
const clipMerger = new ClipMerger();

var streamerList = ["xQcOW", "Asmongold", "ludwig", "Sykkuno", "sodapoppin", "Mizkif","TimTheTatman"];

var clipMap = new Map();
var test = [] as any;
var ids = [] as number[];
var processedVodList = [] as Clip[];
var args = process.argv.slice(2);
var numberOfClips = 50;
var maxClips = 4;
var minViewCount = 0;
var daysToQueryFor = 3;4

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

        processedVodList.forEach(element => {
            console.log(`${element.name} ${element.title} ${element.viewCount}`);
            
        });

        // sort on most viewed
        processedVodList.sort((lhs, rhs) => { return rhs.viewCount - lhs.viewCount })


        // filter out clips to make sure there are not too many from the same creator
        processedVodList = processedVodList.filter((clip) => {

            if(!clipMap.has(clip.name)){
                clipMap.set(clip.name,0);
                return true;
            }

            var clipData = clipMap.get(clip.name);

            clipMap.set(clip.name, clipData + 1);

            return clipMap.get(clip.name) < maxClips;
            
        });


        // filter out clips by view count
        processedVodList = processedVodList.filter((clip) => {
            return clip.viewCount > minViewCount;
        });

        

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
    if (args[0] == "upscale"){
        clipMerger.BatchUpscaleClipResolutions();
    }
    if (args[0] == "mark"){
        clipMerger.markClips();
    }
    if (args[0] == "merge"){
        clipMerger.mergeSelectedClips();
    }
    if (args[0] == "credits"){
        clipMerger.generateAttributions();
    }
    
    if(args[0] == "ffmpeg"){
        Ffmpeg.getAvailableCodecs(function(err:string, encoders:any) {
            console.log('Available codecs:');          
            fs.writeFile('./codecs.txt', JSON.stringify(encoders), ()=>{});
          });
    }

}
