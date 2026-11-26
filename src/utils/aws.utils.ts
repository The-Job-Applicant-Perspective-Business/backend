import aws from "aws-sdk";
const s3 = new aws.S3({
    region: process.env.AWS_S3_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    signatureVersion: "v4",
});
export async function generateS3Url(filename) {
    const params = {
        Bucket: process.env.S3_Bucket_NAME,
        Key: filename,
        Expires: 60,
    };
    const uploadUrl = await s3.getSignedUrlPromise("putObject", params);
    return uploadUrl;
}
export async function deleteS3Object(filename) {
    const params = {
        Bucket: process.env.S3_Bucket_NAME || "",
        Key: filename,
    };
    await s3.deleteObject(params).promise();
}
