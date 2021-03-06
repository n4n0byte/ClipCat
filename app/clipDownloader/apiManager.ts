import { exception } from "console";
import Clip from "../models/clip";

const axios = require('axios').default;
axios.defaults.headers.get['Authorization'] = `Bearer ${process.env.ACCESS_TOKEN}` as string;
axios.defaults.headers.get['Client-Id'] = process.env.CLIENT_ID as string;
const https = require("https");
const fs = require("fs");

export default class APIManager {

    private regex = "https:\/\/clips-media-assets2\.twitch\.tv\/(.*)-p" as string;
    private endDate:Date = new Date();
    private startDate:Date = new Date();
    
    private options = {
        headers: {
            Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
            'Client-Id': process.env.CLIENT_ID
        }
    }

    constructor(private dateInterval: number = 3){
        this.startDate.setDate(this.startDate.getDate()-this.dateInterval);
    }

    getBroadcasterId(name: string, callback: any): number {
        let data = "";
        let res = -1;

        https.get(`https://api.twitch.tv/helix/users?login=${name}`, this.options, (resp: any) => {

            // A chunk of data has been recieved.
            resp.on("data", (chunk: any) => {
                data += chunk;
            });

            // The whole response has been received. Print out the result.
            resp.on("end", () => {
                callback(JSON.parse(data).data[0].id);
            });
        })
            .on("error", (err: any) => {
                console.log("Error: " + err.message);
            });
        return res;
    }


    getClips(id: number, callback: any) {
        let data = "";
        let processedJson: any = {};
        // console.log(`https://api.twitch.tv/helix/clips?broadcaster_id=${id}&created_at=${this.startDate.toISOString()}&ended_at=${this.endDate.toISOString()}`);
        
        https.get(`https://api.twitch.tv/helix/clips?broadcaster_id=${id}&started_at=${this.startDate.toISOString()}&ended_at=${this.endDate.toISOString()}`, this.options, (resp: any) => {

            // A chunk of data has been recieved.
            resp.on("data", (chunk: any) => {
                data += chunk;
            });

            // The whole response has been received. Print out the result.
            resp.on("end", () => {
                processedJson = JSON.parse(data);
                callback(processedJson);
            });
        })
            .on("error", (err: any) => {
                console.log("Error: " + err.message);
            });
        return data;
    }

    // match regex and reform clip asset link
    makeClipLink(clipLink: string) {
        return `https://production.assets.clips.twitchcdn.net/${clipLink.match(this.regex)[1]}.mp4`;
    }

    

    downloadClips(clips: Clip[]) {
        var root = "./clips/";
        var delimiter = '[[--+';
        clips.forEach(clip => {
            var location = `${root}${delimiter}${clip.viewCount}${delimiter}${clip.name}${delimiter}${clip.streamerId}${delimiter}${clip.title}${delimiter}.mp4`;
            const file = fs.createWriteStream(location)
                .on('error', function (err: any) { // Handle errors
                    console.log(err);
                    console.log(clip);
                    console.log("Error Downloading");
                    fs.unlink(location,()=>{console.log(`deleted file: ${location}`);
                    }); // Delete the file async. (But we don't check the result)                    
                });
            https.get(clip.clipUrl, function (response: any) {
                console.log('statusCode:', response.statusCode);
                console.log(`${clip.title} : ${clip.date}`);
                response.pipe(file);
            }).on('error', (err: any) => {
                console.log(err);
            }).on('end', () => {
                console.log(`finished downloading: ${clip.title}`);
            });
        });
    }
}