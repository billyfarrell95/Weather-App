// Select UI Elements
const searchInputField = document.querySelector("#search-input");
const searchResultsList = document.querySelector("#search-results-list");

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

function clearSearchResults() {
    while (searchResultsList.firstChild) {
        searchResultsList.removeChild(searchResultsList.firstChild)
    }
}

async function fetchCurrentWeather(selectedResult) {
    console.log(selectedResult, "selected result")

    // Latitude and Longitude of the selected result
    const lat = selectedResult.latitude;
    const lon = selectedResult.longitude;
    // Current weather data endpoint URL
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relativehumidity_2m,apparent_temperature,weathercode,windspeed_10m,winddirection_10m&daily=weathercode,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,uv_index_max,precipitation_sum,precipitation_probability_max&temperature_unit=fahrenheit&windspeed_unit=mph&precipitation_unit=inch&timeformat=unixtime&timezone=auto&forecast_days=1`;
    
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
            renderCurrentWeather(data)
        })

        .catch (error => {
            console.error("Error fetching CURRENT weather data:", error)
        })
}