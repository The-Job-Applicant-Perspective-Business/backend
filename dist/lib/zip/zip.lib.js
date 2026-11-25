import aws from "aws-sdk";
import Archiver from "archiver";
import Stream from "stream";
// import https from "https";
const s3 = new aws.S3({
    region: process.env.AWS_S3_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    signatureVersion: "v4",
});
async function convertToZip(params) {
    // const sslAgent = new https.Agent({
    //     KeepAlive: true,
    //     rejectUnauthorized: true
    // });
    // sslAgent.setMaxListeners(0);
    // aws.config.update({
    //     httpOptions: {
    //         agent: sslAgent,
    //     },
    //     region: 'us-east-1'
    // })
    // create readstreams for all the output files and store them
    // const createReadStream = fs.createReadStream;
    const BucketName = process.env.S3_Bucket_NAME || "default-bucket";
    const s3FileDwnldStreams = params.files.map((item) => {
        const stream = s3
            .getObject({
            Key: item.storageName,
            Bucket: BucketName,
        })
            .createReadStream();
        return {
            stream,
            fileName: item.fileName,
        };
    });
    const streamPassThrough = new Stream.PassThrough();
    // Create a zip archive using streamPassThrough style for the linking request in s3bucket
    const uploadParams = {
        Bucket: BucketName,
        Body: streamPassThrough,
        ContentType: "application/zip",
        Key: params.zippedFileKey,
    };
    const s3Upload = s3.upload(uploadParams, (err, data) => {
        if (err) {
            throw new Error(`${err.code} ${err.message} ${err.data}`);
        }
        console.log(`File uploaded successfully. ${data.Location}`);
    });
    s3Upload.on("httpUploadProgress", (progress) => {
        console.log(progress); // { loaded: 4915, total: 192915, part: 1, key: 'foo.jpg' }
    });
    // create the archiver
    const archive = Archiver("zip", {
        zlib: { level: 0 },
    });
    archive.on("error", (error) => {
        throw new Error(`${error.name} ${error.code} ${error.message} ${error.path} ${error.stack}`);
    });
    // connect the archiver to upload streamPassThrough and pipe all the download streams to it
    await new Promise((resolve, reject) => {
        console.log("Starting upload of the output Files Zip Archive");
        streamPassThrough.on("close", () => resolve());
        streamPassThrough.on("end", () => resolve());
        streamPassThrough.on("error", () => reject());
        archive.pipe(streamPassThrough);
        s3FileDwnldStreams.forEach((s3FileDwnldStream) => {
            archive.append(s3FileDwnldStream.stream, {
                name: s3FileDwnldStream.fileName,
            });
        });
        archive.finalize();
    }).catch((error) => {
        throw new Error(`${error.code} ${error.message} ${error.data}`);
    });
    // Finally wait for the uploader to finish
    await s3Upload.promise();
}
export default convertToZip;
//# sourceMappingURL=zip.lib.js.map