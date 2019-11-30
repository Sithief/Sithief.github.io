var text_output;
var access_token_input;

function setup() {
    readCookie();
    createDiv('access token Вконтакте:');
    access_token_input = createInput(access_token);
    access_token_input.input(inputAccessToken);
    get_token_button = createButton('Получить access token');
    get_token_button.mousePressed(getToken);
    text_output = createDiv('Тут будет ответ от сервера вк');
}

function getToken() {
    window.open("https://oauth.vk.com/authorize?client_id=2685278&scope=1073737727&redirect_uri=https://oauth.vk.com/blank.html&display=page&response_type=token");
}

function inputAccessToken() {
  console.log('you are typing: ', this.value());
  access_token = this.value();
  updateCookie();
  request(print_result, 'utils.getServerTime');
}

function print_result(response) {
    if (response.response) {
        text_output.html('Ключ верный!');
    } else {
        text_output.html('Ключ введён не правильно');
    }

    print(response);
}