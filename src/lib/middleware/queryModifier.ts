import { generateAPIError } from "../errors/apiError.js";
const arrayRegex = /\[([^\]]+)\]/;
function formatArrayString(data) {
    const result = [];
    if (Array.isArray(data)) {
        for (const item of data) {
            let match = formatArrayString(item);
            result.push(...match);
        }
    }
    else {
        let match = arrayRegex.exec(data || "");
        if (match) {
            let data = match[1].split(",");
            data = data
                .filter((item) => item !== "")
                .map((item) => item.trim());
            result.push(...data);
        }
        else {
            data ? result.push(data) : null;
        }
    }
    return result;
}
const queryModifierMiddleware = (fields) => {
    return (req, res, next) => {
        try {
            const data = req.query;
            for (const field of fields) {
                if (data[field] !== undefined) {
                    data[field] = formatArrayString(data[field]);
                }
            }
            req.query = data;
            next();
        }
        catch (error) {
            next(generateAPIError(error.message, 500));
        }
    };
};
export { formatArrayString };
export default queryModifierMiddleware;
