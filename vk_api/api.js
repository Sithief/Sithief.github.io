var access_token = '';
var version = '5.103';

function readCookie() {
    var cookieName = "access_token=";
    var docCookie = document.cookie;
    if (docCookie.length > 0) {
        var cookieStart = docCookie.indexOf(cookieName);
        if (cookieStart != -1) {
            cookieStart = cookieStart + cookieName.length;
            var end = docCookie.indexOf(";",cookieStart);
            if (end == -1) {
                end = docCookie.length;
            }
            let cookie = docCookie.substring(cookieStart,end);
            let json_data = decodeURIComponent(cookie);
            let data = JSON.parse(json_data);
            print('cookie = ' + data);
            access_token = data;
            return true;
      }
   }
   return false;
}

function updateCookie() {
    data = access_token;
    let JSONdata = JSON.stringify(data);
    let URIdata = encodeURIComponent(JSONdata);
    document.cookie = "access_token=" + URIdata + "; max-age=" + 365*24*60*60;
}

function request(callback_function, method, parametrs) {
    url = 'https://api.vk.com/method/' + method + '?';
    var params = '';
    if (parametrs) {
        for (let i = 0; i < parametrs.length; i++) {
            params += parametrs[i].name + '=' + parametrs[i].value + '&'; 
        }
    }
    url += params + 'access_token=' + access_token + '&v='+ version;
    print('url = '+ url);
    loadJSON(url, callback_function, 'jsonp');
}