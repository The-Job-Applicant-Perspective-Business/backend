import { generateAPIError } from "../errors/apiError.js";
import { USER_ROLE_ENUM } from "../../utils/enums.utils.js";
import util from "util";
import jwt from "jsonwebtoken";
import UserModel from "../../models/user.model.js";
import { IncrementActiveHrCount, AddAnalyticsQueue, } from "../../apps/analytics/analytics.service.js";
const jwtVerify = util.promisify(jwt.verify);
//checkRoles is a pure function
export const checkRoles = (type, allRoles) => {
    let roles = [];
    if (Array.isArray(type))
        roles = [...type];
    else if (type === "all")
        roles = [...allRoles];
    else if (typeof type === "string")
        roles = [type];
    else
        throw new Error(`invalid roles type in auth midddleware: ${typeof type}`);
    for (const ro of roles) {
        if (!allRoles.includes(ro))
            throw new Error(`invalid role name in auth midddleware: ${roles}`);
    }
    return roles;
};
//checkToken is a pure function
export const checkToken = async (roles, token, jwtSecret) => {
    const decodeValue = await jwtVerify(token, jwtSecret);
    if (!(decodeValue && decodeValue.role)) {
        throw generateAPIError("Unauthorized", 401);
    }
    if (!roles.includes(decodeValue.role)) {
        throw generateAPIError(`Unauthorized for ${decodeValue.role}`, 401);
    }
    return decodeValue;
};
const auth = (users) => {
    const roles = checkRoles(users, Object.values(USER_ROLE_ENUM));
    return async (req, res, next) => {
        try {
            const token = req.headers["authorization"]?.split(" ")[1];
            const jwtSecret = process.env.JWT_SECRET || "sample";
            const decodeValue = await checkToken(roles, token, jwtSecret);
            const user = await UserModel.findOne({ _id: decodeValue._id });
            const tokenId = decodeValue.tokenId;
            if (!user)
                throw generateAPIError("Token is no longer valid", 401);
            const tokenIds = user.tokenIds.map((t) => t.id);
            if (!tokenIds.includes(tokenId))
                throw generateAPIError("Token is no longer valid", 401);
            req.auth = { user, token: decodeValue };
            // if user is hr then increment activeHrCount if it is not already incremented
            if (user.role === "hr" && !user.isHrActiveToday) {
                // user.isHrActiveToday = true;
                // user.lastHrActivity = getUsDateStringWithoutTime(new Date());
                // await user.save();
                // await IncrementActiveHrCount(user._id.toString());
                AddAnalyticsQueue(IncrementActiveHrCount, [
                    user._id.toString(),
                ]);
            }
            next();
        }
        catch (err) {
            if (err.errorCode)
                return next(err);
            return next(generateAPIError(err.message, 401));
        }
    };
};
const authOptional = () => {
    const roles = checkRoles("all", Object.values(USER_ROLE_ENUM));
    return async (req, res, next) => {
        try {
            const token = req.headers["authorization"]?.split(" ")[1];
            const jwtSecret = process.env.JWT_SECRET || "sample";
            if (!token)
                return next();
            const decodeValue = await checkToken(roles, token, jwtSecret);
            const user = await UserModel.findOne({ _id: decodeValue._id });
            const tokenId = decodeValue.tokenId;
            if (!user)
                throw generateAPIError("Token is no longer valid", 401);
            const tokenIds = user.tokenIds.map((t) => t.id);
            if (!tokenIds.includes(tokenId))
                throw generateAPIError("Token is no longer valid", 401);
            req.auth = { user, token: decodeValue };
            if (user.role === "hr" && !user.isHrActiveToday) {
                // user.isHrActiveToday = true;
                // user.lastHrActivity = getUsDateStringWithoutTime(new Date());
                // await user.save();
                // await IncrementActiveHrCount(user._id.toString());
                AddAnalyticsQueue(IncrementActiveHrCount, [
                    user._id.toString(),
                ]);
            }
            next();
        }
        catch (err) {
            if (err.errorCode)
                return next(err);
            return next(generateAPIError(err.message, 401));
        }
    };
};
export default auth;
export { authOptional };
//# sourceMappingURL=auth.js.map