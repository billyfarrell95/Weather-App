import { weatherCodeData } from "../data/weatherCodeData.js";

function processWeatherCodes(code) {
      const weathercode = weatherCodeData.find(item => item.number == code)

      if (weathercode) {
        return weathercode.value;
      } else {
        console.log(weathercode, "Weathercode not found")
        return "" // add a default or fallback here
      }
}

export default processWeatherCodes;