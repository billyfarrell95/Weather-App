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
import createLoadingElement from "./utils/createLoadingElement.js";
import createErrorMessage from "./utils/createErrorMessage.js"

// Select UI Elements
const searchInputField = document.querySelector("#search-input");
const searchResultsWrapper = document.querySelector("#search-results-wrapper");
const searchResultsList = document.querySelector("#search-results-list");
const currentWeatherWrapper = document.querySelector("#current-weather-wrapper");
const useCurrentLocationButton = document.querySelector("#current-location-button");
const quickSearchButtonsWrapper = document.querySelector("#quick-search-buttons"); // The element that holds the quick search buttons

// This array will store the current search results -- Includes data required to fetch current weather. Cleared and updated when the fetched search results
let searchResultItemsArray = [];

document.addEventListener("DOMContentLoaded", () => {
    fetchQuickSearchButtonData();
    // Select all the keys in session storage
    const sessionKeys = Object.keys(sessionStorage);

    // Loop through all the keys and if they have a value of null, remove from sessionStorage
    sessionKeys.forEach(key => {
        const value = sessionStorage.getItem(key);
        // key === "IsThisFirstTime_Log_From_LiveServer" added because VSCode LiveServer plugin...
        if (value === "null" || key === "IsThisFirstTime_Log_From_LiveServer") {
            sessionStorage.removeItem(key)
        }
    });

    // After check/removing "null" sessionStorage values, fetchCurrentWeather if there is weather data in sessionStorage
    if (sessionStorage.length > 0) {
        const loading = createLoadingElement();
        currentWeatherWrapper.append(loading);
        /* console.log("DOMContentLoaded sessionStorage", sessionStorage) */
        const fullLocationName = sessionStorage.getItem("fullLocationName");
        const locationName = sessionStorage.getItem("locationName");
        const adminLevel1 = sessionStorage.getItem("adminLevel1");
        const countryCode = sessionStorage.getItem("countryCode")
        const lat = sessionStorage.getItem("currentLat");
        const lon = sessionStorage.getItem("currentLon");
        // Fetch Current Weather Based on sessionStorageData
        fetchCurrentWeather(locationName, adminLevel1, countryCode, lat, lon, fullLocationName);
    }
})

// Handle showing and hiding the search results when the field is/isn't active
document.addEventListener("click", () => {
    if (document.activeElement == searchInputField) {
        searchResultsWrapper.style.visibility = "visible";
        /* searchResultItemsArray = []; */
        handleSearchResultsKeyNav();
        console.log(searchResultItemsArray, "before render")
    } else {
        searchResultsWrapper.style.visibility = "hidden";
        searchInputField.value = "";
    }

    if (searchInputField.value.trim().length === 0) {
        removeAllElementChildren(searchResultsList)
        searchResultItemsArray = [];
    }
});

// Search input event listener
searchInputField.addEventListener("keyup", () => {
    // API Docs note: Empty string or 1 character returns empty result. 2 characters will match exact location. 3 or more characters will perform fuzzy matching
    // Only make API Search call when input is greater than two characters
    if (searchInputField.value.trim().length >= 2) {
        // Remove whitespace from search value
        const userInput = searchInputField.value.trim();
        fetchSearchResults(userInput);
    } else if (searchInputField.value.trim().length < 2) {
        searchResultItemsArray = [];
        console.log(searchResultItemsArray);
        removeAllElementChildren(searchResultsList)
    }
})

// useCurrentLocationButton event listener
useCurrentLocationButton.addEventListener("click", () => {
    removeAllElementChildren(currentWeatherWrapper);
    const loading = createLoadingElement();
    currentWeatherWrapper.append(loading);
    requestUserLocation();
})

// Request user location
function requestUserLocation() {
    const userLocation = navigator.geolocation.getCurrentPosition(userLocationAllowed, userLocationDenied);
}

// User location request success
function userLocationAllowed(position) {
    // Check if the returned data is in the expected format, if not show error message
    if (position && typeof position.coords.latitude === "number" && typeof position.coords.longitude === "number") {
        reverseGeocode(position.coords.latitude, position.coords.longitude);
    } else {
        removeAllElementChildren(currentWeatherWrapper);
        // If returned location data is invalid, create error message
        const errorMessage = createErrorMessage("location", "invalidLocationData");
        currentWeatherWrapper.append(errorMessage.element);
        console.error(errorMessage.errorMessage)
    }
}

// User location request failed
function userLocationDenied(error) {
    console.log(error);
    // If user denied location access, get approximate location from IP Address
    IPGeolocation();
}

// If user denied location, fetch lat/lon from IP address
async function IPGeolocation() {
    const IP_GEOLOCATION_KEY = "4c1d5e9161ff447d9f495e1bfb468574";
    const url = `https://ipgeolocation.abstractapi.com/v1/?api_key=${IP_GEOLOCATION_KEY}`;

    fetch (url)
        .then(response => {
            // Check response status. If response isn't ok, show error message
            if (!response.ok) {
                const errorMessage = createErrorMessage("network", "general");
                removeAllElementChildren(currentWeatherWrapper);
                currentWeatherWrapper.append(errorMessage.element);
                throw new Error(errorMessage.errorMessage);
            }

            return response.json();
        })

        .then (data => {
            // Check if data/data type matches expected value for lat and lon. If not, show access denied error message.
            if (data && typeof data.latitude === "number" && typeof data.longitude === "number") {
                // reverseGeocode based on IP lat/lon
                reverseGeocode(data.latitude, data.longitude);
            } else {
                // If returned data doesn't match expect type, show error message
                const errorMessage = createErrorMessage("location", "accessDenied");
                removeAllElementChildren(currentWeatherWrapper);
                currentWeatherWrapper.append(errorMessage.element);
                throw new Error(errorMessage.errorMessage);
            }
        })

        .catch (error => {
            console.error(error)
        })
}

// Fetch location name based on coordinates retrieved from navigator API (useCurrentLocationButton)
async function reverseGeocode(lat, lon) {
    const OPEN_CAGE_API_KEY = "9ce86e2baa8049d69415d979fd71cb69";
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${OPEN_CAGE_API_KEY}`;

    fetch (url)
        .then(response => {
            // Check response status. If response isn't ok, show error message
            if (!response.ok) {
                const errorMessage = createErrorMessage("network", "general");
                removeAllElementChildren(currentWeatherWrapper);
                currentWeatherWrapper.append(errorMessage.element);
                throw new Error(errorMessage.errorMessage);
            }

            // Return promise
            return response.json();
        })

        .then (data => {
            // Check if results were returned
            console.log(data.results[0].components, "GEOCODE DATA FROM reverseGeocode");
            let locationName;
            let adminLevel1;
            let countryCode;
            // Check if results were return, if so process this data
            if (data.total_results !== 0) {
                console.log("DATA IN REVERSE GEOCODE THEN", data)
                locationName = processGeocodingLocationName(data.results[0].components); // the pair of the first key that matches the requirements is returned   
                adminLevel1 = processGeocodingAdminLevel1(data.results[0].components); // the pair of the first key that matches the requirements is returned   
                countryCode = data.results[0].components.country_code.toUpperCase(); // country code
                // after processing the data, check that each has a value, value can be null, this is checked in fetchCurrentWeather
                if (locationName && adminLevel1 && countryCode) {
                    fetchCurrentWeather(locationName, adminLevel1, countryCode, lat, lon);
                }
            } else {
                // If the user granted permission access, but the reverseGeocode didn't return results based on lat/lon
                const errorMessage = createErrorMessage("location", "accessFailed");
                removeAllElementChildren(currentWeatherWrapper);
                currentWeatherWrapper.append(errorMessage.element);
                throw new Error(errorMessage.errorMessage)
            }
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
            // Check response status. If response isn't ok, show error message
            if (!response.ok) {
                const errorMessage = createErrorMessage("generic", "refresh");
                removeAllElementChildren(searchResultsList);
                const newLi = createDOMElement("li", "search-error", errorMessage.errorMessage);
                searchResultsList.append(newLi);
                throw new Error (errorMessage.errorMessage);
            }

            // Return promise
            return response.json()
        })
        
        .then (data => {    
            // Check if results were returned before trying to display them (checks if data exists, if results exists within data, and if there is a length)
            if (data?.results?.length) {
                displaySearchResults(data)
            } else {
                // If there are no search results clear container (this prevents previous results from showing if characters that don't match are added to search string)
                removeAllElementChildren(searchResultsList);
            }
        })

        .catch (error => {
            console.error(error);
        })
} 

// Handle displaying/updating search results
function displaySearchResults(data) {
    console.log(data, "DATA IN DISPLAY")
    // Clear search results UI Elements -- re-render everytime function is called (keyup)
    removeAllElementChildren(searchResultsList);
    // Loop through results
    for (let i = 0; i < data.results.length; i++) {
        const newResultLi = document.createElement("li"); // New search result item
        newResultLi.setAttribute("tabindex", i + 1)
        const locationName = data.results[i].name; // Select the location name and pass to fetchCurrentWeather
        const adminLevel1 = data.results[i].admin1; // Select the 1st hierarchical admin area (state, etc)
        const countryCode = data.results[i].country_code; // Country code
        const lat = data.results[i].latitude;
        const lon = data.results[i].longitude;

        // Add click event listener to each search result. On click, pass the corresponding item to fetch
        newResultLi.addEventListener("click", () => {
            /* fetchCurrentWeather(newResult) */
            fetchCurrentWeather(locationName, adminLevel1, countryCode, lat, lon);
        });

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

        // Save the current search results globally to be accessed in handleSearchResultsKeyNav()
        searchResultItemsArray = data.results;

        // Add search results to the list
        searchResultsList.append(newResultLi)
    }
}

// Get current weather data
async function fetchCurrentWeather(locationName, adminLevel1, countryCode, lat, lon) {
    // Weather heading name
    let selectedResultName;

    // Check values and assign data to selectedResultName
    if (locationName !== undefined && locationName !== "undefined" && adminLevel1 !== undefined && adminLevel1 !== "undefined") {
        selectedResultName = locationName + ", " + adminLevel1 + ", " + countryCode;
    } else if (locationName !== undefined && locationName !== "undefined") {
        selectedResultName = locationName + ", " + countryCode;
    } else if (adminLevel1 !== undefined && adminLevel1 !== "undefined") {
        selectedResultName = adminLevel1;
    }

    // Name to be displayed on forecast page
    sessionStorage.setItem("fullLocationName", selectedResultName);
    // Data to be re-used when navigating back/re-fetching weather 
    sessionStorage.setItem("locationName", locationName)   
    sessionStorage.setItem("adminLevel1", adminLevel1);
    sessionStorage.setItem("countryCode", countryCode);
    sessionStorage.setItem("currentLat", lat);
    sessionStorage.setItem("currentLon", lon);

    // Current weather data endpoint URL -- same as the quick search weather endpoint. Two days fetched for the 24 hour temperature display
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,weathercode&daily=weathercode,temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_sum,precipitation_probability_max&&current_weather=true&temperature_unit=fahrenheit&windspeed_unit=mph&precipitation_unit=inch&timeformat=unixtime&forecast_days=2&timezone=auto`
    
    fetch (url)
        .then (response => {
            // Check response status. If response isn't ok, show error message
            if (!response.ok) {
                const errorMessage = createErrorMessage("weather", "fetchFailed");
                removeAllElementChildren(currentWeatherWrapper);
                currentWeatherWrapper.append(errorMessage.element);
                throw new Error(errorMessage.errorMessage);
            }

            // Return promise
            return response.json()
        })

        .then (data => {
            removeAllElementChildren(searchResultsList);
            removeAllElementChildren(currentWeatherWrapper);
            searchInputField.value = "";
            if (data && selectedResultName && typeof data.latitude === "number" && typeof data.longitude === "number") {
                console.log("data in render forecast", data)
                renderCurrentWeather(data, selectedResultName, data.latitude, data.longitude);
            } else {
                const errorMessage = createErrorMessage("weather", "dataInvalid");
                removeAllElementChildren(currentWeatherWrapper);
                currentWeatherWrapper.append(errorMessage.element);
                throw new Error(errorMessage.errorMessage);
            }
        })

        .catch (error => {
            console.error(error);
        })
}

// Get current weather data (current and today's weather)
async function fetchQuickSearchWeather(locationName, adminLevel1, countryCode, lat, lon) {
    removeAllElementChildren(currentWeatherWrapper);
    const loading = createLoadingElement();
    currentWeatherWrapper.append(loading);
    // Weather heading name
    let selectedResultName;

    // Check values and assign data to selectedResultName
    if (locationName !== undefined && locationName !== "undefined" && adminLevel1 !== undefined && adminLevel1 !== "undefined") {
        selectedResultName = locationName + ", " + adminLevel1 + ", " + countryCode;
    } else if (locationName !== undefined && locationName !== "undefined") {
        selectedResultName = locationName + ", " + countryCode;
    } else if (adminLevel1 !== undefined && adminLevel1 !== "undefined") {
        selectedResultName = adminLevel1;
    }

    // Name to be displayed on forecast page
    sessionStorage.setItem("fullLocationName", selectedResultName);
    // Data to be re-used when navigating back/re-fetching weather 
    sessionStorage.setItem("locationName", locationName)   
    sessionStorage.setItem("adminLevel1", adminLevel1);
    sessionStorage.setItem("countryCode", countryCode);
    sessionStorage.setItem("currentLat", lat);
    sessionStorage.setItem("currentLon", lon);

    // Quick search weather data endpoint URL -- same as the current weather endpoint. Two days fetched for the 24 hour temperature display
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,weathercode&daily=weathercode,temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_sum,precipitation_probability_max&&current_weather=true&temperature_unit=fahrenheit&windspeed_unit=mph&precipitation_unit=inch&timeformat=unixtime&forecast_days=2&timezone=auto`

    fetch (url)
        .then (response => {
            // Check response status. If response isn't ok, show error message
            if (!response.ok) {
                const errorMessage = createErrorMessage("weather", "fetchFailed");
                removeAllElementChildren(currentWeatherWrapper);
                currentWeatherWrapper.append(errorMessage.element);
                throw new Error(errorMessage.errorMessage);
            }

            // Return promise
            return response.json()
        })

        .then (data => {
            /* console.log("CURRENT Weather response data:", data); */
            searchInputField.value = "";
            /* renderCurrentWeather(data, selectedResultName, data.latitude, data.longitude); */
            if (data && selectedResultName && typeof data.latitude === "number" && typeof data.longitude === "number") {
                renderCurrentWeather(data, selectedResultName, data.latitude, data.longitude);
            } else {
                const errorMessage = createErrorMessage("weather", "dataInvalid");
                removeAllElementChildren(currentWeatherWrapper);
                currentWeatherWrapper.append(errorMessage.element);
                throw new Error(errorMessage.errorMessage);
            }
        })

        .catch (error => {
            console.error(error)
        })
}

// Render the current weather
function renderCurrentWeather(data, selectedName) {
    removeAllElementChildren(currentWeatherWrapper);
    // Update document title based on current location
    document.title = `${selectedName} | Current Weather`;

    // Create UI layout elements
    const dataRow = createDOMElement("div", "current-weather-row");
    const currentWrapper = createDOMElement("div", "current-wrapper");

    currentWrapper.classList.add("skeleton");

    const currentDataWrapper = createDOMElement("div", "current-data");
    const leftCol = createDOMElement("div", "col");
    const rightCol = createDOMElement("div", "col");
    const currentTempWrapper = createDOMElement("div", "temp-wrapper");
    const currentInfoWrapper = createDOMElement("div", "info-wrapper");

    // Create UI Data elements
    const locationNameEl = createDOMElement("h2", undefined, selectedName);
    const currentTitle = createDOMElement("h3", "current-title", "Today");
    const currentTime = createDOMElement("span", "time", ` | ${get12HourTimeInTimezone(data.timezone)}`);
    const currentIcon = createDOMElement("img", "icon-lg");
    currentIcon.setAttribute("src", processWeatherCodeIcon(data.current_weather.weathercode));
    const currentTemp = createDOMElement("p", "temp", processWeatherUnits("temp", data.current_weather.temperature));
    const currentWeatherCode = createDOMElement("p", "code", processWeatherCodes(data.current_weather.weathercode));

    const dailyWindWrapper = createDOMElement("div", "data-row", "Wind");
    const dailyWind = createDOMElement("p", undefined, `${convertWindDirection(data.current_weather.winddirection)} ${processWeatherUnits("speed", data.current_weather.windspeed)}`);
    const highLowWrapper = createDOMElement("div", "high-low-wrapper");
    const dailyHighLowData = createDOMElement("p", "daily-temp high", `${processWeatherUnits("temp", data.daily.temperature_2m_max[0])} High / ${processWeatherUnits("temp", data.daily.temperature_2m_min[0])} Low`); // select first day 
    const dailyUVWrapper = createDOMElement("p", "data-row", "UV Index Max");
    const dailyUVData = createDOMElement("p", undefined, processWeatherUnits("uv", data.daily.uv_index_max[0])); // select first day from returned array
    const dailyPrecipSumWrapper = createDOMElement("p", "data-row", "Precipitation");
    const dailyPrecipSumData = createDOMElement("p", undefined, processWeatherUnits("precipSum", data.daily.precipitation_sum[0])); // select first day from returned array
    const dailyPrecipProbWrapper = createDOMElement("p", "data-row", "Precipitation Probability");
    const dailyPrecipProbData = createDOMElement("p", undefined, processWeatherUnits("precipProb", data.daily.precipitation_probability_max[0])); // select first day from returned array

    const dailyTempsListWrapper = createDOMElement("div", "daily-temps-list-wrapper")
    const dailyTempsList = createDOMElement("ul", "daily-temps-list");
    dailyTempsList.setAttribute("role", "list"); // See reset.css list styles

    // Calculate the current hour index based on the user's timezone offset
    const now = new Date();
    now.setSeconds(now.getSeconds() + data.utc_offset_seconds);
    const currentHourIndex = now.getUTCHours();
    
    // use the currentHourIndex to filter hours that have passed. Select 24 of the filtered array items.
    const hourlyTemps = data.hourly.temperature_2m.filter((_, index) => index >= currentHourIndex).slice(0, 24);
    const hourlyTimes = data.hourly.time.filter((_, index) => index >= currentHourIndex).slice(0, 24);
    const hourlyCodes = data.hourly.weathercode.filter((_, index) => index >= currentHourIndex).slice(0, 24);

    // Select all of the keys for the hourly temps
    const properties = Object.keys(hourlyTemps);

    // Loop through the keys and render times, icons, and temperatures
    properties.forEach((property) => {
        const newLi = createDOMElement("li");
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
    currentTitle.append(currentTime);
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

    currentIcon.onload =  () => {
        currentWrapper.classList.remove("skeleton");
    }
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

        /* currentName.textContent = quickSearchItems[i].city;
        currentState.textContent = quickSearchItems[i].state; */

        // Add event listener to each quick search button / pass data to fetchQuickSearchWeather 
        currentQuickSearchButton.addEventListener("click", () => {
            // Params expected: locationName, adminLevel1, countryCode, lat, lon
            fetchQuickSearchWeather(quickSearchItems[i].city, quickSearchItems[i].state, quickSearchItems[i].countryCode, lat, lon);
        })

        fetch (url)
            .then (response => {
                // Check response status
                if (!response.ok) {
                    throw new Error ("Error fetching quick search weather data for", quickSearchItems[i].city);
                }

                // Return promise
                return response.json()
            })

            .then (data => {
                if (data && typeof data.current_weather.temperature === "number" && typeof data.current_weather.weathercode === "number") {
                    currentName.textContent = quickSearchItems[i].city;
                    currentState.textContent = quickSearchItems[i].state;
                    currentQuickTemp.textContent = `${processWeatherUnits("temp", data.current_weather.temperature)}`;
                    currentIcon.setAttribute("src", processWeatherCodeIcon(data.current_weather.weathercode));
                    currentIcon.onload = function() {
                        currentQuickSearchButton.classList.remove("skeleton");
                    }
                } else {
                    // Populate buttons with city/state but remove icon and temp if the data contains unexpected values for each
                    currentName.textContent = quickSearchItems[i].city;
                    currentState.textContent = quickSearchItems[i].state;
                    currentIcon.setAttribute("src", "");
                    currentQuickTemp.textContent = "";
                    currentQuickSearchButton.classList.remove("skeleton");
                }
            })

            .catch (error => {
                console.error(error)
            })
    }
}

// Handle keyboard navigation through the search results
function handleSearchResultsKeyNav() {
    // Navigate through search results with up/down arrow keys
    let itemIndex = -1;
    // Select search results list children (<li>)
    const children = searchResultsList.children;
    // Holds the UI element the user has selected
    let selectedListItem;

    function handleEnterKeyPress(index) {
        // Fetch current weather using data saved in the global search results variable. Global data and UI results items match indexes.
        searchResultsWrapper.style.visibility = "hidden";
        removeAllElementChildren(currentWeatherWrapper);
        const loading = createLoadingElement();
        currentWeatherWrapper.append(loading);
        fetchCurrentWeather(searchResultItemsArray[index].name, searchResultItemsArray[index].admin1, searchResultItemsArray[index].country_code, searchResultItemsArray[index].latitude, searchResultItemsArray[index].longitude);
    }

    // Add an event listener to capture keydown events
    if (document.activeElement == searchInputField) {
        document.addEventListener("keydown", (e) => {
        if (searchResultItemsArray.length > 0) {
            switch (e.key) {
            // Case for down arrow press    
            case "ArrowDown":
                e.preventDefault(); // Prevent page scrolling
                /* console.log("arrowdown case ran", itemIndex) */
                if (itemIndex === searchResultItemsArray.length - 1) {
                    itemIndex = 0;
                } else {
                    itemIndex++;
                }
                children[itemIndex].focus(); // Focus on the selected search results list child
                selectedListItem = children[itemIndex]; // Select the current HTML List item
                searchInputField.value = children[itemIndex].textContent;
                break;

            // Case to up arrow press
            case "ArrowUp":
                e.preventDefault(); // Prevent page scrolling
                /* console.log("arrowup case ran", itemIndex) */
                if (itemIndex === 0) {
                    itemIndex = searchResultItemsArray.length - 1;
                } else if (itemIndex > 0) {
                    itemIndex--;
                }
                children[itemIndex].focus(); // Focus on the selected search results list child
                selectedListItem = children[itemIndex]; // Select the current HTML list item
                searchInputField.value = children[itemIndex].textContent;
                break;
            // Case for enter press    
            case "Enter":
                /* console.log("enter case ran", itemIndex) */
                if (selectedListItem) {
                    selectedListItem.addEventListener("keypress", (e) => {
                        if (e.key === "Enter") {
                            handleEnterKeyPress(itemIndex);
                            searchResultItemsArray = []; // Clear saved search results after searching
                        }
                    });
                }
            }
        }
    }); 
    }
}