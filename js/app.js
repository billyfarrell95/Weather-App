import removeAllElementChildren from "./utils/removeElementChildren.js";
import get12HourTimeInTimezone from "./utils/get12HourTimeInTimezone.js";
import processGeocodingLocationName from "./utils/processGeocodingLocationName.js";
import processGeocodingAdminLevel1 from "./utils/processGeocodingAdminLevel1.js";
import createDOMElement from "./utils/createDOMElement.js";
import processWeatherCodes from "./utils/processWeatherCodes.js";
import convertWindDirection from "./utils/convertWindDirection.js";
import processWeatherUnits from "./utils/processWeatherUnits.js";
import convertUnixTimestampTo12HourFormat from "./utils/convertUnixTimestamp.js";
import processWeatherCodeIcon from "./utils/processWeatherCodeIcon.js";

// Select UI Elements
const searchInputField = document.querySelector("#search-input");
const searchResultsWrapper = document.querySelector("#search-results-wrapper");
const searchResultsList = document.querySelector("#search-results-list");
const currentWeatherWrapper = document.querySelector("#current-weather-wrapper");
const useCurrentLocationButton = document.querySelector("#current-location-button");
const quickSearchButtonsWrapper = document.querySelector("#quick-search-buttons"); // The element that holds the quick search buttons
/* const forecastWeatherWrapper = document.querySelector("#forecast-weather-wrapper"); */

document.addEventListener("DOMContentLoaded", () => {
    fetchQuickSearchButtonData();
    if (localStorage.length > 0) {
        console.log("LOCAL STORAGE DATA", localStorage);
        const fullLocationName = localStorage.getItem("fullLocationName");
        const locationName = localStorage.getItem("locationName");
        const adminLevel1 = localStorage.getItem("adminLevel1");
        const countryCode = localStorage.getItem("countryCode")
        const lat = localStorage.getItem("currentLat");
        const lon = localStorage.getItem("currentLon");
        fetchCurrentWeather(locationName, adminLevel1, countryCode, lat, lon, fullLocationName);
    }
})

// Handle showing and hiding the search results when the field is/isn't active
document.addEventListener("click", () => {
    if (document.activeElement == searchInputField) {
        /* console.log("input wrapper is active"); */
        searchResultsWrapper.style.visibility = "visible";
    } else {
        /* console.log("input wrapper not active") */
        searchResultsWrapper.style.visibility = "hidden"
    }
});

// Clear search results list when field is focused if it has an empty value
searchInputField.addEventListener("focus", () => {
    if (searchInputField.value.trim() === 0) {
        removeAllElementChildren(searchResultsList)
    }
});

// Search input event listener
searchInputField.addEventListener("keyup", () => {
    // Empty string or 1 character returns empty result. 2 characters will match exact location. 3 or more characters will perform fuzzy matching
    if (searchInputField.value.length >= 2) {
        // Remove whitespace from search value
        const userInput = searchInputField.value.trim();
        
        fetchSearchResults(userInput);
    }

    if (searchInputField.value.length < 2) {
        removeAllElementChildren(searchResultsList);
    }
})

// useCurrentLocationButton event listener
useCurrentLocationButton.addEventListener("click", () => {
    removeAllElementChildren(currentWeatherWrapper);
    requestUserLocation();
})

// Request user location
function requestUserLocation() {
    const userLocation = navigator.geolocation.getCurrentPosition(userLocationSuccess, userLocationDenied);
}

// User location request success
function userLocationSuccess(position) {
    /* console.log(position)
    console.log(position.coords.latitude, position.coords.longitude); */
    reverseGeocode(position.coords.latitude, position.coords.longitude);
}

// User location request failed
function userLocationDenied(error) {
    console.log(error);
    console.log(error.message)
}

// Fetch location name based on coordinates retrieved from navigator API (useCurrentLocationButton)
async function reverseGeocode(lat, lon) {
    const OPEN_CAGE_API_KEY = "9ce86e2baa8049d69415d979fd71cb69";
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${OPEN_CAGE_API_KEY}`;
    fetch (url)
        .then(response => {
            // check response status
            if (!response.ok) { 
                throw new Error ("Error fetching Open Cage Data")
            }

            // Return promise
            return response.json();
        })

        .then (data => {
            // Check if results were returned
            /* console.log(data.results[0].components, "GEOCODE DATA FROM reverseGeocode") */
            const locationName = processGeocodingLocationName(data.results[0].components); // the pair of the first key that matches the requirements is returned   
            const adminLevel1 = processGeocodingAdminLevel1(data.results[0].components); // the pair of the first key that matches the requirements is returned   
            const countryCode = data.results[0].components.country_code.toUpperCase(); // country code

            /* console.log("DATA IN REVERSE GEOCODE", data) */
            fetchCurrentWeather(locationName, adminLevel1, countryCode, lat, lon)
        })

        .catch (error => {
            console.error(error);
        })
}

// Geocoding/fetch search results
async function fetchSearchResults(userInput) {
    // Endpoint URL and and parameters
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${userInput}&count=10&language=en&format=json`;

    fetch(url)
        .then (response => {
            // check response status
            if (!response.ok) {
                throw new Error ("Error fetching search results")
            }

            // Return promise
            return response.json()
        })
        
        .then (data => {    
            // Check if results were returned before trying to display them
            if (data?.results?.length) {
                /* console.log("Search results response data:", data); */
                displaySearchResults(data)
            } else {
                // If there are no search results clear container (this prevents previous results from showing if characters that don't match are added to search string)
                removeAllElementChildren(searchResultsList);
            }
        })

        .catch (error => {
            console.error("Error fetching search results", error)
        })
} 

// Handle displaying/updating search results
function displaySearchResults(data) {
    // Clear search results and re-render everytime function is called (keyup)
    removeAllElementChildren(searchResultsList);

    // Loop through results
    for (let i = 0; i < data.results.length; i++) {
        /* console.log(data, "data in display search results") */
        const newResultLi = document.createElement("li"); // New search result item
        newResultLi.setAttribute("tabindex", i)
        /* console.log(data.results[i]) */
        const locationName = data.results[i].name; // Select the location name and pass to fetchCurrentWeather
        const adminLevel1 = data.results[i].admin1; // Select the 1st hierarchical admin area (state, etc)
        const countryCode = data.results[i].country_code; // Country code
        /* console.log("ADMIN LEVEL 1", adminLevel1) */
        const lat = data.results[i].latitude;
        const lon = data.results[i].longitude;

        // Add click event listener to each search result. On click, pass the corresponding item to fetch
        newResultLi.addEventListener("click", () => {
            /* fetchCurrentWeather(newResult) */
            fetchCurrentWeather(locationName, adminLevel1, countryCode, lat, lon);
        })

        // Check for values returned as "undefined", if so, exclude from search result text
        if (locationName !== undefined) {
            newResultLi.textContent += locationName + ", ";
        }

        if (adminLevel1 !== undefined) {
            newResultLi.textContent += adminLevel1 + ", ";
        }

        if (countryCode !== undefined) {
            newResultLi.textContent += countryCode;
        }

        searchResultsList.append(newResultLi)
    }
}

// Get current weather data
async function fetchCurrentWeather(locationName, adminLevel1, countryCode, lat, lon) {
    console.log(locationName, "admin in fetchCurrentWeather")
    // Defined and check the result name for undefined values 
    let selectedResultName = localStorage.getItem("fullLocationName")
    
    if (locationName !== undefined && locationName !== "undefined" && adminLevel1 !== undefined && adminLevel1 !== "undefined") {
        selectedResultName = locationName + ", " + adminLevel1 + ", " + countryCode;
    } else if (locationName !== undefined && locationName !== "undefined") {
        selectedResultName = locationName + ", " + countryCode;
    } else if (adminLevel1 !== undefined && adminLevel1 !== "undefined") {
        selectedResultName = adminLevel1;
    }

    localStorage.clear();
    // Name to be displayed on forecast page
    localStorage.setItem("fullLocationName", selectedResultName);
    // Data to be re-used when navigating back/re-fetching weather 
    localStorage.setItem("locationName", locationName)   
    localStorage.setItem("adminLevel1", adminLevel1);
    localStorage.setItem("countryCode", countryCode);
    localStorage.setItem("currentLat", lat);
    localStorage.setItem("currentLon", lon);

    // Current weather data endpoint URL -- same as the quick search weather endpoint. Two days fetched for the 24 hour temperature display
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,weathercode&daily=weathercode,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,uv_index_max,precipitation_sum,precipitation_probability_max&&current_weather=true&temperature_unit=fahrenheit&windspeed_unit=mph&precipitation_unit=inch&timeformat=unixtime&forecast_days=2&timezone=auto`
    
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
            console.log("CURRENT Weather response data:", data);
            removeAllElementChildren(searchResultsList);
            removeAllElementChildren(currentWeatherWrapper);
            /* removeAllElementChildren(forecastWeatherWrapper); */
            searchInputField.value = "";
            renderCurrentWeather(data, selectedResultName, data.latitude, data.longitude);
            fetchQuickSearchButtonData();
        })

        .catch (error => {
            console.error("Error fetching CURRENT weather data:", error)
        })
}

// Get current weather data (current and today's weather)
async function fetchQuickSearchWeather(locationName, adminLevel1, countryCode, lat, lon) {
    // Defined and check the result name for undefined values 
    let selectedResultName;

    if (locationName !== undefined && locationName !== "undefined" && adminLevel1 !== undefined && adminLevel1 !== "undefined") {
        selectedResultName = locationName + ", " + adminLevel1 + ", " + countryCode;
    } else if (locationName !== undefined && locationName !== "undefined") {
        selectedResultName = locationName + ", " + countryCode;
    } else if (adminLevel1 !== undefined && adminLevel1 !== "undefined") {
        selectedResultName = adminLevel1;
    }
    localStorage.clear();
    // Name to be displayed on forecast page
    localStorage.setItem("fullLocationName", selectedResultName);
    // Data to be re-used when navigating back/re-fetching weather 
    localStorage.setItem("locationName", locationName)   
    localStorage.setItem("adminLevel1", adminLevel1);
    localStorage.setItem("countryCode", countryCode);
    localStorage.setItem("currentLat", lat);
    localStorage.setItem("currentLon", lon);

    // Quick search weather data endpoint URL -- same as the current weather endpoint. Two days fetched for the 24 hour temperature display
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,weathercode&daily=weathercode,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,uv_index_max,precipitation_sum,precipitation_probability_max&&current_weather=true&temperature_unit=fahrenheit&windspeed_unit=mph&precipitation_unit=inch&timeformat=unixtime&forecast_days=2&timezone=auto`

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
            /* console.log("CURRENT Weather response data:", data); */
            removeAllElementChildren(currentWeatherWrapper);
            /* removeAllElementChildren(forecastWeatherWrapper); */
            searchInputField.value = "";
            renderCurrentWeather(data, selectedResultName, data.latitude, data.longitude);
        })

        .catch (error => {
            console.error("Error fetching CURRENT weather data:", error)
        })
}

function renderCurrentWeather(data, selectedName) {
    document.title = `${selectedName} | Current Weather`;
    console.log("DATA IN RENDER", data)
    // Create UI layout elements
    const dataRow = createDOMElement("div", "current-weather-row");
    const currentWrapper = createDOMElement("div", "current-wrapper");
    const currentDataWrapper = createDOMElement("div", "current-data");
    const leftCol = createDOMElement("div", "col");
    const rightCol = createDOMElement("div", "col");
    const currentTempWrapper = createDOMElement("div", "temp-wrapper");
    const currentInfoWrapper = createDOMElement("div", "info-wrapper");

    // Create UI Data elements
    const locationNameEl = createDOMElement("h2", undefined, selectedName);
    const currentTitle = createDOMElement("h3", "current-title", "Today");
    const currentTime = createDOMElement("p", "time", get12HourTimeInTimezone(data.timezone));
    const currentIcon = createDOMElement("img", "icon-lg");
    currentIcon.setAttribute("src", processWeatherCodeIcon(data.current_weather.weathercode));
    const currentTemp = createDOMElement("p", "temp", processWeatherUnits("temp", data.current_weather.temperature));
    const currentWeatherCode = createDOMElement("p", "code", processWeatherCodes(data.current_weather.weathercode));

    const dailyWindWrapper = createDOMElement("div", "data-row", "Wind");
    const dailyWind = createDOMElement("p", undefined, `${convertWindDirection(data.current_weather.winddirection)} ${processWeatherUnits("speed", data.current_weather.windspeed)}`);
    const highLowWrapper = createDOMElement("div", "high-low-wrapper");
    const dailyHighLowData = createDOMElement("p", "daily-temp high", `${processWeatherUnits("temp", data.daily.temperature_2m_max[0])} High / ${processWeatherUnits("temp", data.daily.temperature_2m_min[0])} Low`); // select first day from returned array
    const dailyFeelsLikeWrapper = createDOMElement("p", "data-row", "Feels Like");
    const dailyFeelsLikeData = createDOMElement("p", undefined, `${processWeatherUnits("temp", data.daily.apparent_temperature_max[0])} High / ${processWeatherUnits("temp", data.daily.apparent_temperature_min[0])} Low`); // select first day from returned array
    const dailyUVWrapper = createDOMElement("p", "data-row", "UV Index Max");
    const dailyUVData = createDOMElement("p", undefined, processWeatherUnits("uv", data.daily.uv_index_max[0])); // select first day from returned array
    const dailyPrecipSumWrapper = createDOMElement("p", "data-row", "Precipitation");
    const dailyPrecipSumData = createDOMElement("p", undefined, processWeatherUnits("precipSum", data.daily.precipitation_sum[0])); // select first day from returned array
    const dailyPrecipProbWrapper = createDOMElement("p", "data-row", "Precipitation Probability");
    const dailyPrecipProbData = createDOMElement("p", undefined, processWeatherUnits("precipProb", data.daily.precipitation_probability_max[0])); // select first day from returned array

    const dailyTempsListWrapper = createDOMElement("div", "daily-temps-list-wrapper")
    const dailyTempsList = createDOMElement("ul", "daily-temps-list");

    // Scroll eventListener for the hourly items -- allows automatic horizontal scrolling (https://developer.chrome.com/en/docs/lighthouse/best-practices/uses-passive-event-listeners/)
    dailyTempsList.addEventListener("wheel", (e) => {
        e.preventDefault();
        dailyTempsList.scrollLeft += e.deltaY;
    },{passive: true});

    dailyTempsList.setAttribute("role", "list");

    // Calculate the current hour index based on the user's timezone offset
    const now = new Date();
    now.setSeconds(now.getSeconds() + data.utc_offset_seconds);
    const currentHourIndex = now.getUTCHours();
    
    // use the currentHourIndex to filter hours that have passed. Select 24 of the filtered array items.
    const hourlyTemps = data.hourly.temperature_2m.filter((_, index) => index >= currentHourIndex).slice(0, 24);
    const hourlyTimes = data.hourly.time.filter((_, index) => index >= currentHourIndex).slice(0, 24);
    const hourlyCodes = data.hourly.weathercode.filter((_, index) => index >= currentHourIndex).slice(0, 24);

    const properties = Object.keys(hourlyTemps);

    properties.forEach((property) => {
        /* console.log("TIME:", property); */

        const newLi = createDOMElement("li");
        /* const timeSpan = createDOMElement("span", "time", convertUnixTimestampTo12HourFormat(hourlyTimes[property], data.timezone)); */
        let timeSpan;
        // Display "Now" instead of the time for the first item
        if (property == 0) {
            timeSpan = createDOMElement("span", "time", "Now");
        } else {
            timeSpan = createDOMElement("span", "time", convertUnixTimestampTo12HourFormat(hourlyTimes[property], data.timezone));
        }
        const icon = createDOMElement("img", "icon-sm");
        icon.setAttribute("src", processWeatherCodeIcon(hourlyCodes[property]));
        const tempSpan = createDOMElement("span", "temp", processWeatherUnits("temp", hourlyTemps[property]));
        newLi.append(timeSpan);
        newLi.append(icon)
        newLi.append(tempSpan);
        dailyTempsList.append(newLi);
    })

    dailyTempsListWrapper.append(dailyTempsList)

    const currentFragment = document.createDocumentFragment();

    currentFragment.append(locationNameEl);
    currentFragment.append(currentWrapper);
    // Current Weather
    currentWrapper.append(currentTitle);
    currentWrapper.append(currentTime);
    currentWrapper.append(currentDataWrapper);
    currentDataWrapper.append(leftCol);
    currentDataWrapper.append(rightCol);
    currentWrapper.append(dailyTempsListWrapper);
    leftCol.append(currentTempWrapper);
    rightCol.append(currentInfoWrapper);
    currentTempWrapper.append(currentIcon);
    currentTempWrapper.append(currentTemp);
    leftCol.append(currentWeatherCode);
    leftCol.append(highLowWrapper);
    highLowWrapper.append(dailyHighLowData);
    // Feels like data row
    currentInfoWrapper.append(dailyFeelsLikeWrapper);
    dailyFeelsLikeWrapper.append(dailyFeelsLikeData);
    // UV Row
    currentInfoWrapper.append(dailyUVWrapper);
    dailyUVWrapper.append(dailyUVData);
    // Precip Sum Row
    currentInfoWrapper.append(dailyPrecipSumWrapper);
    dailyPrecipSumWrapper.append(dailyPrecipSumData);
    // Precip Prob Row
    currentInfoWrapper.append(dailyPrecipProbWrapper);    
    dailyPrecipProbWrapper.append(dailyPrecipProbData);
    // Wind data row
    currentInfoWrapper.append(dailyWindWrapper);
    dailyWindWrapper.append(dailyWind);
    
    dataRow.append(currentFragment);
    currentWeatherWrapper.append(locationNameEl);
    currentWeatherWrapper.append(dataRow);

    // Add the link to view the forecast for current location
    const viewForecastLinkWrapper = createDOMElement("div", "view-forecast-wrapper");
    const viewForecastLink = createDOMElement("a", null, "View 7-Day Forecast");
    viewForecastLink.setAttribute("href", "forecast.html");
    viewForecastLinkWrapper.append(viewForecastLink)
    currentWeatherWrapper.append(viewForecastLinkWrapper);
}

// Fetch the data for the quick search buttons
async function fetchQuickSearchButtonData() {
    // Quick search location latitudes and longitudes
    const quickSearchItems = [
        {
            "city": "Los Angeles",
            "state": "California",
            "countryCode": "US",
            "lat": "34.0522",
            "lon": "-118.2437",
            "formattedName": "Los Angeles, CA"
        },
        {
            "city": "Denver",
            "state": "Colorado",
            "countryCode": "US",
            "lat": "39.7392",
            "lon": "-104.9847",
            "formattedName": "Denver, CO"
        },
        {
            "city": "Chicago",
            "state": "Illinois",
            "countryCode": "US",
            "lat": "41.85",
            "lon": "-87.65",
            "formattedName": "Chicago, IL"
        },
        {
            "city": "New York",
            "state": "New York",
            "countryCode": "US",
            "lat": "40.7143",
            "lon": "-74.006",
            "formattedName": "New York City, NY"
        },
    ];
    for (let i = 0; i < quickSearchItems.length; i++) {

        const lat = quickSearchItems[i].lat;
        const lon = quickSearchItems[i].lon;

        // Current weather data endpoint URL
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=fahrenheit&timeformat=unixtime&forecast_days=1&timezone=auto`;
        
        // Select each quick search button/temp when looping through parent element
        const allQuickSearchButtons = quickSearchButtonsWrapper.children;
        const currentQuickSearchButton = quickSearchButtonsWrapper.children[i];
        const currentName = currentQuickSearchButton.querySelector(".qs-location-name");
        const currentState = currentQuickSearchButton.querySelector(".qs-state-name");
        const currentIcon = currentQuickSearchButton.querySelector(".qs-icon");
        const currentQuickTemp = currentQuickSearchButton.querySelector(".qs-temp");

        currentName.textContent = quickSearchItems[i].city;
        currentState.textContent = quickSearchItems[i].state;

        // Add event listener to each quick search button / pass data to fetchQuickSearchWeather 
        currentQuickSearchButton.addEventListener("click", () => {
            // Params expected: locationName, adminLevel1, countryCode, lat, lon
            fetchQuickSearchWeather(quickSearchItems[i].city, quickSearchItems[i].state, quickSearchItems[i].countryCode, lat, lon);
            fetchQuickSearchButtonData(); // Refresh the temperatures displayed in the buttons
        })

        fetch (url)
            .then (response => {
                // check response status
                if (!response.ok) {
                    throw new Error ("Error fetching quick search weather data for", quickSearchItems[i].city)
                }

                // Return promise
                return response.json()
            })

            .then (data => {
                /* console.log("Quick search Weather response data:", data); */
                currentQuickTemp.textContent = `${processWeatherUnits("temp", data.current_weather.temperature)}`;
                currentIcon.setAttribute("src", processWeatherCodeIcon(data.current_weather.weathercode));
            })

            .catch (error => {
                console.error("Error fetching quick search weather data:", error)
            })
    }
}