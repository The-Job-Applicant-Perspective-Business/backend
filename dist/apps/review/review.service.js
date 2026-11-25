function reviewFilterQueryGenerator({ companyId, search, jobTitle, 
// jobType,
rating, datePosted, status, }) {
    let query = {};
    if (companyId) {
        query = {
            ...query,
            company: companyId,
        };
    }
    // if (search) {
    //     query = {
    //         ...query,
    //         $or: [
    //             { title: { $regex: search, $options: "i" } },
    //             { description: { $regex: search, $options: "i" } },
    //         ],
    //     };
    // }
    if (search) {
        query = {
            ...query,
            jobTitle: { $regex: search, $options: "i" },
        };
    }
    // if (jobTitle) {
    //     query = {
    //         ...query,
    //         jobTitle: jobTitle,
    //     };
    // }
    // if (jobType) {
    //     query = {
    //         ...query,
    //         jobType: jobType,
    //     };
    // }
    if (rating) {
        query = {
            ...query,
            rating: { $gte: rating },
        };
    }
    if (datePosted) {
        switch (datePosted) {
            case "last-24-hours":
                query = {
                    ...query,
                    createdAt: {
                        $gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
                    },
                };
                break;
            case "last-3-days":
                query = {
                    ...query,
                    createdAt: {
                        $gte: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                    },
                };
                break;
            case "last-7-days":
                query = {
                    ...query,
                    createdAt: {
                        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                    },
                };
                break;
            case "last-30-days":
                query = {
                    ...query,
                    createdAt: {
                        $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    },
                };
                break;
            default:
                break;
        }
    }
    if (status) {
        query = {
            ...query,
            status: { $in: status },
            // status.includes(RSE.PENDING) || status.includes(RSE.PENDING_NEW_COMPANY)
            //     ? status
            //     : { $in: [RSE.PENDING, RSE.PENDING_NEW_COMPANY] },
        };
    }
    return query;
}
export { reviewFilterQueryGenerator };
//# sourceMappingURL=review.service.js.map