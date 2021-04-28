const {
  app,
  BrowserWindow,
  ipcMain
} = require('electron')
const url = require("url");
const path = require("path");

let appWindow

function initWindow() {
  appWindow = new BrowserWindow({
    height: 800,
    width: 1675,
    icon: 'src/favicon.ico',
    webPreferences: {
      nodeIntegration: true,
      webSecurity:false,
    }
  })

  ipcMain.on('createWindow',(event, arg)=>{
    childWindow = createChildWindow(event);
    childWindow.on('closed', function(){
      childWindow = null
      event.sender.send('shouldChildWindowClose')
    })
  })

  ipcMain.on('closeChildWindowLogout', (event, arg) => {
    childWindow.close()
    childWindow = null
  })


  // Electron Build Path
  appWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, `/dist/client/index.html`),
      protocol: "file:",
      slashes: true
    })
  );

  appWindow.setMenuBarVisibility(true)

  appWindow.setResizable(false)

  // Initialize the DevTools.
  // appWindow.webContents.openDevTools()

  appWindow.on('closed', function () {
    appWindow = null
  })
}

app.on('ready', initWindow)

// Close when all windows are closed.
app.on('window-all-closed', function () {

  // On macOS specific close process
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (win === null) {
    initWindow()
  }
})

function createChildWindow(event){
  childWindow = new BrowserWindow({
    width:360,
    height: 718,
    icon: 'src/favicon.ico',
    webPreferences:{
      webSecurity:false,
      nodeIntegration:true
    }
  })
   
   childWindow.loadURL(
     'file://' + __dirname + `/dist/client/index.html#/chat`
  );

  return childWindow
}
