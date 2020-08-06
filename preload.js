const {
    ipcRenderer
} = require("electron");

//ipcRenderer for communicating with main script

// Code here will be executed before the document finishes loading.

// Quick exit pointer lock function

window.exitPointerLock = () => {
    document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;
    document.exitPointerLock();
}


document.addEventListener("keydown", event => {
    switch (event.key) {
        // By default escape key does not exit pointer lock so we must do it manually
        case "Escape":
            window.exitPointerLock()
            break;
    }
});

//"DOMContentLoaded"

window.addEventListener("DOMContentLoaded", () => {

    // Code here will be executed after the document finishes loading.

    var winPathname = window.location.pathname.toLowerCase();

    switch (winPathname) {
        case "/":
            var interval = setInterval(() => {
                if (window.importSettings !== undefined) {
                    // Keep old importSettings function
                    window.old_importSettings = window.importSettings;
                    // Refine it because prompt is not supported in electron
                    window.importSettings = () => {
                        ipcRenderer.send("showPromptWindow");
                        ipcRenderer.on("promptSubmitVal", function (event, arg) {
                            window.old_importSettings(arg);
                            return arg
                        });
                    }
                    clearInterval(interval)
                }
            }, 250);
            break;
    }
})