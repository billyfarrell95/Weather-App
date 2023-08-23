// Select UI Elements
const searchInputField = document.querySelector("#search-input");
const searchResultsWrapper = document.querySelector("#search-results-wrapper");

// Search input event listener
searchInputField.addEventListener("keyup", () => {
    // Empty string or 1 character returns empty result. 2 characters will match exact location. 3 or more characters will perform fuzzy matching
    if (searchInputField.value.length >= 2) {
        // Remove whitespace from search value
        const userInput = searchInputField.value.trim();
        
        fetchSearchResults(userInput);
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
            console.log("Search results response data:", data);
            fetchWeatherData(data)
        })

        .catch (error => {
            console.error("Error fetching search results", error)
        })
} 

async function fetchWeatherData(data) {
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
}