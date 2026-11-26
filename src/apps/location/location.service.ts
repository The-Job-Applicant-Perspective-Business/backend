import CountryModel from "../../models/country.model.js";
import StateModel from "../../models/state.model.js";
import CityModel from "../../models/city.model.js";
async function getLocationData(location) {
    const locationArray = location.split(",");
    const location1 = locationArray[0].trim();
    const location2 = locationArray[1]?.trim();
    if (location2) {
        const city = await CityModel.findOne({
            name: location1,
            stateName: location2,
        });
        if (city) {
            return {
                country: city.countryName,
                state: city.stateName,
                city: city.name,
            };
        }
    }
    else {
        const state = await StateModel.findOne({ name: location1 });
        if (state) {
            return {
                country: state.countryName,
                state: state.name,
                city: undefined,
            };
        }
        const country = await CountryModel.findOne({ name: location1 });
        if (country) {
            return {
                country: country.name,
                state: undefined,
                city: undefined,
            };
        }
    }
    return null;
}
export { getLocationData };
