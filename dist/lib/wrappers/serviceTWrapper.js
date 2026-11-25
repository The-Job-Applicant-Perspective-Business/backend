import mongoose from "mongoose";
export const serviceTWrapper = (fn) => {
    return async (...args) => {
        try {
            //const [fnArgs, options] = [args.slice(0, -1), args[args.length - 1]];
            const fnArgs = args.slice(0, -1);
            const options = args.slice(-1)[0];
            let cursession;
            if (options.session) {
                console.log("session provided");
                cursession = options.session;
            }
            else {
                cursession = await mongoose.startSession();
                cursession.startTransaction();
            }
            try {
                let returnValue;
                returnValue = await fn(...fnArgs, {
                    ...options,
                    session: cursession,
                });
                if (!options.session) {
                    await cursession.commitTransaction();
                    cursession.endSession();
                }
                return returnValue;
            }
            catch (err) {
                if (!options.session) {
                    await cursession.abortTransaction();
                    cursession.endSession();
                }
                throw err;
            }
        }
        catch (err) {
            throw err;
        }
    };
};
//# sourceMappingURL=serviceTWrapper.js.map