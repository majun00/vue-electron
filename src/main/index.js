import { app, BrowserWindow, globalShortcut, dialog, Menu, MenuItem, shell, ipcMain, Tray } from 'electron'
import path from 'path'
import fs from 'fs'
import os from 'os'

if (process.env.NODE_ENV !== 'development') {
    global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development' ?
    `http://localhost:9080` :
    `file://${__dirname}/index.html`

function createWindow() {
    // 新建窗口
    mainWindow = new BrowserWindow({
        height: 563,
        useContentSize: true,
        width: 1000
    })

    mainWindow.loadURL(winURL)

    mainWindow.on('closed', () => {
        mainWindow = null
    })
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow()
    }
})

app.on('ready', () => {
    createWindow()
})


// 上下文菜单
const menu = new Menu()
menu.append(new MenuItem({ label: 'Hello' }))
menu.append(new MenuItem({ type: 'separator' }))
menu.append(new MenuItem({ label: 'Electron', type: 'checkbox', checked: true }))

app.on('browser-window-created', (event, win) => {
    win.webContents.on('context-menu', (e, params) => {
        menu.popup(win, params.x, params.y)
    })
})

ipcMain.on('show-context-menu', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    menu.popup(win)
})


// 快捷键设置
app.on('ready', () => {
    globalShortcut.register('CommandOrControl+Alt+K', () => {
        dialog.showMessageBox({
            type: 'info',
            message: '成功!',
            detail: '你按下了一个全局注册的快捷键绑定.',
            buttons: ['好的']
        })
    })
})
app.on('will-quit', () => {
    globalShortcut.unregisterAll()
})


// 打开文件或目录
ipcMain.on('open-file-dialog', (event) => {
    dialog.showOpenDialog({
        properties: ['openFile', 'openDirectory']
    }, (files) => {
        if (files) {
            event.sender.send('selected-directory', files)
        }
    })
})

// 错误对话框
ipcMain.on('open-error-dialog', (event) => {
    dialog.showErrorBox('一条错误信息', '错误消息演示.')
})

// 信息对话框
ipcMain.on('open-information-dialog', (event) => {
    const options = {
        type: 'info',
        title: '信息',
        message: "这是一个信息对话框. 很不错吧？",
        buttons: ['是', '否']
    }
    dialog.showMessageBox(options, (index) => {
        event.sender.send('information-dialog-selection', index)
    })
})

// 保存对话框
ipcMain.on('save-dialog', (event) => {
    const options = {
        title: '保存图像',
        filters: [
            { name: 'Images', extensions: ['jpg', 'png', 'gif'] }
        ]
    }
    dialog.showSaveDialog(options, (filename) => {
        event.sender.send('saved-file', filename)
    })
})


// 托盘
let appIcon = null
ipcMain.on('put-in-tray', (event) => {
    const iconName = process.platform === 'win32' ? 'windows-icon.png' : 'iconTemplate.png'
    const iconPath = path.join(__dirname, iconName)
    appIcon = new Tray(iconPath)
    const contextMenu = Menu.buildFromTemplate([{
        label: '移除',
        click: () => {
            event.sender.send('tray-removed')
        }
    }])
    appIcon.setToolTip('在托盘中的 Electron 示例.')
    appIcon.setContextMenu(contextMenu)
})

ipcMain.on('remove-tray', () => {
    appIcon.destroy()
})

app.on('window-all-closed', () => {
    if (appIcon) appIcon.destroy()
})


// 异步消息
ipcMain.on('asynchronous-message', (event, arg) => {
    event.sender.send('asynchronous-reply', 'pong')
})

// 同步消息
ipcMain.on('synchronous-message', (event, arg) => {
    event.returnValue = 'pong'
})


// 获取应用信息
ipcMain.on('get-app-path', (event) => {
    event.sender.send('got-app-path', app.getAppPath())
})


// 打印到PDF
ipcMain.on('print-to-pdf', (event) => {
    const pdfPath = path.join(os.tmpdir(), 'print.pdf')
    const win = BrowserWindow.fromWebContents(event.sender)
    // 使用默认打印参数
    win.webContents.printToPDF({}, (error, data) => {
        if (error) throw error
        fs.writeFile(pdfPath, data, (error) => {
            if (error) throw error
            shell.openExternal(`file://${pdfPath}`)
            event.sender.send('wrote-pdf', pdfPath)
        })
    })
})


// 自定义菜单
let template = [{
    label: '编辑',
    submenu: [{
        label: '撤销',
        accelerator: 'CmdOrCtrl+Z',
        role: 'undo'
    }, {
        label: '重做',
        accelerator: 'Shift+CmdOrCtrl+Z',
        role: 'redo'
    }, {
        type: 'separator'
    }, {
        label: '剪切',
        accelerator: 'CmdOrCtrl+X',
        role: 'cut'
    }, {
        label: '复制',
        accelerator: 'CmdOrCtrl+C',
        role: 'copy'
    }, {
        label: '粘贴',
        accelerator: 'CmdOrCtrl+V',
        role: 'paste'
    }, {
        label: '全选',
        accelerator: 'CmdOrCtrl+A',
        role: 'selectall'
    }]
}, {
    label: '查看',
    submenu: [{
        label: '重载',
        accelerator: 'CmdOrCtrl+R',
        click: (item, focusedWindow) => {
            if (focusedWindow) {
                // 重载之后, 刷新并关闭所有之前打开的次要窗体
                if (focusedWindow.id === 1) {
                    BrowserWindow.getAllWindows().forEach(win => {
                        if (win.id > 1) win.close()
                    })
                }
                focusedWindow.reload()
            }
        }
    }, {
        label: '切换全屏',
        accelerator: (() => {
            if (process.platform === 'darwin') {
                return 'Ctrl+Command+F'
            } else {
                return 'F11'
            }
        })(),
        click: (item, focusedWindow) => {
            if (focusedWindow) {
                focusedWindow.setFullScreen(!focusedWindow.isFullScreen())
            }
        }
    }, {
        label: '切换开发者工具',
        accelerator: (() => {
            if (process.platform === 'darwin') {
                return 'Alt+Command+I'
            } else {
                return 'Ctrl+Shift+I'
            }
        })(),
        click: (item, focusedWindow) => {
            if (focusedWindow) {
                focusedWindow.toggleDevTools()
            }
        }
    }, {
        type: 'separator'
    }, {
        label: '应用程序菜单演示',
        click: function(item, focusedWindow) {
            if (focusedWindow) {
                const options = {
                    type: 'info',
                    title: '应用程序菜单演示',
                    buttons: ['好的'],
                    message: '此演示用于 "菜单" 部分, 展示如何在应用程序菜单中创建可点击的菜单项.'
                }
                dialog.showMessageBox(focusedWindow, options, function() {})
            }
        }
    }]
}, {
    label: '窗口',
    role: 'window',
    submenu: [{
        label: '最小化',
        accelerator: 'CmdOrCtrl+M',
        role: 'minimize'
    }, {
        label: '关闭',
        accelerator: 'CmdOrCtrl+W',
        role: 'close'
    }, {
        type: 'separator'
    }, {
        label: '重新打开窗口',
        accelerator: 'CmdOrCtrl+Shift+T',
        enabled: false,
        key: 'reopenMenuItem',
        click: () => {
            app.emit('activate')
        }
    }]
}, {
    label: '帮助',
    role: 'help',
    submenu: [{
        label: '学习更多',
        click: () => {
            shell.openExternal('http://electron.atom.io')
        }
    }]
}]

function addUpdateMenuItems(items, position) {
    if (process.mas) return

    const version = app.getVersion()
    let updateItems = [{
        label: `版本 ${version}`,
        enabled: false
    }, {
        label: '正在检查更新',
        enabled: false,
        key: 'checkingForUpdate'
    }, {
        label: '检查更新',
        visible: false,
        key: 'checkForUpdate',
        click: () => {
            require('electron').autoUpdater.checkForUpdates()
        }
    }, {
        label: '重启并安装更新',
        enabled: true,
        visible: false,
        key: 'restartToUpdate',
        click: () => {
            require('electron').autoUpdater.quitAndInstall()
        }
    }]

    items.splice.apply(items, [position, 0].concat(updateItems))
}

function findReopenMenuItem() {
    const menu = Menu.getApplicationMenu()
    if (!menu) return

    let reopenMenuItem
    menu.items.forEach(item => {
        if (item.submenu) {
            item.submenu.items.forEach(item => {
                if (item.key === 'reopenMenuItem') {
                    reopenMenuItem = item
                }
            })
        }
    })
    return reopenMenuItem
}

if (process.platform === 'darwin') {
    const name = app.getName()
    template.unshift({
        label: name,
        submenu: [{
            label: `关于 ${name}`,
            role: 'about'
        }, {
            type: 'separator'
        }, {
            label: '服务',
            role: 'services',
            submenu: []
        }, {
            type: 'separator'
        }, {
            label: `隐藏 ${name}`,
            accelerator: 'Command+H',
            role: 'hide'
        }, {
            label: '隐藏其它',
            accelerator: 'Command+Alt+H',
            role: 'hideothers'
        }, {
            label: '显示全部',
            role: 'unhide'
        }, {
            type: 'separator'
        }, {
            label: '退出',
            accelerator: 'Command+Q',
            click: () => {
                app.quit()
            }
        }]
    })

    // 窗口菜单.
    template[3].submenu.push({
        type: 'separator'
    }, {
        label: '前置所有',
        role: 'front'
    })

    addUpdateMenuItems(template[0].submenu, 1)
}

if (process.platform === 'win32') {
    const helpMenu = template[template.length - 1].submenu
    addUpdateMenuItems(helpMenu, 0)
}

app.on('ready', () => {
    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)

})

app.on('browser-window-created', () => {
    let reopenMenuItem = findReopenMenuItem()
    if (reopenMenuItem) reopenMenuItem.enabled = false
})

app.on('window-all-closed', () => {
    let reopenMenuItem = findReopenMenuItem()
    if (reopenMenuItem) reopenMenuItem.enabled = true
})