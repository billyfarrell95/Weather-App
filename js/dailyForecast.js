import createForecastDisplayDates from "./utils/createForecastDisplayDates.js";
import removeAllElementChildren from "./utils/removeElementChildren.js";
import createDOMElement from "./utils/createDOMElement.js";
import processWeatherUnits from "./utils/processWeatherUnits.js";
import processWeatherCodes from "./utils/processWeatherCodes.js";
import convertWindDirection from "./utils/convertWindDirection.js";
import processWeatherCodeIcon from "./utils/processWeatherCodeIcon.js";
import createLoadingElement from "./utils/createLoadingElement.js";
import createErrorMessage from "./utils/createErrorMessage.js";

const forecastWeatherWrapper = document.querySelector("#forecast-weather-wrapper");

const fullLocationName = sessionStorage.getItem("fullLocationName");
const lat = sessionStorage.getItem("currentLat");
const lon = sessionStorage.getItem("currentLon");

document.addEventListener("DOMContentLoaded", () => {
    const loading = createLoadingElement();
    forecastWeatherWrapper.append(loading);
    if (lat !== null && lon !== null) {
        fetchForecastData(lat, lon);
    }
})

// Scroll to top button/functionality
const backToTopButton = document.getElementById("back-to-top");

window.onscroll = function() {
    topTopScrollHandler();
};

backToTopButton.addEventListener("click", () => {
    scrollToTop();
})

function scrollToTop() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
};

function topTopScrollHandler() {
    if (document.body.scrollTop > 1200 || document.documentElement.scrollTop > 1200) {
        backToTopButton.classList.remove("hidden");
    } else {
        setTimeout(()=> {
            backToTopButton.classList.add("hidden")
        }, 100)
    }
};

// Get local storage data
/* const fullLocationName = sessionStorage.getItem("fullLocationName");
const lat = sessionStorage.getItem("currentLat");
const lon = sessionStorage.getItem("currentLon"); */

console.log("CURRENT LAT", lat);
console.log("CURRENT LON", lon);

// Fetch the forecast data for the current location
async function fetchForecastData(lat, lon) {
    // Hourly forecast endpoint for current location based on lat/lon of the "Current Weather"
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weathercode,precipitation_probability_max,temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_sum,windspeed_10m_max,windgusts_10m_max,winddirection_10m_dominant&temperature_unit=fahrenheit&windspeed_unit=mph&precipitation_unit=inch&timeformat=unixtime&timezone=auto`;

    fetch (url)
        .then (response => {
            // check response status
            if (!response.ok) {
                const errorMessage = createErrorMessage("weather", "fetchFailed");
                removeAllElementChildren(forecastWeatherWrapper);
                forecastWeatherWrapper.append(errorMessage.element);
                throw new Error(errorMessage.errorMessage);
            }

            // Return promise
            return response.json()
        })

        .then (data => {
            console.log(data)
            // Validate that data exists and data types before sorting/rendering
            if (data && data.daily.precipitation_probability_max.length == 7 && data.daily.precipitation_sum.length == 7 && data.daily.temperature_2m_max.length == 7 && data.daily.temperature_2m_min.length == 7 && data.daily.uv_index_max.length == 7 && data.daily.weathercode.length == 7 && data.daily.winddirection_10m_dominant.length == 7 && data.daily.windgusts_10m_max.length == 7 && data.daily.windspeed_10m_max.length == 7) {
                console.log(data)
                sortDailyForecastData(data)
            } else {
                const errorMessage = createErrorMessage("weather", "dataInvalid");
                removeAllElementChildren(forecastWeatherWrapper);
                forecastWeatherWrapper.append(errorMessage.element);
                throw new Error(errorMessage.errorMessage);
            }
        })

        .catch (error => {
            console.error(error)
        })
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
                "precip_sum": data.daily.precipitation_sum[i],
                "precip_prob_max": data.daily.precipitation_probability_max[i],
                "temp_max": data.daily.temperature_2m_max[i],
                "temp_min": data.daily.temperature_2m_min[i],
                "uv_index_max": data.daily.uv_index_max[i],
                "weathercode": data.daily.weathercode[i],
                "winddirection_dominant": data.daily.winddirection_10m_dominant[i],
                "windspeed_max": data.daily.windspeed_10m_max[i],
                "windgusts_max": data.daily.windgusts_10m_max[i],
                "date": createForecastDisplayDates()[i]
            });
        }
        if (i == 1) {
            dayTwo.push({
                "precip_sum": data.daily.precipitation_sum[i],
                "precip_prob_max": data.daily.precipitation_probability_max[i],
                "temp_max": data.daily.temperature_2m_max[i],
                "temp_min": data.daily.temperature_2m_min[i],
                "uv_index_max": data.daily.uv_index_max[i],
                "weathercode": data.daily.weathercode[i],
                "winddirection_dominant": data.daily.winddirection_10m_dominant[i],
                "windspeed_max": data.daily.windspeed_10m_max[i],
                "windgusts_max": data.daily.windgusts_10m_max[i],
                "date": createForecastDisplayDates()[i]
            });
        }
        if (i == 2) {
            dayThree.push({
                "precip_sum": data.daily.precipitation_sum[i],
                "precip_prob_max": data.daily.precipitation_probability_max[i],
                "temp_max": data.daily.temperature_2m_max[i],
                "temp_min": data.daily.temperature_2m_min[i],
                "uv_index_max": data.daily.uv_index_max[i],
                "weathercode": data.daily.weathercode[i],
                "winddirection_dominant": data.daily.winddirection_10m_dominant[i],
                "windspeed_max": data.daily.windspeed_10m_max[i],
                "windgusts_max": data.daily.windgusts_10m_max[i],
                "date": createForecastDisplayDates()[i]
            });
        }
        if (i == 3) {
            dayFour.push({
                "precip_sum": data.daily.precipitation_sum[i],
                "precip_prob_max": data.daily.precipitation_probability_max[i],
                "temp_max": data.daily.temperature_2m_max[i],
                "temp_min": data.daily.temperature_2m_min[i],
                "uv_index_max": data.daily.uv_index_max[i],
                "weathercode": data.daily.weathercode[i],
                "winddirection_dominant": data.daily.winddirection_10m_dominant[i],
                "windspeed_max": data.daily.windspeed_10m_max[i],
                "windgusts_max": data.daily.windgusts_10m_max[i],
                "date": createForecastDisplayDates()[i]
            });
        }
        if (i == 4) {
            dayFive.push({
                "precip_sum": data.daily.precipitation_sum[i],
                "precip_prob_max": data.daily.precipitation_probability_max[i],
                "temp_max": data.daily.temperature_2m_max[i],
                "temp_min": data.daily.temperature_2m_min[i],
                "uv_index_max": data.daily.uv_index_max[i],
                "weathercode": data.daily.weathercode[i],
                "winddirection_dominant": data.daily.winddirection_10m_dominant[i],
                "windspeed_max": data.daily.windspeed_10m_max[i],
                "windgusts_max": data.daily.windgusts_10m_max[i],
                "date": createForecastDisplayDates()[i]
            });
        }
        if (i == 5) {
            daySix.push({
                "precip_sum": data.daily.precipitation_sum[i],
                "precip_prob_max": data.daily.precipitation_probability_max[i],
                "temp_max": data.daily.temperature_2m_max[i],
                "temp_min": data.daily.temperature_2m_min[i],
                "uv_index_max": data.daily.uv_index_max[i],
                "weathercode": data.daily.weathercode[i],
                "winddirection_dominant": data.daily.winddirection_10m_dominant[i],
                "windspeed_max": data.daily.windspeed_10m_max[i],
                "windgusts_max": data.daily.windgusts_10m_max[i],
                "date": createForecastDisplayDates()[i]
            });
        }
        if (i == 6) {
            daySeven.push({
                "precip_sum": data.daily.precipitation_sum[i],
                "precip_prob_max": data.daily.precipitation_probability_max[i],
                "temp_max": data.daily.temperature_2m_max[i],
                "temp_min": data.daily.temperature_2m_min[i],
                "uv_index_max": data.daily.uv_index_max[i],
                "weathercode": data.daily.weathercode[i],
                "winddirection_dominant": data.daily.winddirection_10m_dominant[i],
                "windspeed_max": data.daily.windspeed_10m_max[i],
                "windgusts_max": data.daily.windgusts_10m_max[i],
                "date": createForecastDisplayDates()[i]
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

    const forecastHeading = createDOMElement("h1", "forecast-heading", fullLocationName);
    const forecastSubHeading = createDOMElement("span", "forecast-sub-heading", "7-Day Forecast");
    forecastHeading.append(forecastSubHeading);
    forecastWeatherWrapper.append(forecastHeading);
    
    console.log("all forecast data", allForecastData)
    // Render the forecast data
    allForecastData.forEach((dayData) => {
        renderDailyForecast(dayData) 
    })
}

// Render Forecast data to the DOM
function renderDailyForecast(data) {
    document.title = `${fullLocationName} | Daily Forecast`;

    const dayWrapper = createDOMElement("div", "forecast-day-wrapper");

    // UI Layout Elements
    const colsWrapper = createDOMElement("div", "day-data")
    const leftCol = createDOMElement("div", "col");
    const rightCol = createDOMElement("div", "col");
    const tempWrapper = createDOMElement("div", "temp-wrapper");
    const highLowWrapper = createDOMElement("div", "high-low-wrapper");

    // Data Elements
    const date = createDOMElement("h3", "daily-forecast-heading", data[0].date);
    const icon = createDOMElement("img", "icon-lg");
    icon.setAttribute("src", processWeatherCodeIcon(data[0].weathercode))
    const dayHighData = createDOMElement("p", "forecast-temp high", `${processWeatherUnits("temp", data[0].temp_max)} `);
    const dayHighTitle = createDOMElement("span", "title", "High");
    const dayLowData = createDOMElement("p", "forecast-temp low", `${processWeatherUnits("temp", data[0].temp_min)} `);
    const dayLowTitle = createDOMElement("span", "title", "Low");
    const weathercode = createDOMElement("p", "weathercode", processWeatherCodes(data[0].weathercode));
    const UVWrapper = createDOMElement("div", "data-row", "UV Index Max");
    const UVData = createDOMElement("p", undefined, processWeatherUnits("uv", data[0].uv_index_max));
    const precipSumWrapper = createDOMElement("div", "data-row", "Precipitation");
    const precipSumData = createDOMElement("p", undefined, processWeatherUnits("precipSum", data[0].precip_sum))
    const precipProbWrapper = createDOMElement("div", "data-row", "Precipitation Probability");
    const precipProbData = createDOMElement("p", undefined, processWeatherUnits("precipProb", data[0].precip_prob_max))
    const windWrapper = createDOMElement("div", "data-row", "Wind");
    const windData = createDOMElement("p", undefined, `${convertWindDirection(data[0].winddirection_dominant)} ${processWeatherUnits("speed", data[0].windspeed_max)}`);
    const windGustWrapper = createDOMElement("div", "data-row", "Wind Gusts");
    const windGustData = createDOMElement("p", undefined, processWeatherUnits("speed", data[0].windgusts_max));

    dayWrapper.append(date);

    dayWrapper.append(colsWrapper);
    colsWrapper.append(leftCol);
    colsWrapper.append(rightCol);

    leftCol.append(tempWrapper);
    tempWrapper.append(icon);
    tempWrapper.append(highLowWrapper);
    highLowWrapper.append(dayHighData);
    dayHighData.append(dayHighTitle);
    highLowWrapper.append(dayLowData);
    dayLowData.append(dayLowTitle);
    leftCol.append(weathercode);

    rightCol.append(UVWrapper);
    UVWrapper.append(UVData);
    rightCol.append(precipSumWrapper);
    precipSumWrapper.append(precipSumData);
    rightCol.append(precipProbWrapper);
    precipProbWrapper.append(precipProbData);
    rightCol.append(windWrapper);
    windWrapper.append(windData);
    rightCol.append(windGustWrapper);
    windGustWrapper.append(windGustData);

    forecastWeatherWrapper.append(date);
    forecastWeatherWrapper.append(dayWrapper);
}