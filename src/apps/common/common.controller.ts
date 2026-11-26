import { generateAPIError } from "../../lib/errors/apiError.js";
import { S3_FILE_TYPES } from "../../utils/enums.utils.js";
import { generateS3Url } from "../../utils/aws.utils.js";
import { v4 as uuidv4 } from "uuid";
async function generateS3SignedUrlController(req, res) {
    const { fileName, jobId } = req.body;
    const { fileType } = req.params;
    if (Object.values(S3_FILE_TYPES).indexOf(fileType) === -1) {
        throw generateAPIError(`${fileType} is not a valid file type check path params`, 400);
    }
    if (!fileName) {
        throw generateAPIError("fileName is required", 400);
    }
    const fileExt = fileName.split(".")[1] || "";
    const uuid = uuidv4();
    let url = "";
    switch (fileType) {
        case S3_FILE_TYPES.RESUME:
            if (!jobId) {
                throw generateAPIError("jobId is required", 400);
            }
            url = await generateS3Url(`${fileType}/${jobId}/${uuid}.${fileExt}`);
            break;
        default:
            url = await generateS3Url(`${fileType}/${uuid}.${fileExt}`);
            break;
    }
    // const url = await generateS3Url(`${fileType}/${uuid}.${fileExt}`);
    res.status(200).json({
        success: true,
        data: url,
        message: "S3 url generated successfully",
    });
}
export { generateS3SignedUrlController };
