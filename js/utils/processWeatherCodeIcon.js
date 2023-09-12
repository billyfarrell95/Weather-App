import { weatherCodeData } from "../data/weatherCodeData.js";

function processWeatherCodes(code) {
      const weathercode = weatherCodeData.find(item => item.number == code)
      if (weathercode) {
        const iconSource = weathercode.src;
        return iconSource;
      } else {
        console.log(weathercode, iconSource, "Weathercode not found/can't set iconSource")
        return "" // add a default or fallback here
      }
}

export default processWeatherCodes;