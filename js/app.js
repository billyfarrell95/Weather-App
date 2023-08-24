// Select UI Elements
const searchInputField = document.querySelector("#search-input");
const searchResultsList = document.querySelector("#search-results-list");
const currentWeatherWrapper = document.querySelector("#current-weather-wrapper");

// Search input event listener
searchInputField.addEventListener("keyup", () => {
    // Empty string or 1 character returns empty result. 2 characters will match exact location. 3 or more characters will perform fuzzy matching
    if (searchInputField.value.length >= 2) {
        // Remove whitespace from search value
        const userInput = searchInputField.value.trim();
        
        fetchSearchResults(userInput);
    }

    if (searchInputField.value.length < 2) {
        clearSearchResults();
    }
})

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
                console.log("Search results response data:", data);
                displaySearchResults(data)
            } else {
                // If there are no search results clear container (this prevents previous results from showing if characters that don't match are added to search string)
                clearSearchResults();
            }
        })

        .catch (error => {
            console.error("Error fetching search results", error)
        })
} 

// Handle displaying/updating search results
function displaySearchResults(data) {
    // Clear search results and re-render everytime function is called (keyup)
    clearSearchResults();

    // Loop through results
    for (let i = 0; i < data.results.length; i++) {
        
        const newResultLi = document.createElement("li"); // New search result item
        const newResult = data.results[i]; // Save the current new result (to pass to fetch function, if clicked)

        // Add click event listener to each search result. On click, pass the corresponding item to fetch
        newResultLi.addEventListener("click", (e) => {
            fetchCurrentWeather(newResult)
        })

        const name = data.results[i].name; // Location name
        const adminLevel1 = data.results[i].admin1; // Administrative area the location resides in
        const countryCode = data.results[i].country_code; // Country code

        // Check for values returned as "undefined", if so, exclude from search result text
        if (name != undefined) {
            newResultLi.innerText += name + ", ";
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

// Helper function - clear the search result <li> elements from the search results list
function clearSearchResults() {
    while (searchResultsList.firstChild) {
        searchResultsList.removeChild(searchResultsList.firstChild)
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

// Get current weather data (current and today's weather)
async function fetchCurrentWeather(selectedResult) {
    console.log(selectedResult, "selected result")

    // Latitude and Longitude of the selected result
    const lat = selectedResult.latitude;
    const lon = selectedResult.longitude;

    // Location name (from geocoding API fetch)
    const selectedResultName = selectedResult.name + ", " + selectedResult.admin1;
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
            console.log("CURRENT Weather response data:", data);
            clearSearchResults();
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
}