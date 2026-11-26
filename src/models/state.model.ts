import mongoose from "mongoose";
const stateSchema = new mongoose.Schema({
    countryName: {
        type: String,
        required: true,
        index: true,
    },
    name: {
        type: String,
        required: true,
        index: true,
    },
});
const StateModel = mongoose.model("states", stateSchema);
export default StateModel;
