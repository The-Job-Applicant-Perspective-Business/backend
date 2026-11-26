import aws from "aws-sdk";
import Archiver from "archiver";
import Stream from "stream";

const s3 = new aws.S3({
  region: process.env.AWS_S3_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  signatureVersion: "v4",
});

async function convertToZip(params: any) {
  const BucketName = process.env.S3_Bucket_NAME || "default-bucket";
  const s3FileDwnldStreams = params.files.map((item: any) => {
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
  const uploadParams = {
    Bucket: BucketName,
    Body: streamPassThrough,
    ContentType: "application/zip",
    Key: params.zippedFileKey,
  };
  const s3Upload = s3.upload(uploadParams, (err: any, data: any) => {
    if (err) {
      throw new Error(`${err.code} ${err.message} ${err.data}`);
    }
    console.log(`File uploaded successfully. ${data.Location}`);
  });
  s3Upload.on("httpUploadProgress", (progress: any) => {
    console.log(progress);
  });
  const archive = Archiver("zip", {
    zlib: { level: 0 },
  });
  archive.on("error", (error: any) => {
    throw new Error(
      `${error.name} ${error.code} ${error.message} ${error.path} ${error.stack}`
    );
  });
  await new Promise<void>((resolve, reject) => {
    console.log("Starting upload of the output Files Zip Archive");
    streamPassThrough.on("close", () => resolve());
    streamPassThrough.on("end", () => resolve());
    streamPassThrough.on("error", () => reject());
    archive.pipe(streamPassThrough);
    s3FileDwnldStreams.forEach((s3FileDwnldStream: any) => {
      archive.append(s3FileDwnldStream.stream, {
        name: s3FileDwnldStream.fileName,
      });
    });
    archive.finalize();
  }).catch((error: any) => {
    throw new Error(`${error?.code} ${error?.message} ${error?.data}`);
  });
  await s3Upload.promise();
}

export default convertToZip;