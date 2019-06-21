const { app, BrowserWindow } = require('electron')
const { ipcMain } = require('electron')

ipcMain.on('niu_auction', (event, _message) => {
  const message = _message.split(".")
  switch(message[0]) {
    case "Delegate":
      switch(message[1]) {
        case "List":
          event.returnValue = [{ id: 1 }, { id: 2 }]
      }
      break
  }
})

console.log('niu auction start')

function createWindow() {
  // 创建浏览器窗口
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    },
  })

  // 加载index.html文件
  win.loadURL('http://localhost:8081/index.html')
  // win.loadFile('index.html')

  win.webContents.openDevTools()
}

app.on('ready', createWindow)