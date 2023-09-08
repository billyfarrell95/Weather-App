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

// Fetch the forecast data for the current location
async function fetchForecastData(lat, lon) {
    removeAllElementChildren(forecastWeatherWrapper)
    // How many days of forecast weather to fetch (if changed, sortForecastWeatherData will have to be updated)
    /* const daysNum = 3; */

    console.log(forecastWeatherWrapper, lat, lon, "all this is in forecast.html fetchForecastData function")

    // Hourly forecast endpoint for current location based on lat/lon of the "Current Weather"
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weathercode,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,windspeed_10m_max,winddirection_10m_dominant&temperature_unit=fahrenheit&windspeed_unit=mph&precipitation_unit=inch&timeformat=unixtime&timezone=auto`;

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
            sortDailyForecastData(data)
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
function sortDailyForecastData(data) {
    console.log(data)
    // Variables to hold each forecast day's weather
    let dayOne = [];
    let dayTwo = [];
    let dayThree = [];
    let dayFour = [];
    let dayFive = [];
    let daySix = [];
    let daySeven = [];

    // Loop through and save one day's weather to the variables above
     // Loop through and save one day's weather to the variables above
     for (let i = 0; i < 7; i++) {
        if (i == 0) {
            dayOne.push({
                "apparent_temp_max": data.daily.apparent_temperature_max[i],
                "apparent_temp_min": data.daily.apparent_temperature_min[i],
                "precip_sum": data.daily.precipitation_sum[i],
                "sunrise": data.daily.sunrise[i],
                "sunset": data.daily.sunset[i],
                "temp_max": data.daily.temperature_2m_max[i],
                "temp_min": data.daily.temperature_2m_min[i],
                "uv_index_max": data.daily.uv_index_max[i],
                "weathercode": data.daily.weathercode[i],
                "winddirection_dominant": data.daily.winddirection_10m_dominant[i],
                "windspeed_max": data.daily.windspeed_10m_max[i],
                "time": data.daily.time[i],
                "date": createForecastDisplayDates()[0]
            });
        }
        if (i == 1) {
            dayTwo.push({
                "apparent_temp_max": data.daily.apparent_temperature_max[i],
                "apparent_temp_min": data.daily.apparent_temperature_min[i],
                "precip_sum": data.daily.precipitation_sum[i],
                "sunrise": data.daily.sunrise[i],
                "sunset": data.daily.sunset[i],
                "temp_max": data.daily.temperature_2m_max[i],
                "temp_min": data.daily.temperature_2m_min[i],
                "uv_index_max": data.daily.uv_index_max[i],
                "weathercode": data.daily.weathercode[i],
                "winddirection_dominant": data.daily.winddirection_10m_dominant[i],
                "windspeed_max": data.daily.windspeed_10m_max[i],
                "time": data.daily.time[i],
                "date": createForecastDisplayDates()[0]
            });
        }
        if (i == 2) {
            dayThree.push({
                "apparent_temp_max": data.daily.apparent_temperature_max[i],
                "apparent_temp_min": data.daily.apparent_temperature_min[i],
                "precip_sum": data.daily.precipitation_sum[i],
                "sunrise": data.daily.sunrise[i],
                "sunset": data.daily.sunset[i],
                "temp_max": data.daily.temperature_2m_max[i],
                "temp_min": data.daily.temperature_2m_min[i],
                "uv_index_max": data.daily.uv_index_max[i],
                "weathercode": data.daily.weathercode[i],
                "winddirection_dominant": data.daily.winddirection_10m_dominant[i],
                "windspeed_max": data.daily.windspeed_10m_max[i],
                "time": data.daily.time[i],
                "date": createForecastDisplayDates()[0]
            });
        }
        if (i == 3) {
            dayFour.push({
                "apparent_temp_max": data.daily.apparent_temperature_max[i],
                "apparent_temp_min": data.daily.apparent_temperature_min[i],
                "precip_sum": data.daily.precipitation_sum[i],
                "sunrise": data.daily.sunrise[i],
                "sunset": data.daily.sunset[i],
                "temp_max": data.daily.temperature_2m_max[i],
                "temp_min": data.daily.temperature_2m_min[i],
                "uv_index_max": data.daily.uv_index_max[i],
                "weathercode": data.daily.weathercode[i],
                "winddirection_dominant": data.daily.winddirection_10m_dominant[i],
                "windspeed_max": data.daily.windspeed_10m_max[i],
                "time": data.daily.time[i],
                "date": createForecastDisplayDates()[0]
            });
        }
        if (i == 4) {
            dayFive.push({
                "apparent_temp_max": data.daily.apparent_temperature_max[i],
                "apparent_temp_min": data.daily.apparent_temperature_min[i],
                "precip_sum": data.daily.precipitation_sum[i],
                "sunrise": data.daily.sunrise[i],
                "sunset": data.daily.sunset[i],
                "temp_max": data.daily.temperature_2m_max[i],
                "temp_min": data.daily.temperature_2m_min[i],
                "uv_index_max": data.daily.uv_index_max[i],
                "weathercode": data.daily.weathercode[i],
                "winddirection_dominant": data.daily.winddirection_10m_dominant[i],
                "windspeed_max": data.daily.windspeed_10m_max[i],
                "time": data.daily.time[i],
                "date": createForecastDisplayDates()[0]
            });
        }
        if (i == 5) {
            daySix.push({
                "apparent_temp_max": data.daily.apparent_temperature_max[i],
                "apparent_temp_min": data.daily.apparent_temperature_min[i],
                "precip_sum": data.daily.precipitation_sum[i],
                "sunrise": data.daily.sunrise[i],
                "sunset": data.daily.sunset[i],
                "temp_max": data.daily.temperature_2m_max[i],
                "temp_min": data.daily.temperature_2m_min[i],
                "uv_index_max": data.daily.uv_index_max[i],
                "weathercode": data.daily.weathercode[i],
                "winddirection_dominant": data.daily.winddirection_10m_dominant[i],
                "windspeed_max": data.daily.windspeed_10m_max[i],
                "time": data.daily.time[i],
                "date": createForecastDisplayDates()[0]
            });
        }
        if (i == 6) {
            daySeven.push({
                "apparent_temp_max": data.daily.apparent_temperature_max[i],
                "apparent_temp_min": data.daily.apparent_temperature_min[i],
                "precip_sum": data.daily.precipitation_sum[i],
                "sunrise": data.daily.sunrise[i],
                "sunset": data.daily.sunset[i],
                "temp_max": data.daily.temperature_2m_max[i],
                "temp_min": data.daily.temperature_2m_min[i],
                "uv_index_max": data.daily.uv_index_max[i],
                "weathercode": data.daily.weathercode[i],
                "winddirection_dominant": data.daily.winddirection_10m_dominant[i],
                "windspeed_max": data.daily.windspeed_10m_max[i],
                "time": data.daily.time[i],
                "date": createForecastDisplayDates()[0]
            });
        }
    }

    const allForecastData = [dayOne, dayTwo, dayThree, dayFour, dayFive, daySix, daySeven]
    

    // Calculate the current day based on user's timezone offset
    const now = new Date();
    console.log("NOW", now)
    now.setSeconds(now.getSeconds() + data.utc_offset_seconds);

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

    console.log("all forecast data", allForecastData)
    // Render the forecast data
    allForecastData.forEach((dayData) => {
        /* renderDailyForecast(dayData, data.timezone)  */
        renderDailyForecast(dayData) 
    })
}

// Render Forecast data to the DOM
function renderDailyForecast(data) {
    const forecastDayHeading = createDOMElement("h3", undefined, data.date);// Select the date from each "dayData" sent from sortForecastWeatherData
    const dayWrapper = createDOMElement("div", "forecast-day-wrapper");


    console.log("DAY DATA IN RENDER FORECAST", data)
    /* console.log(properties) */

    const properties = Object.keys(data);

    properties.forEach((property) => {
        console.log(data[property])
    })

    forecastWeatherWrapper.append(forecastDayHeading);
    forecastWeatherWrapper.append(dayWrapper);
}