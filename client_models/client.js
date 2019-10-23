function ChatJs(
    current_user_id,
    current_user_name,
    other_user_id,
    other_user_name,
    room_id,
    current_user_avatar,
    other_user_avatar
)
{
    this.current_user_id = current_user_id;
    this.other_user_id = other_user_id;
    this.room_id = room_id;
    this.current_user_avatar = current_user_avatar;
    this.other_user_avatar = other_user_avatar;
    this.other_user_name = other_user_name;
    this.current_user_name = current_user_name;
    this.init = function () {
        this.setUpSelectors();
        this.setUpChatParameters();
    }
}

let chatter = ChatJs.prototype;
chatter.constructor = ChatJs;

chatter.baseUrl = $('meta[name="base_url"]').attr('content');
chatter.locale = $('meta[name="locale"]').attr('content');
chatter.active_room_id = 0;

chatter.chat_parameters = {
    'is_other_online': 0,
    'there_is_msg_from_today': 0,
    'current_user_id': 0,
    'current_user_name': '',
    'other_user_id': 0,
    'other_user_name': "",
    'room_id': 0,
    'current_user_avatar': '',
    'other_user_avatar': ''
};

chatter.selectors = {
    'send_button' : ".send_msg_for_",
    'message_input': ".message_input_for_",
    'send_img_btn' : ".send_img_for_",
    'send_img_file_input': ".send_chat_img_for_",
    'message_wall':  ".message_box_for_",
    "online_status_label": '.online_status_of_',
};

chatter.setUpChatParameters = function()
{
    chatter.chat_parameters.is_other_online = 0;
    chatter.chat_parameters.there_is_msg_from_today = 0;
    chatter.chat_parameters.current_user_id = this.current_user_id;
    chatter.chat_parameters.other_user_id = this.other_user_id;
    chatter.chat_parameters.room_id = this.room_id;
    chatter.chat_parameters.current_user_avatar = this.current_user_avatar;
    chatter.chat_parameters.other_user_avatar = this.other_user_avatar;
    chatter.chat_parameters.other_user_name = this.other_user_name;
    chatter.chat_parameters.current_user_name = this.current_user_name;
};

chatter.setUpSelectors = function()
{
    chatter.selectors.send_button = ".send_msg_for_"+this.room_id;
    chatter.selectors.message_input = ".message_input_for_"+this.room_id;
    chatter.selectors.send_img_btn = ".send_img_for_"+this.room_id;
    chatter.selectors.send_img_file_input = ".send_chat_img_for_"+this.room_id;
    chatter.selectors.message_wall = ".message_box_for_"+this.room_id;
    chatter.selectors.online_status_label = ".online_status_of_"+this.room_id;
    chatter.active_room_id = this.room_id;
};

chatter.makeRandomIdentifier = function (length) {
    let result           = [];
    let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result.push(characters.charAt(Math.floor(Math.random() * charactersLength)));
    }
    return result.join('');
};

chatter.getYesterdaysDate = function() {
    let date = new Date();
    date.setDate(date.getDate()-1);
    return chatter.formatOnlyDate(date);
};

chatter.addZero = function(x, n) {
    while (x.toString().length < n) {
        x = "0" + x;
    }
    return x;
};

chatter.addZeroEnd =  function(x, n) {
    while (x.toString().length < n) {
        x = x + "0";
    }
    return x;
};

chatter.formatDateAndTime = function (UNIX_timestamp)
{
    let dd    = new Date(UNIX_timestamp);
    let year  = dd.getFullYear();
    let month = dd.getMonth() + 1;
    let date  = dd.getDate();
    let hour  = dd.getHours();
    let min   = dd.getMinutes();
    let sec   = dd.getSeconds();
    let ms    = dd.getMilliseconds();
    return year + '-' + chatter.addZero(month, 2) + '-'+ chatter.addZero(date, 2) +' ' + chatter.addZero(hour, 2) + ':' + chatter.addZero(min, 2) + ':' + chatter.addZero(sec, 2) +'.'+ chatter.addZeroEnd(ms, 6);
};

chatter.getTimestamp = function ()
{
    let dd    = new Date();
    let year  = dd.getFullYear();
    let month = dd.getMonth() + 1;
    let date  = dd.getDate();
    let hour  = dd.getHours();
    let min   = dd.getMinutes();
    let sec   = dd.getSeconds();
    let ms    = dd.getMilliseconds();
    return year + '-' + chatter.addZero(month, 2) + '-'+ chatter.addZero(date, 2) +' ' + chatter.addZero(hour, 2) + ':' + chatter.addZero(min, 2) + ':' + chatter.addZero(sec, 2) +'.'+ chatter.addZeroEnd(ms, 6);
};

chatter.formatOnlyDate = function (UNIX_timestamp)
{
    let dd    = new Date(UNIX_timestamp);
    let year  = dd.getFullYear();
    let month = dd.getMonth() + 1;
    let date  = dd.getDate();
    return year + '-' + chatter.addZero(month, 2) + '-'+ chatter.addZero(date, 2);
};

chatter.formatAmPmTime = function (UNIX_timestamp)
{
    let dd    = new Date(UNIX_timestamp);
    let hours = dd.getHours();
    let minutes = dd.getMinutes();
    let ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    hours = hours < 10 ? '0'+hours : hours;
    minutes = minutes < 10 ? '0'+minutes : minutes;
    return hours + ':' + minutes + ' ' + ampm;
};

chatter.show_is_typing = function (room_id, name) {
    $('.typing-status').show();
    let is_typing_tr = $('.is_typing_tr').data('value');
    $('.typing-status_of_'+room_id).text(name+ " "+is_typing_tr);
    setTimeout(
        function() {
            $('.typing-status').hide();
        }, 2000);
};

chatter.formatLastOnline = function(data) {
    try{
        let last_online = data[0].last_online;
        let main_parts = last_online.split('T');
        let date_part = main_parts[0];
        let time_parts = main_parts[1].split(':');
        let hours = time_parts[0];
        let minutes = time_parts[1];
        return date_part+" at "+hours+":"+minutes;
    }catch (e) {
        return "Long Time Ago"
    }
};

chatter.scrollToBottom = function (room_id) {
    $('.message_box_for_'+room_id).stop().animate({ scrollTop: $('.message_box_for_'+room_id)[0].scrollHeight}, 1000);
};

chatter.makeMessageTimestamp = function (date) {
    return chatter.formatAmPmTime(date);
};

chatter.needsBase = function(file_name) {
    return !file_name.includes("/");
};



