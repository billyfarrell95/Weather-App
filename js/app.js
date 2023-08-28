// Select UI Elements
const searchInputField = document.querySelector("#search-input");
const searchInputWrapper = document.querySelector("#search-input-wrapper");
const searchResultsWrapper = document.querySelector("#search-results-wrapper")
const searchResultsList = document.querySelector("#search-results-list");
const currentWeatherWrapper = document.querySelector("#current-weather-wrapper");
const useCurrentLocationButton = document.querySelector("#current-location-button");
const quickSearchWrapper = document.querySelector("#quick-search-wrapper"); // The element that holds the quick search buttons

// Quick search location latitudes and longitudes
const quickSearchItems = [
    {
        "city": "Los Angeles",
        "state": "California",
        "lat": "34.0522",
        "lon": "-118.2437"
    },
    {
        "city": "Denver",
        "state": "Colorado",
        "lat": "39.7392",
        "lon": "-104.9847"
    },
    {
        "city": "Chicago",
        "state": "Illinois",
        "lat": "41.85",
        "lon": "-87.65"
    },
    {
        "city": "New York City",
        "state": "New York",
        "lat": "40.7143",
        "lon": "-74.006"
    },
];

document.addEventListener("DOMContentLoaded", fetchQuickSearchButtonData(quickSearchItems));

// Handle showing and hiding the search results when the field is/isn't active
document.addEventListener("click", () => {
    if (document.activeElement == searchInputField) {
        /* console.log("input wrapper is active"); */
        searchResultsWrapper.style.display = ""
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
})

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
    // Call fetchCurrentWeather with the first param (the result the user would click on in displaySearchResults function)
    reverseGeocode(position.coords.latitude, position.coords.longitude);
    /* fetchCurrentWeather(null, position.coords.latitude, position.coords.longitude) */
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

            /* console.log(locationName, adminLevel1) */
            fetchCurrentWeather(locationName, adminLevel1, lat, lon)
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
        
        const newResultLi = document.createElement("li"); // New search result item
        /* const newResult = data.results[i]; // Save the current new result (to pass to fetch function, if clicked) */
        const locationName = data.results[i].name; // Select the location name and pass to fetchCurrentWeather
        const adminLevel1 = data.results[i].admin1; // Select the 1st hierarchical admin area (state, etc)
        const lat = data.results[i].latitude;
        const lon = data.results[i].longitude;

        // Add click event listener to each search result. On click, pass the corresponding item to fetch
        newResultLi.addEventListener("click", () => {
            /* fetchCurrentWeather(newResult) */
            fetchCurrentWeather(locationName, adminLevel1, lat, lon)
        })

        //const name = data.results[i].name; // Location name
        //const adminLevel1 = data.results[i].admin1; // Administrative area the location resides in
        const countryCode = data.results[i].country_code; // Country code

        // Check for values returned as "undefined", if so, exclude from search result text
        if (locationName != undefined) {
            newResultLi.innerText += locationName + ", ";
        }

        if (adminLevel1 != undefined) {
            newResultLi.innerText += adminLevel1 + ", ";
        }

        if (countryCode != undefined) {
            newResultLi.innerText += countryCode;
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
function getCurrent12HourTime() {
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

// Get current weather data (current and today's weather)
async function fetchCurrentWeather(locationName, adminLevel1, lat, lon) {

    // Defined and check the result name for null values before 
    let selectedResultName;
    if (locationName !== null && adminLevel1 !== null) {
        selectedResultName = locationName + ", " + adminLevel1
    } else if (locationName !== null && adminLevel1 == null) {
        selectedResultName = locationName;
    } else if (locationName == null && adminLevel1 !== null) {
        selectedResultName = adminLevel1;
    }

    // Current weather data endpoint URL
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=fahrenheit&windspeed_unit=mph&precipitation_unit=inch&timeformat=unixtime&forecast_days=1&timezone=auto`
    
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
            removeAllElementChildren(searchResultsList);
            removeAllElementChildren(currentWeatherWrapper)
            searchInputField.value = "";
            renderCurrentWeather(data, selectedResultName);
        })

        .catch (error => {
            console.error("Error fetching CURRENT weather data:", error)
        })
}

function renderCurrentWeather(data, selectedName) {
    // Create UI layout elements
    const dataWrapper = document.createElement("div");
    const leftCol = document.createElement("div");
    const rightCol = document.createElement("div");
    const temperatureWrapper = document.createElement("div");

    // Create UI Data elements
    const locationNameEl = document.createElement("h2");
    const titleEl = document.createElement("p");
    const timeEl = document.createElement("p");
    const iconEl = document.createElement("img");
    const tempEl = document.createElement("p");
    const weathercodeEl = document.createElement("p");
    const apparentTempEl = document.createElement("p");
    const windEl = document.createElement("p");

    // Assign values to UI Data Elements
    locationNameEl.innerText = selectedName; // Pulls selected name from geocoding fetch selectedResult in fetchCurrentWeather()
    titleEl.innerText = "Current Weather";
    timeEl.innerText = getCurrent12HourTime(); // Returns new time in 12 hour format
    iconEl.setAttribute("src", "https://placehold.co/50x50"); // placeholder
    tempEl.innerText = "Temperature:" + data.current_weather.temperature;
    weathercodeEl.innerText = "Weather Code:" + data.current_weather.weathercode;
    windEl.innerText = "Wind Direction:" + data.current_weather.winddirection + " " + "Wind Speed:" + data.current_weather.windspeed;

    // Append items to UI Layout Elements and DOM
    currentWeatherWrapper.append(locationNameEl);
    dataWrapper.append(leftCol);
    leftCol.append(titleEl);
    leftCol.append(timeEl);
    leftCol.append(temperatureWrapper);
    temperatureWrapper.append(iconEl);
    temperatureWrapper.append(tempEl);
    leftCol.append(weathercodeEl);
    dataWrapper.append(rightCol);
    rightCol.append(apparentTempEl);
    rightCol.append(windEl);
    currentWeatherWrapper.append(dataWrapper);

    // Add the button to view the forecast for current location
    createViewForecastButton(data.latitude, data.longitude);

    console.log("data after renderCurrentWeather", data)
}

// Fetch the data for the quick search buttons
async function fetchQuickSearchButtonData(quickSearchItems) {
    for (let i = 0; i < quickSearchItems.length; i++) {

        const lat = quickSearchItems[i].lat;
        const lon = quickSearchItems[i].lon;

        /* console.log(lat, "lat in fetchQuickSearch") */

        // Current weather data endpoint URL
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=fahrenheit&timeformat=unixtime&forecast_days=1&timezone=auto`;
        
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
                const currentButton = quickSearchWrapper.children[i];
                const currentQuickTemp = currentButton.querySelector(".quick-temp");
                currentQuickTemp.innerText = data.current_weather.temperature;
            })

            .catch (error => {
                console.error("Error fetching quick search weather data:", error)
            })
    }
}

function createViewForecastButton(lat, lon) {
    const viewForecastButton = document.createElement("button");
    viewForecastButton.innerText = "View 7-Day Forecast";
    currentWeatherWrapper.append(viewForecastButton);

    viewForecastButton.addEventListener("click", () => {
        viewForecast(lat, lon);
    })
}

async function viewForecast(lat, lon) {
    // Forecast endpoint for current location based on lat/lon of the "Current Weather"
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,apparent_temperature,precipitation_probability,weathercode,windspeed_10m,winddirection_10m&temperature_unit=fahrenheit&windspeed_unit=mph&precipitation_unit=inch&timeformat=unixtime&timezone=auto`
    
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
            console.log("FORECAST data for current location", data);
        })

        .catch (error => {
            console.error("Error fetching FORECAST weather data:", error)
        })
}