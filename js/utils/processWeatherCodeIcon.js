function processWeatherCodes(code) {
    const weatherCodeValues = [
        { number: 0, value: "Clear sky", src: "/assets/weather-icons/clear-sky.svg" },
        { number: 1, value: "Mainly clear", src: "/assets/weather-icons/mainly-clear.svg" },
        { number: 2, value: "Partly cloudy", src: "/assets/weather-icons/partly-cloudy.svg"  },
        { number: 3, value: "Overcast", src: "/assets/weather-icons/overcast.svg"  },
        { number: 45, value: "Fog", src: "/assets/weather-icons/fog.svg"  },
        { number: 48, value: "Depositing Rime Fog", src: "/assets/weather-icons/fog-rime.svg"  },
        { number: 51, value: "Drizzle: Light intensity", src: "/assets/weather-icons/drizzle-light.svg"  },
        { number: 53, value: "Drizzle: Moderate intensity", src: "/assets/weather-icons/drizzle-moderate.svg"  },
        { number: 55, value: "Drizzle: Dense intensity", src: "/assets/weather-icons/drizzle-dense.svg"  },
        { number: 56, value: "Freezing Drizzle: Light intensity", src: "/assets/weather-icons/drizzle-freezing-light.svg"  },
        { number: 57, value: "Freezing Drizzle: Dense intensity", src: "/assets/weather-icons/drizzle-freezing-dense.svg"  },
        { number: 61, value: "Rain: Slight intensity", src: "/assets/weather-icons/rain-slight.svg"  },
        { number: 63, value: "Rain: Moderate intensity", src: "/assets/weather-icons/rain-moderate.svg"  },
        { number: 65, value: "Rain: Heavy intensity", src: "/assets/weather-icons/rain-heavy.svg"  },
        { number: 66, value: "Freezing Rain: Light intensity", src: "/assets/weather-icons/rain-freezing-light.svg"  },
        { number: 67, value: "Freezing Rain: Heavy intensity", src: "/assets/weather-icons/rain-freezing-heavy.svg"  },
        { number: 71, value: "Snow fall: Slight intensity", src: "/assets/weather-icons/snow-slight.svg"  },
        { number: 73, value: "Snow fall: Moderate intensity", src: "/assets/weather-icons/snow-moderate.svg"  },
        { number: 75, value: "Snow fall: Heavy intensity", src: "/assets/weather-icons/snow-heavy.svg"  },
        { number: 77, value: "Snow grains", src: "/assets/weather-icons/snow-grains.svg" },
        { number: 80, value: "Rain showers: Slight intensity", src: "/assets/weather-icons/rain-shower-slight.svg"  },
        { number: 81, value: "Rain showers: Moderate intensity", src: "/assets/weather-icons/rain-shower-moderate.svg"  },
        { number: 82, value: "Rain showers: Violent intensity", src: "/assets/weather-icons/rain-shower-violent.svg"  },
        { number: 85, value: "Snow showers: Slight intensity", src: "/assets/weather-icons/snow-shower-slight.svg"  },
        { number: 86, value: "Snow showers: Heavy intensity", src: "/assets/weather-icons/snow-shower-heavy.svg"  },
        { number: 95, value: "Thunderstorm: Slight or moderate", src: "/assets/weather-icons/thunderstorm.svg"  },
        { number: 96, value: "Thunderstorm with slight hail", src: "/assets/weather-icons/thunderstorm-slight-hail.svg"  },
        { number: 99, value: "Thunderstorm with heavy hail", src: "/assets/weather-icons/thunderstorm-heavy-hail.svg"  }
      ];

      const weathercode = weatherCodeValues.find(item => item.number == code)
    
      if (weathercode) {
        const iconSource = weathercode.src;
        return iconSource;
      } else {
        console.log(weathercode, iconSource, "Weathercode not found/can't set iconSource")
        return "" // add a default or fallback here
      }
}

export default processWeatherCodes;