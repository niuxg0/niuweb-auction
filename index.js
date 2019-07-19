const { app, ipcMain, BrowserWindow, shell, dialog, nativeImage, Menu, MenuItem } = require('electron')
const fs = require('fs')
const os = require('os')
const path = require('path')

const dev = false
const origin = "http://localhost:8081/"

ipcMain.on('delegation.print', (event, staffs) => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    },
  })
  if (dev) {
    win.webContents.openDevTools()
    win.loadURL(origin + 'index.html#/print/delegation/' + encodeURIComponent(JSON.stringify(staffs))) 
  } else {
win.webContents.openDevTools()
    win.loadFile('index.html')
    win.loadURL('#/print/delegation/' + encodeURIComponent(JSON.stringify(staffs)))
  }
})

ipcMain.on('print', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  win.webContents.printToPDF(
    {
      printBackground: true
    },
    (err, data) => {
      const file = path.join(os.tmpdir(), 'print.pdf')
      fs.writeFile(file, data, (error) => {
        shell.openExternal('file://' + file)
      })
      //win.close()
      //win.destroy()
    }
  )
  event.returnValue = 'finish'
})

ipcMain.on('openDirectory', (event) => {
  event.returnValue = dialog.showOpenDialog({ properties: ['openDirectory'] })
})

ipcMain.on('readDirectory', (event, path) => {
  event.returnValue = fs.readdirSync(path, { withFileTypes: true })
})

ipcMain.on('copyFile', async (event, fromPath, from, toPath, to, compressSize) => {
  try {
    if (compressSize === 0) {
      fs.copyFileSync(path.join(fromPath, from), path.join(toPath, to), fs.constants.COPYFILE_EXCL)
    } else {
      const orderSize = compressSize * 1024
      const input = fs.readFileSync(path.join(fromPath, from))
      if (input.length > orderSize) {
        const image = nativeImage.createFromBuffer(input)
        let quality = 110
        let output = null
        do {
          quality-= 10
          output = image.toJPEG(quality)
        } while (output.length > orderSize && quality > 0)
        fs.writeFileSync(path.join(toPath, to), output)
      } else {
        fs.writeFileSync(path.join(toPath, to), input)
      }
    }
    event.returnValue = { status: 1 }
  } catch (err) {
    event.returnValue = { status: 2, message: err }
  }
})

console.log('niu auction start')

let mainWindow = null

function createWindow() {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 800,
    webPreferences: {
      nodeIntegration: true
    },
  })

  if (dev) {
    mainWindow.loadURL(origin + 'index.html')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile('index.html')
  }
}

const template = [
  // { role: 'appMenu' }
  ...(process.platform === 'darwin' ? [{
    label: app.getName(),
    submenu: [
      { label: `关于 ${app.getName()}`, role: 'about' },
      { type: 'separator' },
      { label: `服务`, role: 'services' },
      { type: 'separator' },
      { label: `隐藏 ${app.getName()}`, role: 'hide' },
      { label: `隐藏其他应用程序`, role: 'hideothers' },
      { label: `显示全部`, role: 'unhide' },
      { type: 'separator' },
      { label: `退出 ${app.getName()}`, role: 'quit' }
    ]
  }] : []),
  // { role: 'fileMenu' }
  {
    label: '文件',
    submenu: [
      {
        label: `返回首页`,
        click: () => {
          if (dev) {
            mainWindow.loadURL(origin + 'index.html')
          } else {
            mainWindow.loadFile('index.html')
          }
        }
      },
      { label: `刷新`, role: 'reload' },
      { type: 'separator' },
      { label: `退出 ${app.getName()}`, role: 'quit' }
    ]
  },
  // { role: 'viewMenu' }
  {
    label: '窗口',
    submenu: [
      { label: `实际大小`, role: 'resetzoom' },
      { label: `放大`, role: 'zoomin' },
      { label: `缩小`, role: 'zoomout' },
      { type: 'separator' },
      { label: `进入 / 退出全屏幕`, role: 'togglefullscreen' }
    ]
  },
  {
    label: '帮助',
    role: 'help',
    submenu: [
      { label: `关于 ${app.getName()}`, role: 'about' },
      {
        label: '关于 牛尾巴',
        click() { require('electron').shell.openExternalSync('https://www.niuweb.com.cn') }
      }
    ]
  }
]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)

app.on('ready', createWindow)
