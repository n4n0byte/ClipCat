
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs')
export default class ClipMerger {
    private unprocessedVideos: string[] = [];
    private selectedClipsFolder: string = "./selectedClips/";

    constructor(selectedClipsFolder?: string) {
        // get filenames of selected videos and store them
        fs.readdirSync(this.selectedClipsFolder).forEach((filename: any) => {
            this.unprocessedVideos.push(this.selectedClipsFolder + filename);
        });
    }


    mergeSelectedClips() {
        var x = ffmpeg;

        ffmpeg()
            .inputPathArray(this.unprocessedVideos.slice(0,4))
            .on('end', () => {
                console.log("finished merging clips");
            })
            .on('error', function (err: { message: string; }) {
                console.log('An error occurred: ' + err.message);
            })
            .mergeToFile('mergedFile.mp4', '.');
    }

}