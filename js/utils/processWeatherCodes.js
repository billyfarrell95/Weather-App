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

export default processWeatherCodes;