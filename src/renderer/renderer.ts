// Sends information to the the process.
const sendToProcess = (eventType: string, ...data: any[]): Promise<void> => {
    return window.ipc.send(window, eventType, data);
}

// Handle events from the process.
const handleEvent = (eventType: string, data: any[]) => {
    switch (eventType) {
        case "path": {
            document.getElementById("spotify-path").innerText = data[0];
            break;
        }

        default: {
            console.warn("Uncaught message: " + eventType + " | " + data)
            break;
        }
    }
}

// Attach event handler.
window.ipc.on(window, (eventType: string, data: any[]) => {
    handleEvent(eventType, data);
});


sendToProcess("init");


document.getElementById("spotify-reboot").addEventListener('click', () => {
    sendToProcess("reboot")
})

