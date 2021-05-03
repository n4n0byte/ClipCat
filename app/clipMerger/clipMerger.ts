
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs')
export default class ClipMerger {
    private unprocessedVideos: string[] = [];

    constructor(private selectedClipsFolder:string = "./selectedClips/") {
        // get filenames of selected videos and store them
        fs.readdirSync(this.selectedClipsFolder).forEach((filename: any) => {
            this.unprocessedVideos.push(this.selectedClipsFolder + filename);
        });
    }

    

    markClips() {
        // const splits = myString.split()
        this.unprocessedVideos.forEach(clipPath => {
            var relativeClipPath = clipPath.slice(clipPath.lastIndexOf('/') + 1, clipPath.length);
            var fileSplit = relativeClipPath.split('[[--+');
            var clipTitle = fileSplit[4];
            var streamerName = fileSplit[2];
            var fontColor = 'white';
            var xPos = 50;
            var yPos = 1000;
            var fSize = 40;

            ffmpeg(clipPath)
                .inputOptions('-vsync 0')
                .inputOptions('-hwaccel cuda')
                .videoFilters({
                    filter: 'drawtext',
                    options: {
                        fontfile: process.env.NORMAL_FONT_PATH,
                        text: streamerName,
                        fontsize: fSize-10,
                        fontcolor: fontColor,
                        x: xPos,
                        y: yPos - 50,
                        shadowcolor: 'black',
                        shadowx: 2,
                        shadowy: 2,
                    }
                })
                .videoFilters({
                    filter: 'drawtext',
                    options: {
                        fontfile: process.env.NORMAL_FONT_PATH,
                        text: clipTitle,
                        fontsize: fSize,
                        fontcolor: fontColor,
                        x: xPos,
                        y: yPos,
                        shadowcolor: 'black',
                        shadowx: 2,
                        shadowy: 2,
                    }
                })
                .on('end', () => {
                    console.log(`finished marking: ${clipTitle}`);
                    this.deleteOldFile(clipPath);
                })

                .save(`${clipPath}-marked.mp4`);
        })
    }


    generateAttributions(){
        var attribution = "Credits\n";
        var attributionList:string[] = [];
        this.unprocessedVideos.forEach(clipPath => {
            
            var relativeClipPath = clipPath.slice(clipPath.lastIndexOf('/') + 1, clipPath.length);
            var fileSplit = relativeClipPath.split('[[--+');
            var streamerName = fileSplit[2];
            var curAttribution = `${streamerName} twitch.tv/${streamerName}\n`;

            // prevent dupe attributions
            if(!attributionList.includes(curAttribution)){
                attribution += curAttribution;
                attributionList.push(curAttribution);
            }
        });
        fs.writeFile('./attriutions.txt', attribution, ()=>{console.log('finished writing attributions');
        });
    }

    BatchUpscaleClipResolutions() {
        console.log('Checking for clips to upscale');
        // loop through all unprocessed clips
        this.unprocessedVideos.forEach(clipPath => {

            // get metadata
            ffmpeg.ffprobe(clipPath, function (err: any, metadata: any) {

                // check resolution and upscale if needed
                if (metadata.streams[0].width !== 1920 && metadata.streams[0].height != 1080) {
                    var upscaledFilePath = `${clipPath.slice(0, clipPath.length - 4)}-upscaled.mp4`;
                    console.dir(`processing ${clipPath} ${metadata.streams[0].codec_name} ${metadata.streams[0].width}x${metadata.streams[0].height}`);

                    ffmpeg(clipPath)
                        .inputOptions('-vsync 0')
                        .inputOptions('-hwaccel cuda')    
                        .size('1920x1080')
                        .output(upscaledFilePath)
                        .on('end', () => {
                            console.log(`finished upscaling ${clipPath}`);
                            console.log(clipPath)

                            console.log(`deleting: ${clipPath}`);
        
                            fs.unlinkSync(clipPath, (err: string) => {
                                if (err) {
                                    console.error(err + "\nFailed to delete old clip")
                                    return;
                                }
                                console.log(`Successfully deleted ${clipPath}`);
                            })
                        })
                        .on('error', (err: string) => {
                            console.log(err);
                        })
                        .run();

                }

            });

        });
    }

    normalizeAudio() {
        var fName = './mergedFile.mp4'
        console.log(`normalizing audio`)
        ffmpeg(fName)
            .outputOptions('-filter:a dynaudnorm')
            .on('error', (err: string) => {
                console.log(`failed to normalize audio in ${fName} \nerr`);
            })
            .on('end', () => {
                console.log(`finished audio normalization in: ${fName}`);
                this.deleteOldFile(fName);
            })
            .save('normalizedFile.mp4');

    }

    mergeSelectedClips() {
        console.log('Merging Clips');


        ffmpeg()
            .inputPathArray(this.unprocessedVideos)
            .inputOptions('-vsync 0')
            .inputOptions('-hwaccel cuda')    
            .on('end', () => {
                console.log("finished merging clips");
                // this.normalizeAudio();
            })
            .on('error', function (err: { message: string; }) {
                console.log('An error occurred: ' + err.message);
            })
            .mergeToFile('mergedFile.mp4', '.');
    }


    deleteOldFile(path:string){
        console.log(`deleting: ${path}`);
        
        fs.unlinkSync(path, (err: string) => {
            if (err) {
                console.error(err + "Failed to delete old clip")
                return;
            }
            console.log(`Successfully deleted ${path}`);
        })
    }


}