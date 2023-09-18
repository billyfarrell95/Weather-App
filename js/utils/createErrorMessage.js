import createDOMElement from "./createDOMElement.js";

function createErrorMessage(errorMessageType, errorCode) {
    console.log(errorMessageType, errorCode)
    // Error Messages
    const errorMessages = {
        generic: {
          default: "An unexpected error occurred. Please try again later.",
          refresh: "Oops! Something went wrong. Please refresh the page and try again.",
        },

        network: {
          general: "Network error: Unable to fetch data. Please check your internet connection or try again later.",
        },
        
        location: {
          accessFailed: "Failed to retrieve location. Please check your device settings and try again.",
          accessDenied: "Location Access Denied: You have denied access to your precise location. We attempted to provide a generalized location, but it couldn't be determined. Your exact location is not being used.",
          invalidLocationData: "We encountered an issue with the location data that was received. Please check your device settings or try again later.",
        },
      
        weather: {
          fetchFailed: "Oops! We failed to fetch the weather for the requested location. Please try again later.",
          dataInvalid: "The weather data received is invalid. Please try again later.",
          fetchFailedUnexpected: "Oops! We failed to fetch the weather for the requested location. Please try again later.",
        },
      };

      let errorMessage;
      
      switch (errorMessageType) {
        case "generic":
          switch (errorCode) {
            case "default":
                errorMessage = errorMessages.generic.default;
                break;
            case "refresh":
                errorMessage = errorMessages.generic.refresh;
                break;
            default:
                errorMessage = "Unknown error code.";
          }
          break;

        case "network":
          switch (errorCode) {
            case "general":
                errorMessage = errorMessages.network.general;
                break;
            default:
                errorMessage = errorMessages.generic.default;
          }
        break;
    
        case "location":
          switch (errorCode) {
            case "accessFailed":
                errorMessage = errorMessages.location.accessFailed;
                break;
            case "accessDenied":
                errorMessage = errorMessages.location.accessDenied;
                break;
            case "invalidLocationData":
                errorMessage = errorMessages.location.invalidLocationData;
                break;
            default:
                errorMessage = "Unknown error code.";
          }
          break;
    
        case "weather":
          switch (errorCode) {
            case "fetchFailed":
                errorMessage = errorMessages.weather.fetchFailed;
                break;
            case "dataInvalid":
                errorMessage = errorMessages.weather.dataInvalid;
                break;
            case "fetchFailedUnexpected":
                errorMessage = errorMessages.weather.fetchFailedUnexpected;
                break;
            default:
                errorMessage = "Unknown error code.";
          }
          break;
    
        default:
            errorMessage = "Unknown error message type.";
      }

      if (errorMessage) {
        const element = createDOMElement("span", "error-message", errorMessage);
        return {element, errorMessage};
      }
}

export default createErrorMessage;