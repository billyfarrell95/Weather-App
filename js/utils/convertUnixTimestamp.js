function convertUnixTimestampTo12HourFormat(unixTimestamp, timezone) {
    // Create a new Date object from the Unix timestamp (in milliseconds)
    const date = new Date(unixTimestamp * 1000);
    /* console.log(timezone) */
    // Format time
    const formattedTime = date.toLocaleString("en-US", {
        hour: "numeric",
        hour12: true,
        timeZone: timezone, // the timezone of the location the user is viewing (pulled from the API response)

    });

    const finalFormattedTime = formattedTime;
    return finalFormattedTime.replace(" ", "");
}

export default convertUnixTimestampTo12HourFormat;