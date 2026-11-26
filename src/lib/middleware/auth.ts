import { generateAPIError } from "../errors/apiError.js";
import { USER_ROLE_ENUM } from "../../utils/enums.utils.js";
import jwt, { JwtPayload } from "jsonwebtoken";
import UserModel from "../../models/user.model.js";
import {
  IncrementActiveHrCount,
  AddAnalyticsQueue,
} from "../../apps/analytics/analytics.service.js";

export interface AuthTokenPayload extends JwtPayload {
  _id: string;
  role: string;
  tokenId: string;
}

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) {
    throw new Error("FATAL: JWT_SECRET environment variable is required.");
  }
  return secret;
};

if (process.env.NODE_ENV !== "test") {
  getJwtSecret();
}

const verifyJwtToken = (
  token: string,
  jwtSecret: string
): Promise<AuthTokenPayload> =>
  new Promise((resolve, reject) => {
    jwt.verify(token, jwtSecret, (err, decoded) => {
      if (err || !decoded || typeof decoded === "string") {
        reject(err ?? new Error("Invalid token payload"));
        return;
      }
      resolve(decoded as AuthTokenPayload);
    });
  });

// checkRoles is a pure function
export const checkRoles = (
  type: string | string[],
  allRoles: string[]
): string[] => {
  let roles: string[] = [];
  if (Array.isArray(type)) roles = [...type];
  else if (type === "all") roles = [...allRoles];
  else if (typeof type === "string") roles = [type];
  else
    throw new Error(`invalid roles type in auth midddleware: ${typeof type}`);
  for (const ro of roles) {
    if (!allRoles.includes(ro))
      throw new Error(`invalid role name in auth midddleware: ${roles}`);
  }
  return roles;
};

// checkToken is a pure function
export const checkToken = async (
  roles: string[],
  token: string,
  jwtSecret: string
): Promise<AuthTokenPayload> => {
  const decodeValue = await verifyJwtToken(token, jwtSecret);
  if (!(decodeValue && decodeValue.role)) {
    throw generateAPIError("Unauthorized", 401);
  }
  if (!roles.includes(decodeValue.role)) {
    throw generateAPIError(`Unauthorized for ${decodeValue.role}`, 401);
  }
  return decodeValue;
};

const auth = (users: string | string[]) => {
  const roles = checkRoles(users, Object.values(USER_ROLE_ENUM));
  return async (req: any, res: any, next: any) => {
    try {
      const token = req.headers["authorization"]?.split(" ")[1];
      if (!token) {
        throw generateAPIError("Unauthorized", 401);
      }
      const jwtSecret = getJwtSecret();
      const decodeValue = await checkToken(roles, token, jwtSecret);
      const user = await UserModel.findOne({ _id: decodeValue._id });
      const tokenId = decodeValue.tokenId;
      if (!user) throw generateAPIError("Token is no longer valid", 401);
      const tokenIds = user.tokenIds.map((t: any) => t.id);
      if (!tokenIds.includes(tokenId))
        throw generateAPIError("Token is no longer valid", 401);
      req.auth = { user, token: decodeValue };
      if (user.role === "hr" && !user.isHrActiveToday) {
        AddAnalyticsQueue(IncrementActiveHrCount, [user._id.toString()]);
      }
      next();
    } catch (err: any) {
      if (err.errorCode) return next(err);
      return next(generateAPIError(err.message, 401));
    }
  };
};

const authOptional = () => {
  const roles = checkRoles("all", Object.values(USER_ROLE_ENUM));
  return async (req: any, res: any, next: any) => {
    try {
      const token = req.headers["authorization"]?.split(" ")[1];
      const jwtSecret = getJwtSecret();
      if (!token) return next();
      const decodeValue = await checkToken(roles, token, jwtSecret);
      const user = await UserModel.findOne({ _id: decodeValue._id });
      const tokenId = decodeValue.tokenId;
      if (!user) throw generateAPIError("Token is no longer valid", 401);
      const tokenIds = user.tokenIds.map((t: any) => t.id);
      if (!tokenIds.includes(tokenId))
        throw generateAPIError("Token is no longer valid", 401);
      req.auth = { user, token: decodeValue };
      if (user.role === "hr" && !user.isHrActiveToday) {
        AddAnalyticsQueue(IncrementActiveHrCount, [user._id.toString()]);
      }
      next();
    } catch (err: any) {
      if (err.errorCode) return next(err);
      return next(generateAPIError(err.message, 401));
    }
  };
};

export default auth;
export { authOptional };