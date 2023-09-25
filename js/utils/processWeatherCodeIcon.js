import { weatherCodeData } from "../data/weatherCodeData.js";

function processWeatherCodes(code) {
      const weathercode = weatherCodeData.find(item => item.number == code)
      if (weathercode) {
        const iconSource = weathercode.src;
        return iconSource;
      } else {
        // Return fallback icon
        const iconSource = "/assets/icons/today.svg"
        return iconSource;
      }
}

export default processWeatherCodes;