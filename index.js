// Imports
const {
    app,
    BrowserWindow,
    session
} = require("electron");
const ipc = require("electron").ipcMain
// ipc for communicating with preload script
const url = require("url");
const path = require("path");
const os = require("os");
const fs = require("fs")
// Imports

var gameWindow,
    promptWindow,
    startWindow;

var gameCSS = "",
    socialCSS = "",
    viewerCSS = "",
    editorCSS = "";

// Create start window function
createStartWindow = () => {
    startWindow = new BrowserWindow({
        width: 640,
        height: 360,
        transparent: true,
        frame: false,
        show: false,
        skipTaskbar: true,
        darkTheme: true,
        center: true,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            devTools: false
        }
    });

    startWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'start.html'),
        protocol: 'file:',
        slashes: true
    }))

    startWindow.webContents.on("did-finish-load", () => {
        startWindow.show();
    });

    setTimeout(() => {
        fs.readFile(__dirname + "/css/game.css", "utf-8", function (err, data) {
            if (err) {
                console.error(err)
            }
            gameCSS = data;
            createGameWindow();
        });
    }, 1000); // adjust timeout to your liking 
}

// Create game window function
createGameWindow = () => {
    gameWindow = new BrowserWindow({
        width: 1600,
        height: 900,
        darkTheme: true,
        center: true,
        webPreferences: {
            nodeIntegration: false,
            webSecurity: false,
            preload: path.join(__dirname, "preload.js")
        }
    });

    gameWindow.loadURL("https://krunker.io/");

    gameWindow.webContents.on('dom-ready', function () {
        gameWindow.webContents.insertCSS(gameCSS);
    })
}

// Create prompt window function
createPromptWindow = () => {
    promptWindow = new BrowserWindow({
        width: 300,
        height: 157,
        transparent: true,
        frame: false,
        skipTaskbar: true,
        darkTheme: true,
        center: true,
        resizable: false,
        show: false,
        movable: false,
        webPreferences: {
            nodeIntegration: true,
            devTools: false
        }
    });

    promptWindow.loadURL(url.format({
        pathname: path.join(__dirname, "prompt.html"),
        protocol: "file:",
        slashes: true
    }))

    promptWindow.webContents.on("did-finish-load", () => {
        promptWindow.show();
    });

    ipc.on("promptSubmit", function (event, arg) {
        gameWindow.webContents.send("promptSubmitVal", arg)
    })
}

// Create Start Window
app.whenReady().then(() => {
    createStartWindow();
})

// So you can quit the app 
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit()
    }
})

// For MacOSX if you do not quit the application the app will still run
// This is if you click on the app icon while all windows are closed
app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createStartWindow();
    }
})

// Unlimited FPS
if ((os.cpus()[0].model.indexOf("AMD") > -1)) app.commandLine.appendSwitch("enable-zero-copy");
app.commandLine.appendSwitch("disable-frame-rate-limit");
app.commandLine.appendSwitch("enable-quic");
app.commandLine.appendSwitch("high-dpi-support", 1);
app.commandLine.appendSwitch("ignore-gpu-blacklist");

// Prompt window ipc

ipc.on("showPromptWindow", function (event, arg) {
    createPromptWindow();
});

// Run the script with npm start