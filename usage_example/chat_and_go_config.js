const chat_conf = {
    db_user          :   'jafar',
    db_password      :   '68yIr5K1',
    db_name          :   'bringo_chat',
    end_point        :   'localhost:3000',
    loading_image    :   "http://chat-and-go.ascendnet.ro/assets/images/loading.gif",
    images_path      :   "http://chat-and-go.ascendnet.ro/chat_images/"
};

try {
    exports.settings = chat_conf;
}
catch(err) {
}


//DATABASE_URL="mysql://jafar:68yIr5K1@127.0.0.1:3306/pontaj"
