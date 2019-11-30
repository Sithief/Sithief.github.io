var response_div;

function setup() {
    readCookie();
    get_deleted_friends_button = createButton('Найти "собачек"');
    get_deleted_friends_button.mousePressed(getDeleted);    
    response_div = createP('Удалённые страницы:');
}

function getDeleted() {
  request(print_result, 'friends.get', {'fields':'last_seen,photo_100'});
}

function print_result(response) {
    if (!response.response) {
        return;
    }
    print(response);
    let items = response.response.items;
    for (let i = 0; i < items.length/5; i++) {
        if (items[i].deactivated) {
            let user_div = createDiv();
            user_div.parent(response_div);
            let url = 'https://vk.com/id' + items[i].id;
            let name = items[i].first_name + ' ' + items[i].last_name;
            let user_name = createA(url, name);
            let user_photo = createImg(items[i].photo_100, '');
            user_div.child(user_photo);
            user_div.child(user_name);
        }
    }
}