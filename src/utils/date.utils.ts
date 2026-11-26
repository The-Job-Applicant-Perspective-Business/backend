export const getUsDateStringWithoutTime = (date) => {
    const usEastTime = date.toLocaleString("en-GB", {
        timeZone: "America/New_York",
    });
    // convert into yyyy-mm-dd format
    const dateString = usEastTime.split(",")[0].split("/").reverse().join("-");
    return dateString;
};
export const getHoursAndMinutes = (date) => {
    const dailyhour = date.getHours();
    const dailyminute = date.getMinutes();
    return { hour: dailyhour, min: dailyminute };
};
