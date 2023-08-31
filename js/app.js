// Select UI Elements
const searchInputField = document.querySelector("#search-input");
const searchInputWrapper = document.querySelector("#search-input-wrapper");
const searchResultsWrapper = document.querySelector("#search-results-wrapper")
const searchResultsList = document.querySelector("#search-results-list");
const currentWeatherWrapper = document.querySelector("#current-weather-wrapper");
const useCurrentLocationButton = document.querySelector("#current-location-button");
const quickSearchWrapper = document.querySelector("#quick-search-wrapper"); // The element that holds the quick search buttons
const forecastWeatherWrapper = document.querySelector("#forecast-weather-wrapper");

document.addEventListener("DOMContentLoaded", fetchQuickSearchButtonData());

// Handle showing and hiding the search results when the field is/isn't active
document.addEventListener("click", () => {
    if (document.activeElement == searchInputField) {
        /* console.log("input wrapper is active"); */
        searchResultsWrapper.style.display = "";
    } else {
        /* console.log("input wrapper not active") */
        searchResultsWrapper.style.display = "none"
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

            console.log("DATA IN REVERSE GEOCODE", data)
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

        //const name = data.results[i].name; // Location name
        //const adminLevel1 = data.results[i].admin1; // Administrative area the location resides in

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

// Helper function - clear all the children of a selected HTML element
function removeAllElementChildren(item) {
    while (item.firstChild) {
        item.removeChild(item.firstChild)
    }
}

// Helper function - get the current time
/* function getCurrent12HourTime() {
    let date = new Date();

    let hours = date.getHours();
    let minutes = date.getMinutes();

    // Check whether AM or PM
    let ampm = hours >= 12 ? "PM": "AM";

    // Find the current hour in AM-PM format
    hours = hours % 12;

    // Display "0" as "12"
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? "0" + minutes : minutes;


    const new12HourTime = hours + ":" + minutes + " " + ampm;
    
    return new12HourTime;
} */

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

// Helper function - Convert Unix timestamp to 12 hour time
function convertUnixTimestampTo12HourFormat(unixTimestamp, timezone) {
    // Create a new Date object from the Unix timestamp (in milliseconds)
    const date = new Date(unixTimestamp * 1000);
    console.log(timezone)
    // Format time
    const formattedTime = date.toLocaleString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
        timeZone: timezone, // the timezone of the location the user is viewing (pulled from the API response)

    });

    return formattedTime;
}

// Helper function - process geocoding location results
function processGeocodingLocationName(geocodingResults) {
    // Check common expected results in specified order
    const locationName = geocodingResults.city || geocodingResults.town || geocodingResults.country || geocodingResults.postcode || geocodingResults.neighbourhood || geocodingResults.suburb || geocodingResults.office || geocodingResults.municipality || geocodingResults.city_district || geocodingResults.state_district || null;
    
    return locationName
}

// Helper function - process geocoding administrative level results
function processGeocodingAdminLevel1(geocodingResults) {
    // Check common expected results in specified order
    const adminLevel1 = geocodingResults.state || geocodingResults.country || geocodingResults.region || null;
    return adminLevel1
}

// Get current weather data
async function fetchCurrentWeather(locationName, adminLevel1, countryCode, lat, lon) {
    console.log(countryCode, "country code in fetchCurrentWeather")
    // Defined and check the result name for undefined values 
    let selectedResultName;
    if (locationName !== undefined && adminLevel1 !== undefined) {
        selectedResultName = locationName + ", " + adminLevel1 + ", " + countryCode;
        console.log("adminLevel1 in BLOCK ONE" , adminLevel1)
        console.log("BLOCK ONE RAN")
    } else if (locationName !== undefined && adminLevel1 == undefined) {
        selectedResultName = locationName + ", " + countryCode;
        console.log("BLOCK TWO RAN")
    } else if (locationName == undefined && adminLevel1 !== undefined) {
        selectedResultName = adminLevel1;
        console.log("BLOCK THREE RAN")
    }

    // Current weather data endpoint URL
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weathercode,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,uv_index_max,precipitation_sum,precipitation_probability_max&&current_weather=true&temperature_unit=fahrenheit&windspeed_unit=mph&precipitation_unit=inch&timeformat=unixtime&forecast_days=1&timezone=auto`
    
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
            removeAllElementChildren(forecastWeatherWrapper);
            searchInputField.value = "";
            renderCurrentWeather(data, selectedResultName, data.latitude, data.longitude);
            fetchQuickSearchButtonData();
            /* renderDailyWeather(data.daily) */
        })

        .catch (error => {
            console.error("Error fetching CURRENT weather data:", error)
        })
}

// Get current weather data (current and today's weather)
async function fetchQuickSearchWeather(locationName, adminLevel1, countryCode, lat, lon) {
    // Defined and check the result name for undefined values 
    let selectedResultName;
    if (locationName !== undefined && adminLevel1 !== undefined) {
        selectedResultName = locationName + ", " + adminLevel1 + ", " + countryCode;
        console.log("adminLevel1 in BLOCK ONE" , adminLevel1)
        console.log("BLOCK ONE RAN")
    } else if (locationName !== undefined && adminLevel1 == undefined) {
        selectedResultName = locationName + ", " + countryCode;
        console.log("BLOCK TWO RAN")
    } else if (locationName == undefined && adminLevel1 !== undefined) {
        selectedResultName = adminLevel1;
        console.log("BLOCK THREE RAN")
    }

    // Current weather data endpoint URL
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weathercode,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,uv_index_max,precipitation_sum,precipitation_probability_max&&current_weather=true&temperature_unit=fahrenheit&windspeed_unit=mph&precipitation_unit=inch&timeformat=unixtime&forecast_days=1&timezone=auto`

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
            removeAllElementChildren(forecastWeatherWrapper);
            searchInputField.value = "";
            renderCurrentWeather(data, selectedResultName, data.latitude, data.longitude);
        })

        .catch (error => {
            console.error("Error fetching CURRENT weather data:", error)
        })
}

// Helper function to create DOM elements, textContent and className are optional
function createDOMElement(tagName, className, textContent) {
    const element = document.createElement(tagName);
    if (textContent !== undefined) {
        element.textContent = textContent;
    }
    if (className !== undefined) {
        element.classList.add(className);
    }
    return element;
}

function renderCurrentWeather(data, selectedName, latitude, longitude) {
    // createDOMElement(tagName, className, textContent)
    // Create UI layout elements
    // Current Weather
    const currentWrapper = createDOMElement("div");
    const currentLeftCol = createDOMElement("div");
    const currentRightCol = createDOMElement("div");
    const currentTempWrapper = createDOMElement("div");
    // Daily Weather
    const dailyWrapper = createDOMElement("div");
    const dailyRow = createDOMElement("div");
    const dailyLeftCol = createDOMElement("div");
    const dailyRightCol = createDOMElement("div");
    const dailyTempWrapper = createDOMElement("div");

    // Create UI Data elements
    const locationNameEl = createDOMElement("h2", undefined, selectedName);
    // Current Weather
    const currentTitle = createDOMElement("h3", undefined, "Current Weather");
    console.log("data in renderCurrentWeather", data)
    const currentTime = createDOMElement("p", undefined, get12HourTimeInTimezone(data.timezone));
    const currentIcon = document.createElement("img");
    const currentTemp = createDOMElement("p", undefined, `Temperature: ${data.current_weather.temperature}`);
    const currentWeathercode = createDOMElement("p", undefined, `Weathercode: ${processWeatherCodes(data.daily.weathercode)}`);
    const currentWind = createDOMElement("p", undefined, `Wind Direction: ${data.current_weather.winddirection} ${data.current_weather.windspeed}`);
    currentIcon.setAttribute("src", "https://placehold.co/50x50"); // placeholder
    // Daily weather
    const dailyTitle = createDOMElement("h3", undefined, "Today");
    const dailyIcon = document.createElement("img");
    const dailyHigh = createDOMElement("p", undefined, `High: ${data.daily.temperature_2m_max}`);
    const dailyLow = createDOMElement("p", undefined, `Low: ${data.daily.temperature_2m_min}`);
    /* const dailyWeathercode = createDOMElement("p", undefined, `Weathercode: ${data.daily.weathercode}`) */
    const dailyWeathercode = createDOMElement("p", undefined, `Weathercode: ${processWeatherCodes(data.daily.weathercode)}`)
    const dailyFeelsLike = createDOMElement("p", undefined, `Feels like max/min: ${data.daily.apparent_temperature_max} ${data.daily.apparent_temperature_min}`);
    const dailyUV = createDOMElement("p", undefined, `UV Index max: ${data.daily.uv_index_max}`);
    const dailyPrecipSum = createDOMElement("p", undefined, `Precipitation Sum: ${data.daily.precipitation_sum}`);
    const dailyPrecipProb = createDOMElement("p", undefined, `Precipitation Probability ${data.daily.precipitation_probability_max}`);
    dailyIcon.setAttribute("src", "https://placehold.co/50x50"); // placeholder

    const currentFragment = document.createDocumentFragment();
    const dailyFragment = document.createDocumentFragment();

    currentFragment.append(locationNameEl);
    currentFragment.append(currentWrapper);
    // Current Weather
    currentWrapper.append(currentLeftCol);
    currentLeftCol.append(currentTitle);
    currentLeftCol.append(currentTime);
    currentLeftCol.append(currentTempWrapper);
    currentTempWrapper.append(currentIcon);
    currentTempWrapper.append(currentTemp);
    currentLeftCol.append(currentWeathercode);
    currentWrapper.append(currentRightCol);
    currentRightCol.append(currentWind);
    // Daily Weather
    dailyFragment.append(dailyWrapper)
    dailyWrapper.append(dailyTitle);
    dailyWrapper.append(dailyRow);
    dailyRow.append(dailyLeftCol);
    dailyRow.append(dailyRightCol);
    dailyLeftCol.append(dailyTempWrapper);
    dailyTempWrapper.append(dailyIcon);
    dailyTempWrapper.append(dailyHigh);
    dailyTempWrapper.append(dailyLow);
    dailyLeftCol.append(dailyWeathercode);
    dailyRightCol.append(dailyFeelsLike);
    dailyRightCol.append(dailyUV);
    dailyRightCol.append(dailyPrecipSum);
    dailyRightCol.append(dailyPrecipProb);

    currentWeatherWrapper.append(currentFragment);
    currentWeatherWrapper.append(dailyFragment);

    // Add the button to view the forecast for current location
    createViewForecastButton(latitude, longitude);
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
        const currentButton = quickSearchWrapper.children[i];
        const currentQuickTemp = quickSearchWrapper.children[i];

        // Add event listener to each quick search button / pass data to fetchQuickSearchWeather 
        currentButton.addEventListener("click", () => {
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
                currentQuickTemp.textContent = `${quickSearchItems[i].formattedName} (${data.current_weather.temperature})`
            })

            .catch (error => {
                console.error("Error fetching quick search weather data:", error)
            })
    }
}

function createViewForecastButton(lat, lon) {
    const viewForecastButton = document.createElement("button");
    viewForecastButton.textContent = "View 7-Day Forecast";
    currentWeatherWrapper.append(viewForecastButton);

    viewForecastButton.addEventListener("click", () => {
        fetchForecastData(lat, lon);
    })
}

// Fetch the forecast data for the current location
async function fetchForecastData(lat, lon) {
    // How many days of forecast weather to fetch:
    const daysNum = 7;
    // Forecast endpoint for current location based on lat/lon of the "Current Weather"
    // Unix time:
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

// Render the forecast data for the current location
function sortForecastWeatherData(data) {
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
    for (let i = 0; i < 168; i++) {
        if (i <= 23) {
            dayOne.push({
                "apparent_temp": data.hourly.apparent_temperature[i],
                "precip_prob": data.hourly.precipitation_probability[i],
                "temp": data.hourly.temperature_2m[i],
                "weathercode": data.hourly.weathercode[i],
                "wind_direction": data.hourly.winddirection_10m[i],
                "windspeed": data.hourly.windspeed_10m[i],
                "time": data.hourly.time[i]
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
                "time": data.hourly.time[i]
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
                "time": data.hourly.time[i]
            });
        }
        if (i > 71 && i <= 95) {
            dayFour.push({
                "apparent_temp": data.hourly.apparent_temperature[i],
                "precip_prob": data.hourly.precipitation_probability[i],
                "temp": data.hourly.temperature_2m[i],
                "weathercode": data.hourly.weathercode[i],
                "wind_direction": data.hourly.winddirection_10m[i],
                "windspeed": data.hourly.windspeed_10m[i],
                "time": data.hourly.time[i]
            });
        }
        if (i > 95 && i <= 119) {
            dayFive.push({
                "apparent_temp": data.hourly.apparent_temperature[i],
                "precip_prob": data.hourly.precipitation_probability[i],
                "temp": data.hourly.temperature_2m[i],
                "weathercode": data.hourly.weathercode[i],
                "wind_direction": data.hourly.winddirection_10m[i],
                "windspeed": data.hourly.windspeed_10m[i],
                "time": data.hourly.time[i]
            });
        }
        if (i > 119 && i <= 143) {
            daySix.push({
                "apparent_temp": data.hourly.apparent_temperature[i],
                "precip_prob": data.hourly.precipitation_probability[i],
                "temp": data.hourly.temperature_2m[i],
                "weathercode": data.hourly.weathercode[i],
                "wind_direction": data.hourly.winddirection_10m[i],
                "windspeed": data.hourly.windspeed_10m[i],
                "time": data.hourly.time[i]
            });
        }
        if (i > 143) {
            daySeven.push({
                "apparent_temp": data.hourly.apparent_temperature[i],
                "precip_prob": data.hourly.precipitation_probability[i],
                "temp": data.hourly.temperature_2m[i],
                "weathercode": data.hourly.weathercode[i],
                "wind_direction": data.hourly.winddirection_10m[i],
                "windspeed": data.hourly.windspeed_10m[i],
                "time": data.hourly.time[i]
            });
        }
    }

    // Create an index based on user's timezone to use when filtering passed hours on current day hourlry weather
    /* const currentHourIndex = new Date().getHours(); */

    // Calculate the current day based on user's timezone offset
    const now = new Date();
    console.log("NOW", now)
    now.setSeconds(now.getSeconds() + data.utc_offset_seconds);

    // Calculate the current hour index based on the user's timezone offset
    const currentHourIndex = now.getUTCHours();

    dayOne = dayOne.filter((_, index) => index > currentHourIndex);
    const allForecastData = [dayOne, dayTwo, dayThree, dayFour, dayFive, daySix, daySeven];

    // Render the forecast data
    allForecastData.forEach((dayData) => {
        renderForecastData(dayData, data.timezone) 
    })
}

// Render the data to the DOM
function renderForecastData(dayData, timezone) {
    const listWrapper = document.createElement("div");
    listWrapper.classList.add("forecast-list-wrapper");
    console.log("dayData in renderForecastData", dayData)

    const properties = Object.keys(dayData);

    properties.forEach((property) => {
        const newList = document.createElement("ul");
        newList.classList.add("forecast-list");
        const timeLi = document.createElement("li");
        timeLi.style.fontWeight = "bold";
        const apparentTempLi = document.createElement("li");
        const precipProbLi = document.createElement("li");
        const tempLi = document.createElement("li");
        const weatherCodeLi = document.createElement("li");
        const windDirectionLi = document.createElement("li");
        const windSpeedLi = document.createElement("li");
        // Unix time:
        timeLi.textContent = convertUnixTimestampTo12HourFormat(dayData[property].time, timezone);
        apparentTempLi.textContent = dayData[property].apparent_temp;
        precipProbLi.textContent = dayData[property].precip_prob;
        tempLi.textContent = dayData[property].temp;
        weatherCodeLi.textContent = processWeatherCodes(dayData[property].weathercode);
        windDirectionLi.textContent = dayData[property].wind_direction;
        windSpeedLi.textContent = dayData[property].windspeed;
        newList.append(timeLi);
        newList.append(apparentTempLi);
        newList.append(precipProbLi);
        newList.append(tempLi);
        newList.append(weatherCodeLi);
        newList.append(windDirectionLi);
        newList.append(windSpeedLi);
        listWrapper.append(newList)
    });

    forecastWeatherWrapper.append(listWrapper);
}

function processWeatherCodes(code) {
    const weatherCodeValues = [
        { number: 0, value: "Clear sky" },
        { number: 1, value: "Mainly clear" },
        { number: 2, value: "Partly cloudy" },
        { number: 3, value: "Overcast" },
        { number: 45, value: "Fog and depositing rime fog" },
        { number: 48, value: "Fog and depositing rime fog" },
        { number: 51, value: "Drizzle: Light intensity" },
        { number: 53, value: "Drizzle: Moderate intensity" },
        { number: 55, value: "Drizzle: Dense intensity" },
        { number: 56, value: "Freezing Drizzle: Light intensity" },
        { number: 57, value: "Freezing Drizzle: Dense intensity" },
        { number: 61, value: "Rain: Slight intensity" },
        { number: 63, value: "Rain: Moderate intensity" },
        { number: 65, value: "Rain: Heavy intensity" },
        { number: 66, value: "Freezing Rain: Light intensity" },
        { number: 67, value: "Freezing Rain: Heavy intensity" },
        { number: 71, value: "Snow fall: Slight intensity" },
        { number: 73, value: "Snow fall: Moderate intensity" },
        { number: 75, value: "Snow fall: Heavy intensity" },
        { number: 77, value: "Snow grains" },
        { number: 80, value: "Rain showers: Slight intensity" },
        { number: 81, value: "Rain showers: Moderate intensity" },
        { number: 82, value: "Rain showers: Violent intensity" },
        { number: 85, value: "Snow showers: Slight intensity" },
        { number: 86, value: "Snow showers: Heavy intensity" },
        { number: 95, value: "Thunderstorm: Slight or moderate" },
        { number: 96, value: "Thunderstorm with slight hail" },
        { number: 99, value: "Thunderstorm with heavy hail" }
      ];

      const weathercode = weatherCodeValues.find(item => item.number == code)
      return weathercode.value;
}