function ChatProcessor(chatClient, template_maker)
{
    this.chatClient = chatClient;
    this.socket = null;
    this.template = template_maker;
}
chat_proceesor = ChatProcessor.prototype;

chat_proceesor.getConnection = function() {
    if(!this.socket || !this.socket.connected) {
        this.socket = io.connect(chat_conf.end_point);
    }
    return this.socket;
};

chat_proceesor.chatUp = function() {
    let self = this;
    this.socket = chat_proceesor.getConnection();
    let sender_id = self.chatClient.chat_parameters.current_user_id;
    let room_id = self.chatClient.room_id;
    let socket = self.socket;


    socket.on('fetch_messages', function(data){
        let room_id = data.room_id;
        let messages = data.old_messages;
        $(self.chatClient.selectors.message_wall).html("");
        self.template.draw_bulk_messages(room_id, messages)
    });

    socket.on('receive_message', function(msg){
        if(sender_id != msg.sender_id) {
            self.template.draw_one_message(msg, 1);
        } else {
            self.template.update_message_to_be_sent(msg);
        }
    });

    socket.on('typing', function(data) {
        let room_id = data.room_id;
        let parameters = $(".chat_window_of_"+room_id).data();
        let my_user_id = parameters.current_user_id;
        if(data.sender_id != my_user_id) {
            self.chatClient.show_is_typing(room_id, data.sender_name);
        }
    });

    socket.on('who_is_online', function(data){
        let room_id = data.room_id;
        let online_array = data.online_users;
        let parameters = $(".chat_window_of_"+room_id).data();
        let id_to_check = parameters.other_user_id.toString();
        let is_online = 0;
        if(online_array.includes(id_to_check)) {
            is_online = 1;
            $(".chat_window_of_"+room_id).data('is_other_online', 1);
            chat_proceesor.allMessageSeen(room_id, sender_id);
        } else {
            $(".chat_window_of_"+room_id).data('is_other_online', 0);
            chat_proceesor.checkLastSeen(room_id, id_to_check)
        }
        // console.log(is_online, online_array, id_to_check);
        self.template.updateUserOnlineStatus(room_id, is_online);
    });

    socket.on('user_last_seen', function(data) {
        let room_id = data.room_id;
        let last_seen = data.last_seen;
        try{
            let last_on = chatter.formatLastOnline(last_seen);
            self.template.updateUserLastOnline(room_id, last_on);
        } catch(e){
            self.template.updateUserLastOnline(room_id, 'long time ago');
        }
    });

    socket.on('delete_msg', function(data){
        let message_id = data.message_id;
        self.template.updateMessageToBeDeleted(message_id);
         console.log('this happen');
    });
};

chat_proceesor.sendMessage = function(message, sender_id, room_id, is_image, message_id, created_at, is_other_online) {
    let self = this;
    let clean_msg = chat_proceesor.prepare_msg(message);
    if(!is_other_online) {
        chat_proceesor.sendPushNotification(chatter.chat_parameters.other_user_id)
    }
    self.socket.emit('send_msg', clean_msg, sender_id, room_id, is_image, message_id, created_at);
};

chat_proceesor.sendImage = function(selected_file, new_name, extension, sender_id, room_id, data_type, created_at) {
    let self = this;
    if(!chatter.chat_parameters.is_other_online) {
        chat_proceesor.sendPushNotification(chatter.chat_parameters.other_user_id)
    }
    self.socket.emit('send_img', selected_file, new_name, extension, sender_id, room_id, data_type, new_name, created_at);
};

chat_proceesor.deleteMessage = function(room_id, message_id) {
    let self = this;
    self.socket.emit('delete_msg', room_id, message_id);
};

chat_proceesor.emmitIsTyping = function(my_name, my_user_id, room_id) {
    let self = this;
    self.socket.emit("typing", my_name, my_user_id, room_id);
};

chat_proceesor.unsubscribe = function(room_id, sender_id) {
    let self = this;
    self.socket.emit("unsubscribe", room_id, sender_id);
};

chat_proceesor.messageSeen = function(message_id) {
    let self = this;
    self.socket.emit('message_seen', message_id);
};

chat_proceesor.allMessageSeen = function(room_id, my_user_id) {
    let self = this;
    self.socket.emit('all_my_messages_seen', room_id, my_user_id)
};

chat_proceesor.checkLastSeen = function(room_id, my_user_id) {
    let self = this;
    self.socket.emit('check_last_seen', room_id, my_user_id)
};

chat_proceesor.startUP = function(room_id, my_user_id) {
    let self = this;
    self.socket.emit("subscribe", room_id, my_user_id);
    self.socket.emit('start', room_id);
};

chat_proceesor.prepare_msg = function (unsafeText) {
    let div = document.createElement('div');
    div.innerText = unsafeText;
    return div.innerHTML;
};

chat_proceesor.sendPushNotification = function (recipient_id) {
   http_gun.postRequest('api/send_chat_push_notification', {recipient_id: recipient_id}, function(response) {
       console.log(response);
   });
};
