import createDOMElement from "./createDOMElement.js";

function createErrorMessage(errorMessageType, errorCode) {
    console.log(errorMessageType, errorCode)
    // Error Messages
    const errorMessages = {
        generic: {
          default: "An unexpected error occurred. Please try again later.",
          refresh: "Oops! Something went wrong. Please refresh the page and try again.",
        },
        
        location: {
          accessFailed: "Failed to retrieve location. Please check your device settings and try again.",
          accessDenied: "Location Access Denied: You have denied access to your precise location. We attempted to provide a generalized location, but it couldn't be determined. Your exact location is not being used.",
        },
      
        weather: {
          fetchFailed: "Failed to fetch weather data. Please check your internet connection and try again.",
          dataInvalid: "The weather data received is invalid. Please try again later.",
          locationNotFound: "Location not found. Please check the location and try again.",
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
    
        case "location":
          switch (errorCode) {
            case "accessFailed":
                errorMessage = errorMessages.location.accessFailed;
                break;
            case "accessDenied":
                errorMessage = errorMessages.location.accessDenied;
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
            case "locationNotFound":
                errorMessage = errorMessages.weather.locationNotFound;
                break;
            default:
                errorMessage = "Unknown error code.";
          }
          break;
    
        default:
            errorMessage = "Unknown error message type.";
      }

      if (errorMessage) {
        const errorMessageElement = createDOMElement("span", "error-message", errorMessage);
        return errorMessageElement;
      }
}

export default createErrorMessage;