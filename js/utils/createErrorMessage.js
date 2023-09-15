function createErrorMessage(message) {
    const element = document.createElement("span");
    element.textContent = message;

    return element;
}

export default createErrorMessage;