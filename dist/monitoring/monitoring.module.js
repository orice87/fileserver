"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitoringModule = void 0;
class MonitoringModule {
    fileUploadStarted(filename, size) {
        process.stdout.write("Upload of file '"
            + filename +
            "' | "
            + Math.ceil(size / 1024) +
            " KB  has started! \n");
    }
    fileUploadFinished(filename, size) {
        process.stdout.write("Upload of file '"
            + filename +
            "' | "
            + Math.ceil(size / 1024) +
            " KB  has finished! \n");
    }
    fileUploadError(filename, error) {
        process.stdout.write("Upload of file '"
            + filename +
            "' has failed with Error! \n"
            + error.name + " | " + error.message + " \n");
    }
    sizeTresholdExceeded(spaceUsed, treshold) {
        process.stdout.write("Total space used treshold exceeded. "
            + spaceUsed +
            " Bytes are currently being used. Threshold amount equals to "
            + treshold +
            " Bytes. \n");
    }
}
exports.MonitoringModule = MonitoringModule;
