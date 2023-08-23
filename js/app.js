// Select UI Elements
const searchInputField = document.querySelector("#search-input");
const searchResultsList = document.querySelector("#search-results-wrapper ul");

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

/* async function fetchWeatherData(data) {
    // Weather data endpoint URL
    const lat = data.results[0].latitude;
    const lon = data.results[0].longitude;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&&daily=weathercode&timezone=America%2FChicago`;
    
    fetch (url)
        .then (response => {
            // check response status
            if (!response.ok) {
                throw new Error ("Error fetching weather data")
            }

            // Return promise
            return response.json()
        })

        .then (data => {
            console.log("Weather response data:", data)
        })

        .catch (error => {
            console.error("Error fetching weather data:", error)
        })
} */