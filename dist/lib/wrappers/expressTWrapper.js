import mongoose from "mongoose";
const expressTWrapper = (fn) => {
    return async (req, res, next) => {
        try {
            let session = await mongoose.startSession();
            try {
                session.startTransaction();
                await fn(req, res, session);
                await session.commitTransaction();
                session.endSession();
            }
            catch (err) {
                await session.abortTransaction();
                session.endSession();
                next(err);
            }
        }
        catch (err) {
            next(err);
        }
    };
};
export default expressTWrapper;
//# sourceMappingURL=expressTWrapper.js.map