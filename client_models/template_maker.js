function ChatTemplateMaker(chatClient)
{
    this.chatClient = chatClient;
}

chat_template_maker = ChatTemplateMaker.prototype;
chat_template_maker.constructor = ChatTemplateMaker;

chat_template_maker.drawConfirmDeleteModal = function (message, message_id) {
    let confirm_tr = $('.confirm_tr').data('value');
    let confirm_btn_tr = $('.confirm_btn_tr').data('value');
    let cancel_btn_tr = $('.cancel_btn_tr').data('value');
    return "<div class=\"modal fade confirmation_modal delete_message delete_message_for_"+message_id+"\" tabindex=\"-1\" role=\"dialog\" style=\"display: block; opacity: 1;\" aria-labelledby=\"mySmallModalLabel\" aria-hidden=\"true\" id=\"mi-modal\">\n" +
        "<div class=\"vertical-alignment-helper\">\n" +
        "<div class=\"modal-dialog vertical-align-center\">\n" +
        "        <div class=\"modal-content\">\n" +
        "            <div class=\"modal-header\">\n" +
        "                <button type=\"button\" class=\"close close_confirmation_modal \" data-dismiss=\"modal\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button>\n" +
        "                <h3 class=\"modal-title\" style=\" \" id=\"myModalLabel\">"+confirm_tr+"</h3>\n" +
        "            </div>\n" +
        "             <div class=\"modal-body\">\n" + message +
        "            </div>\n" +
        "            <div class=\"modal-footer m-10 text-center\">\n" +
        "                <button type=\"button\" style=\"border-radius: 20px; font-size: 15px;\" class=\"btn btn-success confirm_delete \" id=\"modal-btn-si\">"+confirm_btn_tr+"</button>\n" +
        "                <button type=\"button\" style=\"border-radius: 20px; font-size: 15px;\" class=\"btn btn-danger abort_delete\" id=\"modal-btn-no\">"+cancel_btn_tr+"</button>\n" +
        "            </div>\n" +
        "        </div>\n" +
        "    </div>\n" +
        "</div>\n" +
        "</div>\n" +
        "\n" +
        "<div class=\"alert\" role=\"alert\" id=\"result\"></div>";
};

chat_template_maker.drawModal = function (room_id, appointment_number, other_side, date, specialization, status, is_urgent) {
    let chat_tr = $('.chat_tr').data('value');
    let room_id_tr = $('.room_id_tr').data('value');
    let patient_tr = $('.patient_tr').data('value');
    let date_tr = $('.date_tr').data('value');
    let specialization_tr = $('.specialization_tr').data('value');
    let status_tr = $('.status_tr').data('value');
    let urgent_tr = $('.urgent_tr').data('value');
    let chat_btn_tr = $('.chat_btn_tr').data('value');
    let appointment_number_tr = $('.appointment_number_tr').data('value');

    return '<div class="modal fade show chat_modal chat_for_'+ room_id +'" tabindex="-1" data-backdrop="static" data-keyboard="false" role="dialog" style="display: block; opacity: 1;" aria-labelledby="mySmallModalLabel" aria-hidden="true" >' +
        '<div class="vertical-alignment-helper">' +
        '<div class="modal-dialog vertical-align-center">' +
        '<div class="modal-content">' +
        '<div class="modal-header">' +
        '<button type="button" data-dismiss="modal" class="close">&times;</button>' +
        '<div class="modal-title" id="myModalLabel">'+chat_tr+' '+ other_side +'<div class="chat-title-wrapper"><div class="online-status-icon off"></div><div class="online_status">offline</div></div>'+'</div>' +
        '</div>' +
        '<div class="modal-body">' +
        '<div class="row">' +
        '<div class="col-4 chat-left">' +
        '<div class="appointment_number">'+appointment_number_tr+': <span>'+appointment_number+'</span></div>' +
        '<div class="date">'+date_tr+': <span>'+date+'</span></div>' +
        '<div class="status">'+status_tr+': <span>'+status+'</span></div>' +
        '</div>' +
        '<div class="col-8">' +
        '<div class="chat">' +
        '<div class="chat-bg"></div>' +
        chat_template_maker.draw_chat_box(room_id)+
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div class="alert" role="alert" id="result"></div>';
};


chat_template_maker.draw_chat_box = function (room_id) {
    return '<div class="messages-box clearfix message_box_for_'+room_id+'" id="messages-box" >' +
        '<div id="show_comments chat_wall_for_'+room_id+'"></div>' +
        '</div>' +
        '<div class="create-massage">' +
        '<div id="comment_box" class="chat-form">' +
        '<div class="chat-footer-left">' +
        '<input type="file" accept="image/*" class="hidden send_chat_img_for_'+room_id+'" data-room_id ="'+room_id+'" onchange="chat_template_maker.send_image_file(this, event);"> ' +
        '<button class="send_chat_img send_img_for_'+ room_id +'" data-room_id = "'+room_id+'" ><i class="fas fa-images"></i></button>' +
        '</div>' +
        '<div class="chat-footer-center">' +
        '<input type="text" placeholder="type message" class="message_input message_input_for_'+room_id+'" data-room_id = "'+room_id+'">' +
        '</div>' +
        '<div class="chat-footer-right">' +
        '<button class="send_chat_msg send_msg_for_'+ room_id +'" data-room_id = "'+room_id+'" ><i class="fas fa-location-arrow"></i>' +
        '</button>' +
        '</div>' +
        '</div>' +
        '<div class="typing-status typing-status_of_'+room_id+'"></div>' +
        '</div>' ;
};

chat_template_maker.draw_avatar = function (room_id, sender_id) {
    let parameters = $(".chat_window_of_"+room_id).data();
    let my_id = parameters.current_user_id;
    let my_avatar = parameters.current_user_avatar;
    let other_avatar = parameters.other_user_avatar;
    let is_other_online = parameters.is_other_online;

    let extra_class_avatar = '';
    let avatar_url = '';
    let availability_class = "off";
    let other_availability_class = "";
    if (my_id != sender_id) {
        extra_class_avatar = 'avatar_not_sender';
        avatar_url = chatter.baseUrl+'profile_images/'+other_avatar;
        other_availability_class = "other_user_status";
    } else {
        avatar_url = chatter.baseUrl+'profile_images/'+my_avatar;
        availability_class = "on";
    }
    if(is_other_online) {
        availability_class = "on";
    }
    return '<div class="avatar-image '+ extra_class_avatar +'">' +
        '<img alt ="" src="'+avatar_url +'"/>' +
        '<div class="availability-status-chat '+ other_availability_class +' '+availability_class+'"></div>'+
        '</div>';
};


chat_template_maker.updateMessageStatus = function (message_id, is_sent, is_seen) {
    let message_status_sign = '';
    if(is_seen) {
        message_status_sign = 'is_seen';
        if(!is_sent) {
            chat_proceesor.messageSeen(message_id)
        }
        $('.'+message_id).find('.message_status').removeClass('fas fa-check');
        $('.'+message_id).find('.message_status').addClass('fas fa-check-double');
    } else if(is_sent){
        message_status_sign = 'is_sent';
        $('.'+message_id).find('.message_status').addClass('fas fa-check');
    }
    $('.'+message_id).find('.message_status').addClass(message_status_sign);
    // $('.'+message_id).find('.message_status').data('icon', data_icon);
};

chat_template_maker.allMessagesIsSeen = function () {
    $('.message_status').addClass('is_seen');
};

chat_template_maker.updateUserOnlineStatus = function (room_id, is_online) {
    if(is_online) {
        $('.online_status_of_'+room_id).text('Online');
        $('.online_status_of_'+room_id).removeClass('off');
        $('.online_status_of_'+room_id).addClass('on');
    } else {
        $('.online_status_of_'+room_id).text('Offline');
        $('.online_status_of_'+room_id).removeClass('on');
        $('.online_status_of_'+room_id).addClass('off');
    }
};

chat_template_maker.updateUserLastOnline = function (room_id, txt) {
    $('.online_status_of_'+room_id).text('Last Online '+txt);
};

chat_template_maker.updateMessageToBeDeleted = function (message_id) {
    let deleted = $('.deleted_message_tr').data('value');
    $('.'+message_id).addClass('deleted').html('');
    $('.'+message_id).parent().find('.dropdown').remove();
    $('.'+message_id).addClass('deleted').append('<i class="fas fa-ban"></i><span>'+deleted+'</span>');
    $(".confirmation_modal").css('display', 'none');
};

chat_template_maker.messageOptions = function(data, extra_class) {
    let room_id = data.room_id;
    let chat_window =  $(".chat_window_of_"+room_id);
    let parameters = chat_window.data();
    let delete_tr = $('.delete_tr').data('value');
    let edit_tr = $('.edit_tr').data('value');
    if (data.sender_id == parameters.current_user_id) {
        return '<div class="dropdown ' + extra_class + ' message-options">\n' +
            '<button class="btn btn-secondary dropdown-toggle" type="button" id="more-options" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">\n' +
            '<i class="fas fa-ellipsis-h"></i>' +
            '</button>' +
            '<div class="dropdown-menu" aria-labelledby="more-options">' +
            '<a class="dropdown-item delete-msg-chat" href="#" data-message_id="'+data.message_id+'" data-room_id="'+data.room_id+'">'+delete_tr+'</a>' +
            // '<a class="dropdown-item edit-msg-chat" href="#" data-message_id="'+data.message_id+'">'+edit_tr+'</a>' +
            '</div>' +
            '</div>';
    }
    return '';
};

chat_template_maker.messageTextTemplate = function(data, extra_class) {
    let room_id = data.room_id;
    let chat_window =  $(".chat_window_of_"+room_id);
    let parameters = chat_window.data();
    let my_id = parameters.current_user_id;
    let sender_id = data.sender_id;
    let message_status_sign = '';
    let created_at = chatter.makeMessageTimestamp(data.created_at);
    if(my_id == sender_id) {
        message_status_sign = '<i class="fas fa-check message_status"></i>';
    }
    return  '<div ' +
        'data-sender_id="'+sender_id+'"'+
        ' data-my_id="'+my_id+'"'+
        ' class="message ' + extra_class + ' '+ data.message_id +'">' +
        '<p>' + data.message_body + '</p>' +
        '<div class="chat-message-details-wrapper">'+
        '<div class="chat-message_time">'+created_at+'</div>' +
        '<div class="chat-message-icon">'+message_status_sign +'</div>'+
        '</div>' +
        '</div>' +
        chat_template_maker.messageOptions(data, extra_class) +
        '<div class="break"></div>';
};

chat_template_maker.messageImageTemplate = function(data, extra_class) {
    let room_id = data.room_id;
    let chat_window =  $(".chat_window_of_"+room_id);
    let parameters = chat_window.data();
    let my_id = parameters.current_user_id;
    let sender_id = data.sender_id;
    let message_status_sign = '';
    if(my_id == sender_id) {
        message_status_sign = '<i class="fas fa-check message_status"></i>';
    }
    let created_at = chatter.makeMessageTimestamp(data.created_at);
    let the_src = '';
    if(chatter.needsBase(data.message_body)){
        the_src = chat_conf.images_path+data.message_body;
    }else{
        the_src = data.message_body;
    }
    return '<div ' +
        'data-sender_id="'+sender_id+'"'+
        ' data-my_id="'+my_id+'"'+
        ' class="message ' + extra_class + ' '+ data.message_id +'">' +
        '<div class="popup">' +
        '<div id="overlay"></div>' +
        '<img ' +
        'src="' + the_src + '" ' +
        'alt="image message" ' +
        'class="compress ' + extra_class + ' '+ data.message_id + '" ' +
        'height="82" ' +
        'width="auto"' +
        '></div>'+
        '<div class="chat-message-details-wrapper">'+
        '<div class="chat-message_time">'+created_at+'</div>' +
        '<div class="chat-message-icon">'+message_status_sign +'</div>'+
        '</div>' +
        '</div>'+
        chat_template_maker.messageOptions(data, extra_class) +
        '<div class="break"></div>';
};

chat_template_maker.calculateAspectRatioFit = function(srcWidth, srcHeight, maxWidth, maxHeight) {
    let ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
    return { width: srcWidth*ratio, height: srcHeight*ratio };
};

chat_template_maker.deletedMessageTemplate = function(data, extra_class) {
    let room_id = data.room_id;
    let chat_window =  $(".chat_window_of_"+room_id);
    let parameters = chat_window.data();
    let my_id = parameters.current_user_id;
    let sender_id = data.sender_id;
    let deleted = $('.deleted_message_tr').data('value');
    return  '<div ' +
        'data-sender_id="'+sender_id+'"'+
        ' data-my_id="'+my_id+'"'+
        ' class="message deleted ' + extra_class + ' '+ data.message_id +'">' +
        '<i class="fas fa-ban"></i><span>'+deleted+'</span>' +
        '</div>' +
        '<div class="break"></div>';
};

chat_template_maker.draw_one_message = function (data, is_sent)
{
    let sender_id = data.sender_id;
    let room_id = data.room_id;
    let chat_window =  $(".chat_window_of_"+room_id);
    let parameters = chat_window.data();
    let my_id = parameters.current_user_id;
    let is_seen = data.is_seen;
    if (!is_seen) {
        is_seen = parameters.is_other_online;
    }
    let extra_class = (sender_id != my_id) ?  'not_sender' : '';
    let avatar = chat_template_maker.draw_avatar(room_id, sender_id);
    let message_template='';
    if(data.is_image == 0) {
        message_template = chat_template_maker.messageTextTemplate(data, extra_class);
    } else {
        message_template = chat_template_maker.messageImageTemplate(data, extra_class);
    }
    if(!parameters.there_is_msg_from_today) {
        $(".chat_window_of_"+room_id).data('there_is_msg_from_today', 1);
        $(".message_box_for_"+room_id).append('<div class="timestamp-message">Today</div>');
    }
    $(".message_box_for_"+room_id).append('<div class="message_row">'+avatar + message_template+"</div>");
    chat_template_maker.updateMessageStatus(data.message_id, is_sent, is_seen);
    chatter.scrollToBottom(room_id);
};

chat_template_maker.draw_bulk_messages = function (room_id, messages)
{
    let chat_window =  $(".chat_window_of_"+room_id);
    let parameters = chat_window.data();
    let msg_date = '';
    let today = chatter.formatOnlyDate(new Date());
    let yesterday = chatter.getYesterdaysDate();
    let grouped_by_date = {};
    $.each(messages, function (index, data) {
        msg_date = chatter.formatOnlyDate(data.created_at);
        if(!(msg_date in grouped_by_date)) {
            grouped_by_date[msg_date] = [];
        }
        grouped_by_date[msg_date].push(data);
    });
    let timestamp_label = "";
    $.each(grouped_by_date, function (date, grouped_messages) {
        if(date == today) {
            timestamp_label = "Today";
            $(".chat_window_of_"+room_id).data('there_is_msg_from_today', 1);
        } else if(date == yesterday) {
            timestamp_label = "Yesterday";
        } else {
            timestamp_label = date;
        }
        $('.message_box_for_'+room_id).append('<div class="timestamp-message">'+timestamp_label+'</div>');
        $.each(grouped_messages, function (index, data) {
            let sender_id = data.sender_id;
            let my_id = parameters.current_user_id;
            let is_seen = data.is_seen;
            if (!is_seen) {
                is_seen = parameters.is_other_online;
            }
            let extra_class = (sender_id != my_id) ?  'not_sender' : '';
            let avatar = chat_template_maker.draw_avatar(room_id, sender_id);
            let message_template='';
            if(data.is_deleted == 1) {
                message_template = chat_template_maker.deletedMessageTemplate(data, extra_class);
            }else if(data.is_image == 0) {
                message_template = chat_template_maker.messageTextTemplate(data, extra_class);
            } else {
                message_template = chat_template_maker.messageImageTemplate(data, extra_class);
            }
            $('.message_box_for_'+room_id).append('<div class="message_row">'+avatar + message_template+"</div>");
            chat_template_maker.updateMessageStatus(data.message_id, 1, is_seen);
        });
    });
    chatter.scrollToBottom(room_id);
};

chat_template_maker.send_image_file = function(ele, event) {

    let room_id = $(ele).data('room_id');
    let chat_window =  $(".chat_window_of_"+room_id);
    let parameters = chat_window.data();
    let sender_id = parameters.current_user_id;

    let avatar = chat_template_maker.draw_avatar(room_id, sender_id);
    let new_name = chatter.makeRandomIdentifier(50);
    let created_at = chatter.getTimestamp();
    let files  = event.target.files;
    // FileReader support
    if (FileReader && files && files.length) {
        let selected_file  = files[0];
        // console.log(selected_file);
        let file_name  = files[0].name;
        let name_parts = file_name.split('.');
        let extension = name_parts[name_parts.length-1];
        let fr = new FileReader();
        let loading_img = chat_conf.loading_image;
        fr.onload = function () {
            let the_src = fr.result;
            chat_template_maker.draw_one_message({'message_body':loading_img, 'sender_id':sender_id, 'room_id':room_id, 'is_image':1, 'message_id': new_name, 'created_at': created_at}, 0);
        };
        fr.readAsDataURL(selected_file);
        chat_proceesor.sendImage(selected_file, new_name, extension, sender_id, room_id, 'binary', new_name, created_at, parameters.is_other_online);
        event.target.files = null;
    }
    chatter.scrollToBottom(room_id);
};

chat_template_maker.update_message_to_be_sent = function(msg)
{
    let room_id = msg.room_id;
    let chat_window =  $(".chat_window_of_"+room_id);
    let parameters = chat_window.data();
    if(msg.is_image == 0) {
        // $('.'+msg.message_id).append('<i class="fas fa-check"></i>');
    } else {
        let extra_class = '';
        (parameters.current_user_id != msg.sender_id) ? extra_class = 'not_sender' : '';
        let base_path = chat_conf.images_path;
        $('.'+msg.message_id).attr('src', base_path+msg.message_body);
        $('.'+msg.message_id).addClass(extra_class);
    }
    chatter.scrollToBottom(msg.room_id);
};
