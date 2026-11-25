import CountryModel from "../../models/country.model.js";
import CityModel from "../../models/city.model.js";
function escapeRegExp(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}
async function searchLocationController(req, res) {
    let { search, page, limit, country, select } = req.query;
    if (!search) {
        search = "a";
    }
    let [search1, search2] = search.split(",");
    search2 = search2 || "";
    search = escapeRegExp(search1.trim());
    search2 = escapeRegExp(search2.trim());
    const result = [];
    let data = [];
    if (search2) {
        // if it contains comma then search in cities only
        data = await CityModel.aggregate([
            {
                $match: {
                    name: { $regex: `^${search}.*`, $options: "i" },
                    stateName: { $regex: `^${search2}.*`, $options: "i" },
                    ...(country && { countryName: country }),
                },
            },
            {
                $skip: (page - 1) * limit,
            },
            {
                $limit: limit,
            },
        ]);
    }
    else {
        // if it does not contain comma then search in all
        const pipeline = [];
        // some conditions are repeated to handle the order of pipeline
        if (!country &&
            (select === undefined || select === "" || select === "country")) {
            pipeline.push({
                $match: {
                    name: { $regex: `^${search}.*`, $options: "i" },
                },
            });
        }
        else {
            // to avoid selecting country if select is not country
            pipeline.push({
                $match: {
                    name: "aaaaaaa",
                },
            });
        }
        if (select === undefined || select === "" || select === "state") {
            pipeline.push({
                $unionWith: {
                    coll: "states",
                    pipeline: [
                        {
                            $match: {
                                name: { $regex: `^${search}.*`, $options: "i" },
                                ...(country && { countryName: country }),
                            },
                        },
                    ],
                },
            });
        }
        if (select === undefined || select === "" || select === "city") {
            pipeline.push({
                $unionWith: {
                    coll: "cities",
                    pipeline: [
                        {
                            $match: {
                                name: { $regex: `^${search}.*`, $options: "i" },
                                ...(country && { countryName: country }),
                            },
                        },
                    ],
                },
            });
            pipeline.push({
                $unionWith: {
                    coll: "cities",
                    pipeline: [
                        {
                            $match: {
                                stateName: {
                                    $regex: `^${search}.*`,
                                    $options: "i",
                                },
                                ...(country && { countryName: country }),
                            },
                        },
                    ],
                },
            });
        }
        if ((select === undefined || select === "" || select === "state") &&
            !country) {
            pipeline.push({
                $unionWith: {
                    coll: "states",
                    pipeline: [
                        {
                            $match: {
                                countryName: {
                                    $regex: `^${search}.*`,
                                    $options: "i",
                                },
                            },
                        },
                    ],
                },
            });
        }
        data = await CountryModel.aggregate([
            ...pipeline,
            // {
            //     $match: {
            //         name: { $regex: `^${search}.*`, $options: "i" },
            //     },
            // },
            // {
            //     $unionWith: {
            //         coll: "states",
            //         pipeline: [
            //             {
            //                 $match: {
            //                     name: { $regex: `^${search}.*`, $options: "i" },
            //                 },
            //             },
            //         ],
            //     },
            // },
            // {
            //     $unionWith: {
            //         coll: "cities",
            //         pipeline: [
            //             {
            //                 $match: {
            //                     name: { $regex: `^${search}.*`, $options: "i" },
            //                 },
            //             },
            //         ],
            //     },
            // },
            // {
            //     $unionWith: {
            //         coll: "cities",
            //         pipeline: [
            //             {
            //                 $match: {
            //                     stateName: {
            //                         $regex: `^${search}.*`,
            //                         $options: "i",
            //                     },
            //                 },
            //             },
            //         ],
            //     },
            // },
            // {
            //     $unionWith: {
            //         coll: "states",
            //         pipeline: [
            //             {
            //                 $match: {
            //                     countryName: {
            //                         $regex: `^${search}.*`,
            //                         $options: "i",
            //                     },
            //                 },
            //             },
            //         ],
            //     },
            // },
            {
                $skip: (page - 1) * limit,
            },
            {
                $limit: limit,
            },
        ]);
    }
    data.forEach((item) => {
        if (item.stateName) {
            result.push(`${item.name}, ${item.stateName}`);
        }
        else {
            result.push(item.name);
        }
    });
    return res.json({
        success: true,
        data: result,
        message: "Locations fetched successfully",
    });
}
export { searchLocationController };
//# sourceMappingURL=location.controller.js.map