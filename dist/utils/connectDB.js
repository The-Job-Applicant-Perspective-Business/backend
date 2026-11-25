import mongoose from "mongoose";
// const connectDB = (mongo_uri: string) => {
//     // console.log(process.env.MONGOURL_PROD);
//     process.env.MONGO_URI;
//     mongoose.set("strictQuery", true);
//     mongoose
//         .connect(mongo_uri || "", {} as ConnectOptions)
//         .then(() => {
//             console.log("MongoDB Connected...");
//         })
//         .catch((err) => {
//             throw err;
//         });
// };
const connectDB = async (mongo_uri) => {
    // console.log(process.env.MONGOURL_PROD);
    mongoose.set("strictQuery", true);
    await mongoose.connect(mongo_uri || "", {});
    console.log("MongoDB Connected...");
};
// export { connectDBSync };
export default connectDB;
//# sourceMappingURL=connectDB.js.map