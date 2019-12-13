var albums_div;
var images_div;
var albums = {};
var process_bar = {};
var duplicates = [];
var accuracy = 5;
var photos;
var comparing_iter = -1;
var tmp_comparing_iter = -1;

function setup() {
    readCookie();
    frameRate(1);
    albums_div = createDiv('Выберите альбомы для поиска повторов');
    continue_button = createButton('Начать поиск');
    continue_button.mouseClicked(searchDuplicates);
    albums_div.child(continue_button);
    getAlbums();
}

function draw() {
    if (comparing_iter >= 0 && comparing_iter < photos.length) {
        var steps = 50;
        var similar;
        while (comparing_iter < photos.length && steps > 0) {
            similar = photos.slice(comparing_iter, comparing_iter + 1);
            for (let i = comparing_iter + 1; i < photos.length; i++) {
                if (compareTwoPhotos(similar[0], photos[i])) {
                    similar.push(photos[i]);
                }
            }
            if (similar.length > 1) {
                showDuplicates(similar);
                print(similar);
            }      
            comparing_iter += 1;
            steps -= 1;
        }
        background(45);
        if (similar[0].img.width > similar[0].img.height) {
            let mult = similar[0].img.height / similar[0].img.width;
            image(similar[0].img, 0, 25, width, (height-25) * mult);
        } else {
            let mult = similar[0].img.width / similar[0].img.height;
            image(similar[0].img, 0, 25, width * mult, height-25);
        }
        let pr = map(comparing_iter, 0, photos.length - 1, 0, 100);
        fill(125); 
        rect(0, 0, map(pr, 0, 100, 0, width), 25);
        textAlign(CENTER, CENTER);
        textSize(25);
        fill(255);
        text(Math.floor(pr) + '%', map(pr, 0, 100, 0, width) / 2, 25 / 2);
    }
}

function getAlbums() {
    request(printAlbums, 'photos.getAlbums', {'need_system': 1, 'need_covers': 1});
}

function printAlbums(response) {
    print(response);
    for (let i = 0; i < response.response.count; i++){
        if (response.response.items[i].id != -9000) {
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
}

function changeAlbumsList() {
    if (this.class() == 'div_off'){
        this.class('div_on');
        process_bar['album_id='+this.album_id] = createP('0');
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
        if (response.error != null) {
            process_bar['album_id='+album_id].html('ERROR!' + response.error.error_msg);
        }
        request(appendAlbumsPhotos, 'photos.get', {'album_id': album_id, 'count': 1000, 'offset': albums['album_id='+album_id].length});
    } else {
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
}

function successLoad() {
    //this.loadPixels();
    let alb = albums['album_id='+this.album_id];
    let success = alb.filter(a => a.img.height > 1);
    let progress = Math.floor(map(success.length, 0, alb.length, 0, 100));
    process_bar['album_id='+this.album_id].html(success.length + '/' + alb.length);
}

function searchDuplicates() {
    if (albums_div){
        albums_div.remove();
    }
    photos = [];
    for (let a in albums) {
        for (let p in albums[a]) {
            albums[a][p].img.loadPixels();
            photos.push(albums[a][p]);
        }
    } 
    createCanvas(75*3, 75*3+25);
    background(45);
    fill(200);  
    print(photos);
    comparing_iter = 0;
    frameRate(60);
}
/*
function comparePhotoWithOther(photo, other_photos) {
    var similar_list = [photo];
    for (let i in other_photos) {
        let ophoto = other_photos[i];
                
        if (similar) {
            similar_list.push(ophoto);
        }
    }
    return similar_list;
}*/

function compareTwoPhotos(photo1, photo2) {
    if (photo1.img.height == photo2.img.height && photo1.img.width == photo2.img.width) {
        var similar = true;
        for (let pix = 0; pix < 4 * photo1.img.height * photo1.img.width; pix += 4) {
            if (abs(photo1.img.pixels[pix]   - photo2.img.pixels[pix])   > accuracy ||
                abs(photo1.img.pixels[pix+1] - photo2.img.pixels[pix+1]) > accuracy ||
                abs(photo1.img.pixels[pix+2] - photo2.img.pixels[pix+2]) > accuracy ||
                abs(photo1.img.pixels[pix+3] - photo2.img.pixels[pix+3]) > accuracy) {
                similar = false;
                break;
            }
            //print(img1.pixels.slice(pix, pix + 4), img2.pixels.slice(pix, pix + 4), similar);
        }
        return similar;
    } else {
        return false;
    }
}

function showDuplicates(similar_list) {
    var dupl_p = createP();
    for (let i in similar_list) {
        let photo = similar_list[i];
        let size = photo.sizes.reduce(function (a, b) {
        if (b.height > a.height && b.height < 500) { return b;} 
            else {return a;}
        });
        print(size);
        var dupl_div = createDiv();
        dupl_div.parent(dupl_p)
        var dupl_img = createImg(size.url);
        dupl_img.parent(dupl_div);
        var href = createA('https://vk.com/photo'+ photo.owner_id +'_' + photo.id, 
                           'photo'+ photo.owner_id +'_' + photo.id);
        href.parent(dupl_div);  
    }
}

/*function openVkImage() {
    window.open(this.href);
}*/







