import mongoose from "mongoose";
import { USER_ROLE_ENUM } from "../utils/enums.utils.js";
const userSchema = new mongoose.Schema({
    // common fields
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
        enum: USER_ROLE_ENUM,
    },
    forgotUuid: String,
    forgotUuidExpiry: Date,
    tokenIds: [
        {
            _id: false,
            id: String,
            createdAt: Date,
        },
    ],
    // hr specific fields
    name: String,
    companyName: String,
    industry: String,
    employmentCount: String,
    location: String,
    socialLinks: [
        {
            _id: false,
            name: String,
            link: String,
        },
    ],
    jobCount: {
        type: Number,
        default: 0,
    },
    isHrActiveToday: {
        type: Boolean,
        default: false,
    },
    lastHrActivity: String,
}, {
    timestamps: true,
});
const UserModel = mongoose.model("users", userSchema);
export default UserModel;
//# sourceMappingURL=user.model.js.map