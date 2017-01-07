/**
 * Created by aohailin on 16/4/23.
 */
$(function () {
    var messageBox = $('#messageBox');
    var clientId = 'client_' + Math.random();
    $('#clientId').val(clientId);
    $('#uploadForm').submit(function () {
        var value = $('#uploadFile').val();
        if (value == '') {
            alert('请选择待压缩文件');
            return false;
        }
        if (!/\.zip$/i.test(value)) {
            alert('文件格式不正确,请选择zip文件');
            return false;
        }
        messageBox.html('文件正在上传,请耐心等待!');
        return true;
    });
    function showMsg(str){
        messageBox.append('<p>' + str + '</p>');
    }
    var ws = null;
    function createWS() {
        ws = new WebSocket('ws://' + location.hostname + ':3002/');
        ws.onopen = function (evt) {
            ws.send(clientId);
        };
        ws.onclose = function (evt) {
            console.log('closed');
        };
        ws.onmessage = function (evt) {
            showMsg(evt.data);
        };
        ws.onerror = function (evt) {
            console.log('Error occured: ' + evt.data);
        };
    }
    window.downloadFile = function (str) {
        $('#downloadFile').html(str)
    };
    if (!WebSocket) {
        alert('您的浏览器不支持webSocket,建议使用chrome提高体验.');
    } else {
        createWS();
    }
});