const fs = require('fs');
const path = require('path');
const JsZip = require('jszip');

const formatDate = () => {
    const completion = (t) => (t < 10 ? `0${t}` : t)
    const d = new Date();
    const year = d.getFullYear();
    const month = completion(d.getMonth() + 1);
    const xx = ['getDate', 'getHours', 'getMinutes', 'getSeconds'].map((item) => completion(d[item]())).join('-')
    return `${year}-${month}-${xx}`
}

// 读取目录及文件
function readDir(obj, nowPath, nowFolder) {
    // 读取目录中的所有文件及文件夹
    const files = fs.readdirSync(nowPath);
    files.forEach((fileName) => {
        // 遍历检测目录中的文件
        const fillPath = `${nowPath}/${fileName}`;
        const file = fs.statSync(fillPath);
        if (file.isDirectory()) {
            // 如果是目录的话，继续查询
            const folder = `${nowFolder}/${fileName}`;
            // 压缩对象中生成该目录
            const dirList = obj.folder(folder);
            // 重新检索目录文件
            readDir(dirList, fillPath, folder);
        } else {
            // 如果是文件压缩目录添加文件
            obj.file(fileName, fs.readFileSync(fillPath));
        }
    });
}

function startZip(outputPath) {
    const zip = new JsZip();
    const pathSep = path.sep
    const outputPathArr = outputPath.split(pathSep)
    const zipName = `${outputPathArr[outputPathArr.length - 1]}-${formatDate()}.zip`

    readDir(zip, outputPath, '');
    zip.generateAsync({
        type: 'nodebuffer',
        compression: 'DEFLATE',
        compressionOptions: {
            level: 9,
        },
    }).then((content) => {
        fs.writeFileSync(path.join(outputPath, zipName), content, 'utf-8');
        console.log('压缩完成');
    })
}

class WebpackBuildCompressPlugin {

    constructor(options={}) {}

    apply(compiler) {
        const pluginName = WebpackBuildCompressPlugin.name
        compiler.hooks.done.tap(pluginName, (stats) => {
            startZip(stats.compilation.compiler.outputPath)
        })
    }
}

module.exports = WebpackBuildCompressPlugin
