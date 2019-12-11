var albums_div;
var images_div;
var albums = {};
var process_bar = {};
var duplicates = [];
var accuracy = 5;

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
        item.img = loadImage(min_size.url, successLoad);
        item.img.album_id = item.album_id;
        albums['album_id='+item.album_id].push(item);
    }
    if (response.response.count > albums['album_id='+album_id].length) {
        request(appendAlbumsPhotos, 'photos.get', {'album_id': album_id, 'count': 1000, 'offset': albums['album_id='+album_id].length});
    }
}

function successLoad() {
    //this.loadPixels();
    let alb = albums['album_id='+this.album_id];
    let success = alb.filter(a => a.img.height > 1);
    print(success);
    let progress = Math.floor(map(success.length, 0, alb.length, 0, 100));
    process_bar['album_id='+this.album_id].html(progress + '%');
}

function searchDuplicates() {
    if (albums_div){
        albums_div.remove();
    }
    var photos = [];
    for (let a in albums) {
        for (let p in albums[a]) {
            photos.push(albums[a][p]);
        }
    } 
    //process_bar = createCanvas(300, 300);
    //background(45);
    //fill(200);  
    print(photos);
    let photos_count = photos.length;
    while (photos.length > 0) {
        //rect(0, 0, map(photos.length, photos_count, 0, 0, width), height);
        let act_ph = photos.pop();
        //image(act_ph.img, photos.length * 100, 0);
        let similar = comparePhotoWithOther(act_ph, photos);
        if (similar.length > 1) {
            showDuplicates(similar);
        }      
        print(map(photos.length, photos_count, 0, 0, 100) + '%', similar);
    }
}

function comparePhotoWithOther(photo, other_photos) {
    var similar_list = [photo];
    photo.img.loadPixels();
    let photo_pixels = photo.img.pixels;
    photo.img.updatePixels();
    for (let i in other_photos) {
        let ophoto = other_photos[i];
        ophoto.img.loadPixels();
        let ophoto_pixels = ophoto.img.pixels;
        ophoto.img.updatePixels();
        //print(photo.img.height + 'x' + photo.img.width, ophoto.img.height + 'x' + ophoto.img.width)
        if (photo.img.height == ophoto.img.height & photo.img.width == ophoto.img.width) {
            var similar = true;
            //print(photo_pixels[0], ophoto_pixels[0], similar);
            for (let pix = 0; pix < 4 * photo.img.height * photo.img.width; pix++) {
                if (abs(photo_pixels[pix] - ophoto_pixels[pix]) > accuracy) {
                    similar = false;
                    break;
                }
                //print(photo_pixels[pix], ophoto_pixels[pix], similar, photo, ophoto);
            }
            if (similar) {
                similar_list.push(ophoto);
            }
        }
    }
    return similar_list;
}

function showDuplicates(similar_list) {
    var dupl_div = createDiv();
    for (let i in similar_list) {
        let photo = similar_list[i];
        let size = photo.sizes.reduce(function (a, b) {
        if (a.height < b.height) { return a;} 
            else {return b;}
        });
        print(size);
        var dupl_img = createImg(size.url);
        dupl_img.href = 'https://vk.com/photo'+ photo.owner_id +'_' + photo.id;  
        dupl_img.mouseClicked(openVkImage);    
        dupl_img.parent(dupl_div);
    }
}

function openVkImage() {
    window.open(this.href);
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