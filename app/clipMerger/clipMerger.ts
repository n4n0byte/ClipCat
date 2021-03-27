
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

    BatchNormalizeClipResolutions(){
        console.log('Checking for clips to upscale');
        // loop through all unprocessed clips
        this.unprocessedVideos.forEach(clipPath => {

            // get metadata
            ffmpeg.ffprobe(clipPath, function(err: any, metadata: any) {

                // check resolution and upscale if needed
                if(metadata.streams[0].width !== 1920 && metadata.streams[0].height != 1080){
                    var upscaledFilePath = `${clipPath.slice(0,clipPath.length-4)}-upscaled.mp4`;
                    console.dir(`processing ${clipPath} ${metadata.streams[0].codec_name} ${metadata.streams[0].width}x${metadata.streams[0].height}`);
                    
                    ffmpeg(clipPath)
                        // .inputOptions('-vf scale=1920x1080:flags=lanczos -c:v libx264 -preset slow -crf 21')
                        .size('1920x1080')
                        .output(upscaledFilePath)
                        .on('end',()=>{
                            console.log(`finished upscaling ${clipPath}`);
                            fs.unlink(clipPath, (err:string) => {
                                if (err) {
                                  console.error(err + "Failed to delete old clip")                            
                                  return;
                                }
                                console.log(`Successfully deleted ${clipPath}`);
                                
                              })                    
                        })
                        .on('error',(err: string)=>{
                            console.log(err);                            
                        })
                        .run();
                         
                }

            });
                
        });
    }

    mergeSelectedClips() {
        console.log('Merging Clips');
        
        ffmpeg()
            .inputPathArray(this.unprocessedVideos)
            .on('end', () => {
                console.log("finished merging clips");
            })
            .on('error', function (err: { message: string; }) {
                console.log('An error occurred: ' + err.message);
            })
            .mergeToFile('mergedFile.mp4', '.');
    }

}