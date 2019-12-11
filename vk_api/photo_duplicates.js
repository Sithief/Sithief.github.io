var albums_div;
var images_div;
var albums = {};
var process_bar = {};

function setup() {
    readCookie();
    albums_div = createDiv('Выберите альбомы для поиска повторов');
    continue_button = createButton('Начать поиск');
    continue_button.mouseClicked(searchDuplicates);
    albums_div.child(continue_button);
    getAlbums();
}

function getAlbums() {
    request(printAlbums, 'photos.getAlbums', {'need_system': 1, 'need_covers': 1});
}

function printAlbums(response) {
    print(response);
    for (let i = 0; i < response.response.count; i++){
        var album = response.response.items[i];
        var album_info = createDiv();
        album_info.album_id = album.id;
        album_info.class('div_off');
        album_info.mouseClicked(changeAlbumsList);
        var title = createP(album.title);
        var img = createImg(album.thumb_src);
        album_info.child(title);
        album_info.child(img);
        albums_div.child(album_info);
    }

}

function changeAlbumsList() {
    if (this.class() == 'div_off'){
        this.class('div_on');
        process_bar['album_id='+this.album_id] = createP('0%');
        this.child(process_bar['album_id='+this.album_id]);
        getAlbumsPhotos(this.album_id);
    } else {
        this.class('div_off');
        delete albums['album_id='+this.album_id];
        process_bar['album_id='+this.album_id].remove();
    }   
    print(albums);
}


function getAlbumsPhotos(album_id) {
    albums['album_id='+album_id] = [];
    request(appendAlbumsPhotos, 'photos.get', {'album_id': album_id, 'count': 1000});
}

function appendAlbumsPhotos(response) {
    if (response.response == null) {
        print(response);
        process_bar['album_id='+album_id].html('ERROR!' + response.error.error_msg);
        return;
    }
    album_id = response.response.items[0].album_id;
    for (let i in response.response.items) {
        let item = response.response.items[i];
        let min_size = item.sizes.reduce(function (a, b) {
            if (a.height > b.height) { return b;} 
            else {return a;}
        });
        var img = loadImage(min_size.url);
        albums['album_id='+item.album_id].push(item);
        let progress = Math.floor(100 * albums['album_id='+item.album_id].length / response.response.count);
        process_bar['album_id='+item.album_id].html(progress + '%');
    }
    if (response.response.count > albums['album_id='+album_id].length) {
        request(appendAlbumsPhotos, 'photos.get', {'album_id': album_id, 'count': 1000, 'offset': albums['album_id='+album_id].length});
    }
}


function searchDuplicates() {
    if (albums_div){
        albums_div.remove();
    }
}
















function getDeleted() {
    to_delete = [];
    request(print_result, 'friends.get', {'fields':'last_seen,photo_100'});
}

function print_result(response) {
    if (!response.response) {
        return;
    }
    print(response);
    if (response_div){
        response_div.remove();
    }
    response_div = createP('Удалённые страницы:')
    let items = response.response.items;
    for (let i = 0; i < items.length/5; i++) {
        if (items[i].deactivated) {
            let user_div = createDiv();
            user_div.parent(response_div);
            let url = 'https://vk.com/id' + items[i].id;
            let name = items[i].first_name + ' ' + items[i].last_name;
            let user_name = createA(url, name);
            let user_photo = createImg(items[i].photo_100, '', 'anonymous');
            let delete_button = createButton('Удалить', items[i].id);
            delete_button.mousePressed(deleteBlocked);
            user_div.child(user_photo);
            user_div.child(user_name);
            user_div.child(delete_button);
        }
    }
}

function deleteBlocked() {
    let user_id = this.value();
    request(reloadDeletedList, 'friends.delete', {'user_id': user_id});
}

function reloadDeletedList(response) {
    print(response);
    getDeleted();
}