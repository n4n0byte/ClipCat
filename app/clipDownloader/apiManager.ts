import { exception } from "console";
import Clip from "../models/clip";

const axios = require('axios').default;
axios.defaults.headers.get['Authorization'] = `Bearer ${process.env.ACCESS_TOKEN}` as string;
axios.defaults.headers.get['Client-Id'] = process.env.CLIENT_ID as string;
const https = require("https");
const fs = require("fs");
const Stream = require("stream").Transform;

export default class APIManager {

    private regex = "https:\/\/clips-media-assets2\.twitch\.tv\/(.*)-p" as string;

    private options = {
        headers: {
            Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
            'Client-Id': process.env.CLIENT_ID
        }
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

        https.get(`https://api.twitch.tv/helix/clips?broadcaster_id=${id}`, this.options, (resp: any) => {

            // A chunk of data has been recieved.
            resp.on("data", (chunk: any) => {
                data += chunk;
            });

            // The whole response has been received. Print out the result.
            resp.on("end", () => {
                callback(JSON.parse(data))
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

        clips.forEach(clip => {
            var location = `${root}${clip.name}${clip.streamerId}.mp4`;
            const file = fs.createWriteStream(location)
                .on('error', function (err: any) { // Handle errors
                    console.log(err)
                    fs.unlink(location); // Delete the file async. (But we don't check the result)                    
                });
            const request = https.get(clip.clipUrl, function (response: any) {
                response.pipe(file);
            });
        });
    }

    // async getClipsWithUsername(broadcasterName: string) {
    //     return this.getClips(await this.getBroadcasterId(broadcasterName));
    // }

}