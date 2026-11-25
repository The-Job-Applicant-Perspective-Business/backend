const expressWrapper = (fn) => {
    return async (req, res, next) => {
        try {
            await fn(req, res, next);
        }
        catch (err) {
            next(err);
            // return res.status(500).json({
            //   success: false,
            //   message: err.message,
            //   data: null,
            // });
        }
    };
};
export default expressWrapper;
//# sourceMappingURL=expressWrapper.js.map