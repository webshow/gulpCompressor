$(function () {
    emcty.template('fileItemTemp',$('#fileItem').html());
    $.ajax({
        url:'/list',
        method:'get',
        success: function (data) {
            if(data.length==0)return;
            $('#fileList').html(emcty.render('fileItemTemp',data));
        }
    });
});