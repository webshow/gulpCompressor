var config = require('./config');
var express = require('express');
var multer = require('multer');
var fs = require('fs');
var moment = require('moment');
var spawn = require('child_process').spawn;
var http = require('http');

require('./wsserver');

var app = express();
app.use(express.static(__dirname + '/public'));
// upload
app.post('/upload', multer({dest: __dirname + '/source/'}).single('upfile'), function (req, res, next) {
    var clientId = req.body.clientId;
    var fileName = req.file.filename;
    var originalName = req.file.originalname;
    var path = req.file.path;
    var newShortName = '';
    var newName = originalName.replace(/(.*?)(\.\w+)$/, function (full, name, ext) {
        newShortName = name + moment().format("_YYYYMMDDHHmmss");
        return newShortName + ext;
    });
    var newPath = path.replace(fileName, newName);
    fs.rename(path, newPath, function (err) {
        if (err) throw err;
        var gulp = spawn('node', ['node_modules/gulp/bin/gulp.js', '--fileName=' + newShortName]);
        gulp.stdout.on('data', function (data) {
            sendWSMessage(clientId, data)
        });
        gulp.stderr.on('data', function (data) {
            sendWSMessage(clientId, data)
        });
        gulp.on('exit', function (code, signal) {
            var downloadName = newShortName + '.min.zip';
            var link = '<a href="/download?name=' + downloadName + '" target="_blank">' + downloadName + '</a>';
            var str = '压缩完成,点击下载文件:' + link;
            sendWSMessage(clientId, str);

            res.set('Content-Type', 'text/html');
            str = '<script>parent.downloadFile(\'' + str + '\');</script>';
            res.end(str);
        });
    });
});
// download
app.get('/download', function (req, res, next) {
    var fileName = req.query.name;
    if (!fileName) {
        res.end('请选择要下载的文件');
        return;
    }
    fs.readFile(__dirname + "/dist/" + fileName, function (err, data) {
        if (err) {
            res.end("文件未找到或已删除.");
        } else {
            res.setHeader('Content-disposition', 'attachment;filename=' + fileName);
            res.end(data)
        }
    });
});
// remove
app.get('/remove', function (req, res, next) {
    var fileName = req.query.name;
    if (!fileName) {
        res.end('请选择要删除的文件');
        return;
    }
    try {
        fs.unlink(__dirname + "/source/" + fileName.replace('.min', ''), function (err) {

        });
        fs.unlink(__dirname + "/dist/" + fileName, function (err) {

        });
        require('child_process').exec('rm -rf ' + (__dirname + "/dist/" + fileName.replace('.min.zip', '')), function (err) {

        });
    } catch (e) {
    }
    res.end('success');
});
// list
app.get('/list', function (req, res, next) {
    fs.readdir(__dirname + '/dist', function (err, files) {
        if (err) {
            res.end('');
        }
        var fileList = [];
        files.forEach(function (name) {
            if (name.indexOf('zip') != -1) {
                fileList.push({name: name});
            }
        });
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(fileList));
    });
});
app.listen(config.gulpServerPort, function () {
    console.log("gulp server is started.");
});


function filterMsg(msg) {
    return msg.toString().replace(/\n/g, '<br/>').replace('gulp-notify: [Gulp notification]', '');
}
function sendWSMessage(clientId, msg) {
    var dataStr = "clientId=" + clientId + "&msg=" + filterMsg(msg);
    var options = {
        host: '127.0.0.1',
        port: config.wsServerProxyPort,
        path: '/push',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(dataStr)
        }
    };
    var req = http.request(options, function (res) {});
    req.write(dataStr);
    req.end();
}