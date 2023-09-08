import convertUnixTimestampTo12HourFormat from "./utils/convertUnixTimestamp.js";
import createForecastDisplayDates from "./utils/createForecastDisplayDates.js";
import removeAllElementChildren from "./utils/removeElementChildren.js";
import createDOMElement from "./utils/createDOMElement.js";
import processWeatherUnits from "./utils/processWeatherUnits.js";
import processWeatherCodes from "./utils/processWeatherCodes.js";

const forecastWeatherWrapper = document.querySelector("#forecast-weather-wrapper");

// Get local storage data
const locationName = localStorage.getItem("locationName");
const adminLevel1 = localStorage.getItem("adminLevel1");
const countryCode = localStorage.getItem("countryCode");
const lat = localStorage.getItem("currentLat");
const lon = localStorage.getItem("currentLon");

console.log("CURRENT LAT", lat);
console.log("CURRENT LON", lon);

console.log("ALL THE DATA", locationName, adminLevel1, countryCode)

// Fetch the forecast data for the current location
async function fetchForecastData(lat, lon) {
    removeAllElementChildren(forecastWeatherWrapper)
    // How many days of forecast weather to fetch (if changed, sortForecastWeatherData will have to be updated)
    const daysNum = 3;

    console.log(forecastWeatherWrapper, lat, lon, "all this is in forecast.html fetchForecastData function")

    // Hourly forecast endpoint for current location based on lat/lon of the "Current Weather"
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,apparent_temperature,precipitation_probability,weathercode,windspeed_10m,winddirection_10m&temperature_unit=fahrenheit&windspeed_unit=mph&precipitation_unit=inch&timezone=auto&timeformat=unixtime&forecast_days=${daysNum}`;

    fetch (url)
        .then (response => {
            // check response status
            if (!response.ok) {
                throw new Error ("Error fetching CURRENT weather data")
            }

            // Return promise
            return response.json()
        })

        .then (data => {
            sortForecastWeatherData(data)
            console.log(data)
        })

        .catch (error => {
            console.error("Error fetching FORECAST weather data:", error)
        })
}

if (lat !== null && lon !== null) {
    fetchForecastData(lat, lon);
}

// Sort the forecast data for the current location
function sortForecastWeatherData(data) {
    console.log(data)
    // Variables to hold each forecast day's weather
    let dayOne = [];
    let dayTwo = [];
    let dayThree = [];

    // Loop through and save one day's weather to the variables above
    for (let i = 0; i < 72; i++) {
        if (i <= 23) {
            dayOne.push({
                "apparent_temp": data.hourly.apparent_temperature[i],
                "precip_prob": data.hourly.precipitation_probability[i],
                "temp": data.hourly.temperature_2m[i],
                "weathercode": data.hourly.weathercode[i],
                "wind_direction": data.hourly.winddirection_10m[i],
                "windspeed": data.hourly.windspeed_10m[i],
                "time": data.hourly.time[i],
                "date": createForecastDisplayDates()[0]
            });
        }
        if (i > 23 && i <= 47) {
            dayTwo.push({
                "apparent_temp": data.hourly.apparent_temperature[i],
                "precip_prob": data.hourly.precipitation_probability[i],
                "temp": data.hourly.temperature_2m[i],
                "weathercode": data.hourly.weathercode[i],
                "wind_direction": data.hourly.winddirection_10m[i],
                "windspeed": data.hourly.windspeed_10m[i],
                "time": data.hourly.time[i],
                "date": createForecastDisplayDates()[1]
            });
        }
        if (i > 47 && i <= 71) {
            dayThree.push({
                "apparent_temp": data.hourly.apparent_temperature[i],
                "precip_prob": data.hourly.precipitation_probability[i],
                "temp": data.hourly.temperature_2m[i],
                "weathercode": data.hourly.weathercode[i],
                "wind_direction": data.hourly.winddirection_10m[i],
                "windspeed": data.hourly.windspeed_10m[i],
                "time": data.hourly.time[i],
                "date": createForecastDisplayDates()[2]
            });
        }
    }

    // Calculate the current day based on user's timezone offset
    const now = new Date();
    console.log("NOW", now)
    now.setSeconds(now.getSeconds() + data.utc_offset_seconds);

    // Calculate the current hour index based on the user's timezone offset
    const currentHourIndex = now.getUTCHours();

    dayOne = dayOne.filter((_, index) => index > currentHourIndex);
    const allForecastData = [dayOne, dayTwo, dayThree];

    // Clear the forecast wrapper before rendering (prevents the re-rendered data to be appended after the already present data)
    removeAllElementChildren(forecastWeatherWrapper);

    /* const forecastHeading = createDOMElement("h2", undefined, "3-Day Hourly Weather"); */

    // Create the location name from local storage data
    let currentLocationName;
    if (locationName !== null && adminLevel1 !== null) {
        currentLocationName = locationName + ", " + adminLevel1 + ", " + countryCode;
        console.log("adminLevel1 in BLOCK ONE" , adminLevel1)
        console.log("BLOCK ONE RAN")
    } else if (locationName !== null && adminLevel1 == null) {
        currentLocationName = locationName + ", " + countryCode;
        console.log("BLOCK TWO RAN")
    } else if (locationName == null && adminLevel1 !== null) {
        currentLocationName = adminLevel1;
        console.log("BLOCK THREE RAN")
    }

    const forecastHeading = createDOMElement("h2", "forecast-heading", currentLocationName);
    const forecastSubHeading = createDOMElement("span", "forecast-sub-heading", "3-Day Hourly Forecast");
    forecastWeatherWrapper.append(forecastHeading);
    forecastHeading.append(forecastSubHeading);

    // Render the forecast data
    allForecastData.forEach((dayData) => {
        renderForecastData(dayData, data.timezone) 
    })
}

// Render Forecast data to the DOM
function renderForecastData(dayData, timezone) {
    const forecastDayHeading = createDOMElement("h3", undefined, dayData[0].date); // Select the date from each "dayData" sent from sortForecastWeatherData
    const dayListsWrapper = createDOMElement("div", "forecast-day-wrapper");

    const properties = Object.keys(dayData);

    /* console.log("DAY DATA IN RENDER FORECAST", dayData) */

    properties.forEach((property) => {
        const newList = createDOMElement("ul", "hourly-list");
        // Add role of list (reset.css)
        newList.setAttribute("role", "list");
        const timeLi = createDOMElement("li", undefined, convertUnixTimestampTo12HourFormat(dayData[property].time, timezone));
        const tempLi = createDOMElement("li", undefined, processWeatherUnits("temp", dayData[property].temp));
        const weatherCodeLi = createDOMElement("li");
        const weatherCodeWrapper = createDOMElement("div", "forecast-code-wrapper");
        const weatherCodeIcon = createDOMElement("img", "icon-sm");
        weatherCodeIcon.setAttribute("src", "https://placehold.co/25x25");
        const weatherCodeData = createDOMElement("li", undefined, processWeatherCodes(dayData[property].weathercode));
        const apparentTempLi = createDOMElement("li");
        const apparentTempWrapper = createDOMElement("div", "apparent-temp-wrapper");
        const apparentTempIcon = createDOMElement("img", "icon-sm");
        apparentTempIcon.setAttribute("src", "https://placehold.co/25x25");
        const apparentTempDataCol = createDOMElement("div", "data-col");
        const apparentTempTitle = createDOMElement("span", "data-title", "Feels Like");
        const apparentTempData = createDOMElement("span", "data", processWeatherUnits("temp", dayData[property].apparent_temp));

        const windLi = createDOMElement("li");
        const windWrapper = createDOMElement("div", "wind-wrapper");
        const windIcon = createDOMElement("img", "icon-sm");
        windIcon.setAttribute("src", "https://placehold.co/25x25");
        const windDataCol = createDOMElement("div", "data-col");
        const windTitle = createDOMElement("span", "data-title", "Wind");
        const windData = createDOMElement("span", "data", processWeatherUnits("speed", dayData[property].windspeed));

        const precipProbLi = createDOMElement("li");
        const precipProbWrapper = createDOMElement("div", "precip-prob-wrapper");
        const precipProbIcon = createDOMElement("img", "icon-sm");
        precipProbIcon.setAttribute("src", "https://placehold.co/25x25");
        const precipProbDataCol = createDOMElement("div", "data-col");
        const precipProbTitle = createDOMElement("span", "data-title", "Precipitation");
        const precipProbData = createDOMElement("span", "data", processWeatherUnits("precipProb", dayData[property].precip_prob));

        weatherCodeLi.append(weatherCodeWrapper);
        weatherCodeWrapper.append(weatherCodeIcon);
        weatherCodeWrapper.append(weatherCodeData);

        apparentTempLi.append(apparentTempWrapper);
        apparentTempWrapper.append(apparentTempIcon);
        apparentTempWrapper.append(apparentTempDataCol);
        apparentTempDataCol.append(apparentTempTitle);
        apparentTempDataCol.append(apparentTempData);

        windLi.append(windWrapper);
        windWrapper.append(windIcon);
        windWrapper.append(windDataCol);
        windDataCol.append(windTitle);
        windDataCol.append(windData);

        precipProbLi.append(precipProbWrapper);
        precipProbWrapper.append(precipProbIcon);
        precipProbWrapper.append(precipProbDataCol);
        precipProbDataCol.append(precipProbTitle);
        precipProbDataCol.append(precipProbData)

        newList.append(timeLi);
        newList.append(tempLi);
        newList.append(weatherCodeLi);
        newList.append(apparentTempLi);
        newList.append(windLi);
        newList.append(precipProbLi);
        dayListsWrapper.append(newList)
    });

    forecastWeatherWrapper.append(forecastDayHeading);
    forecastWeatherWrapper.append(dayListsWrapper);
}