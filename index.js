const { app, ipcMain, BrowserWindow, shell, dialog, nativeImage, Menu, MenuItem } = require('electron')
const fs = require('fs')
const os = require('os')
const path = require('path')
const child_process = require('child_process')
const exceljs = require('exceljs')

const dev = false
const origin = "http://localhost:8080/"

ipcMain.on('delegation.export', (event, name, data) => {
  const filename = dialog.showSaveDialog({ defaultPath: `${name}.xlsx` })
  console.log('filename', filename)
  if (filename === undefined) {
    event.returnValue = 'cancel'
    return
  }
  const workbook = new exceljs.Workbook()
  workbook.creator = 'NiuAuction'
  const sheet = workbook.addWorksheet('工作表')
  sheet.columns = [
    {
      header: 'Lot号',
      key: 'lot',
      width: 10,
      style: {
        alignment: {
          vertical: 'middle',
          horizontal: 'right'
        }
      }
    },
    {
      header: '办牌人',
      key: 'delegation_number',
      width: 10,
      style: {
        alignment: {
          vertical: 'middle',
          horizontal: 'right'
        }
      }
    },
    {
      header: '',
      key: 'delegation_name',
      width: 15,
      style: {
        alignment: {
          vertical: 'middle',
          horizontal: 'left'
        }
      }
    },
    {
      header: '',
      key: 'delegation_phone',
      width: 20,
      style: {
        alignment: {
          vertical: 'middle',
          horizontal: 'left'
        }
      }
    },
    {
      header: '工作人员',
      key: 'staff',
      width: 15,
      style: {
        alignment: {
          vertical: 'middle',
          horizontal: 'left'
        }
      }
    }
  ]

  sheet.addRow({ lot: '', delegation_number: '牌号', delegation_name: '姓名', delegation_phone: '电话', staff: '' })

  sheet.mergeCells('B1:D1')
  sheet.mergeCells('A1:A2')
  sheet.mergeCells('E1:E2')

  sheet.getCell('B1').alignment.horizontal = 'center'

  sheet.addRows(data)

  workbook.xlsx.writeFile(filename)

  if (os.platform() === 'darwin') {
    child_process.exec(`open ${filename}`)
  } else if (os.platform() === 'win32') {
    child_process.exec(`explorer.exe /select, "${filename}"`)
  }

  event.returnValue = 'finish'
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
      { label: `全选`, role: 'selectAll' },
      { label: `剪切`, role: 'cut' },
      { label: `复制`, role: 'copy' },
      { label: `粘贴`, role: 'paste' },
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
