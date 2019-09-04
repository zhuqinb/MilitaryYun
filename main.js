// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron')
const { autoUpdater } = require('electron-updater');
const fs = require('fs-extra')
const request = require('request')
const tar = require('tar')
const path = require('path')
let cp = require('child_process')

// 或者由主进程管理其他文件的变化 需要安装 'electron-reload'
// require('electron-reload')(__dirname, {
//   electron: require('electron'),
//   ignored: /node_modules|[\/\\]\./
// });

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
const feedUrl = `http://127.0.0.1:8089/${process.platform}`

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        frame: false,
        webPreferences: {
            webSecurity: false
        }
    })

    // and load the index.html of the app.
    mainWindow.loadFile('index.html')

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })

    const template = [{
            label: '文件',
            submenu: [
                { role: 'close', label: '退出' }
            ]
        },
        {
            label: '视图',
            submenu: [
                { role: 'reload', label: '重新加载' },
                { role: 'forcereload', label: '忽略缓存，重新加载当前窗口' },
                { type: 'separator' },
                { role: 'toggledevtools', label: '开发者工具' },
                { role: 'togglefullscreen', label: '全屏' }
            ]
        },
        {
            label: '帮助',
            submenu: [{
                label: '关于',
                click() { dialog.showMessageBox({ title: '关于iFlyViewer', message: '武汉地大信息工程股份有限公司\niFlyViewer: V1.5 \nSDK: V1.12.20181129 \nversion:' + app.getVersion() }) }
            }]
        }
    ]


    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)

}

let sendUpdateMessage = (message, data) => {
    mainWindow.webContents.send('message', { message, data })
}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {

    // let result = cp.execSync(`${}`)
    // let url = path.resolve(__dirname, 'assets/getMachine Code', 'GetMachineCode.exe')
    // let url = path.resolve(app.getAppPath(), 'assets', 'GetMachineCode.exe')
    // let url = path.resolve('C:\\Program Files\\MilitaryYun\\iFlyViewer\\resources\\app.asar\\assets\\GetMachineCode.exe')
    // let url = path.resolve('C:\\Program Files\\MilitaryYun\\iFlyViewer\\resources\\app.asar\\main.js')
    // let result = fs.readFileSync(url)
    // let result = cp.execSync('\"' + url + '\"')
    // cp.execFileSync('\"' + url + '\"')

    // path.resolve(app.getAppPath(), '..')
    // console.log
    // console.log(result.toString('utf-8'))

    createWindow()

    ipcMain.on('anastole', e => mainWindow.minimize())

    ipcMain.on('minimize', e => {
        if (mainWindow.isMaximized()) {
            mainWindow.unmaximize()
        } else {
            mainWindow.maximize()
        }
    })

    ipcMain.on('close', e => mainWindow.close());

    // 通过渲染进程尺寸的变化，判读是否为全屏
    ipcMain.on('window-resize', e => {
        console.log('ipc window-resize')
        if (mainWindow.isMaximized()) {
            sendUpdateMessage('isMaximized', true)
        } else {
            sendUpdateMessage('isMaximized', false)
        }
    })
    console.log(app.getVersion())

    setTimeout(checkForUpdates, 10000);


})

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', function() {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.



let checkForUpdates = () => {
    // hotUpdate()
    autoUpdater.setFeedURL(feedUrl)

    //当有新版本时不要自动下载
    autoUpdater.autoDownload = false

    autoUpdater.on('error', function(message) {
        message.id = 'error'
        sendUpdateMessage('error', message)
    })

    //检测是否有更新
    autoUpdater.on('checking-for-update', function(message) {
        sendUpdateMessage('checking-for-update', message)
    })

    // 当有更新的时候走这里
    autoUpdater.on('update-available', function(message) {
        sendUpdateMessage('isUpdateNow', message)

        const localVersion = app.getVersion()
        const lineVersion = message.version
        ipcMain.on('updateNow', (e, arg) => {
            hotUpdate(localVersion, lineVersion)
        })
    })

    // 当没有更新的时候走这里
    autoUpdater.on('update-not-available', function(message) {
        sendUpdateMessage('update-not-available', message)
    })

    //更新下载进度事件
    autoUpdater.on('download-progress', function(progressObj) {
        sendUpdateMessage('download-progress', progressObj)
    })

    // 下载完成走这里
    autoUpdater.on('update-downloaded', function(message) {
        sendUpdateMessage('update-completes', message)
        autoUpdater.quitAndInstall()
    })

    //向服务端查询现在是否有可用的更新
    autoUpdater.checkForUpdates()
}

let hotUpdate = (localVersion, lineVersion) => {

    //判断是否需要(部分)更新
    const shouldUpdate = isUpdate(localVersion, lineVersion)
    //需要则更新
    if (shouldUpdate) {
        sendUpdateMessage('shouldPartUpdate', 'shouldPartUpdate')
        //通知UI 

        //进行IO读写 (读写完进行替换)
        copyFiles()
            .then(message => {
                //告知UI是否需要进行替换


                //替换 则刷新页面
                mainWindow.webContents.reload()


                //暂时不替换，则通知UI怎么显示
            })
            .catch(err => {
                sendUpdateMessage('error1', err)
            })
    } else {
        //不需要这放行 (全部更新)
        sendUpdateMessage('shouldAllUpdate', 'shouldAllUpdate')
        autoUpdater.downloadUpdate()

    }


    function isUpdate(localVersion, lineVersion) {
        const [, localLarger, localLesser] = localVersion.split('.')
        const [, lineLarger, lineLesser] = lineVersion.split('.')
        if (Number(lineLarger) <= Number(localLarger) && lineLesser - localLesser > 0) {
            return true
        }
        return false
    }

    function copyFiles() {
        return new Promise((resolve, reject) => {
            request({
                url: feedUrl + '/update.tar.gz',
                encoding: null
            }, (error, res, body) => {
                try {
                    if (error || res.statusCode !== 200) {
                        throw '请求失败'
                    }
                    //保存到临时目录， temp 为Electron 用户可写目录
                    // let tempPath = app.getPath('temp')
                    let dir = fs.mkdtempSync(app.getPath('temp'))
                    // 创建Buffer流并解压
                    let stream = new require('stream').Readable()
                    stream.push(body)
                    stream.push(null)
                    stream.pipe(tar.extract({
                        sync: true,
                        cwd: dir
                    })).on('close', () => {
                        // 解压完毕，复制更新文件
                        sendUpdateMessage('appPath', path.resolve(app.getAppPath(), '..'))
                        fs.copySync(dir, path.resolve(app.getAppPath(), '..')) // 解压至指定的目录，这里用 __dirname 为例
                        // 删除临时目录
                        fs.removeSync(dir)
                        // 返回true表示需要重启
                        resolve(true)
                    })
                } catch (error) {
                    reject('更新文件下载失败， 请联系管理员' + error)
                }
            })
        })
    }
}