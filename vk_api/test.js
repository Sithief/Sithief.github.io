function setup() {
    text_output = createDiv('this is some text');
    request(print_result, 'utils.getServerTime');
}

function print_result(response) {
    print(response);
}