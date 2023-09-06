function get12HourTimeInTimezone(timezone) {
    const date = new Date();

    const time = date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: timezone
    })

    return time;
}

export default get12HourTimeInTimezone;