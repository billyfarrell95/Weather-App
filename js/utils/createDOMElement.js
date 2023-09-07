function createDOMElement(tagName, classes, textContent) {
    const element = document.createElement(tagName);
    if (textContent !== undefined) {
        element.textContent = textContent;
    }
    if (classes !== undefined) {
        element.className = classes;
    }
    return element;
}

export default createDOMElement;