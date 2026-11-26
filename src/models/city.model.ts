import mongoose from "mongoose";
const citySchema = new mongoose.Schema({
    countryName: {
        type: String,
        required: true,
        index: true,
    },
    stateName: {
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
const CityModel = mongoose.model("cities", citySchema);
export default CityModel;
