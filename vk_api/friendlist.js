var response_div;
var to_delete = [];

function setup() {
    readCookie();
    get_deleted_friends_button = createButton('Найти "собачек"');
    get_deleted_friends_button.position(0);
    get_deleted_friends_button.mousePressed(getDeleted);
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