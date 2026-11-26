import mongoose from "mongoose";
const countrySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        index: true,
    },
});
const CountryModel = mongoose.model("countries", countrySchema);
export default CountryModel;
