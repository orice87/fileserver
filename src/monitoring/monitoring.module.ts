export class MonitoringModule {

    public fileUploadStarted(filename : string, size : number) : void {
        process.stdout.write("Upload of file '" 
        + filename +
        "' | " 
        + Math.ceil(size / 1024) + 
        " KB  has started! \n");
    }

    public fileUploadFinished(filename : string, size : number) : void {
        process.stdout.write("Upload of file '"
         + filename + 
         "' | " 
         + Math.ceil(size / 1024) + 
         " KB  has finished! \n");
    }

    public fileUploadError(filename : string, error : Error) : void {
        process.stdout.write("Upload of file '" 
        + filename + 
        "' has failed with Error! \n"
        + error.name + " | "  + error.message + " \n");
    }

    public sizeTresholdExceeded(spaceUsed : number, treshold : number) : void {
        process.stdout.write("Total space used treshold exceeded. "
        + spaceUsed + 
        " Bytes are currently being used. Threshold amount equals to "
        + treshold + 
        " Bytes. \n"); 
    }

}