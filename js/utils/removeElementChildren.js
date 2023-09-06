function removeAllElementChildren(item) {
    while (item.firstChild) {
        item.removeChild(item.firstChild)
    }
}

export default removeAllElementChildren;