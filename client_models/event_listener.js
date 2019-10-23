function ClientEventsListener()
{
    ChatJs.apply(this);
    let self = this;
    self.init = function () {
        self.watchEvents();
    }
}

ClientEventsListener.prototype = Object.create(ChatJs.prototype);

client_events_listener = ClientEventsListener.prototype;

client_events_listener.watchEvents = function() {

    $(document).on('click', '.popup img', function() {
        $('#overlay')
            .css({backgroundImage: `url(${this.src})`})
            .addClass('open')
            .one('click', function() { $(this).removeClass('open'); });
    });

    $(document).on('click', '.send_chat_msg', function(){
        let room_id = $(this).data('room_id');
        let parameters = $(".chat_window_of_"+room_id).data();
        let message_input = $(".message_input_for_"+room_id);
        let message = message_input.val();
        if (message.length < 1) {
            return
        }
        let message_id = chatter.makeRandomIdentifier(50);
        let created_at = chatter.getTimestamp();
        chat_proceesor.sendMessage(message, parameters.current_user_id, room_id, 0, message_id, created_at, parameters.is_other_online);
        chat_template_maker.draw_one_message({'message_body':message, 'sender_id':parameters.current_user_id, 'room_id':room_id, 'is_image':0, 'message_id': message_id, 'created_at': created_at}, 0);
        chatter.scrollToBottom(room_id);
        message_input.val('');
    });

    $(document).on('click', '.send_chat_img', function(){
        let room_id = $(this).data('room_id');
        $(".send_chat_img_for_"+room_id).trigger("click");
    });

    $(document).on('click', '.delete-msg-chat', function(eve){
        eve.preventDefault();
        let room_id = $(this).data('room_id');
        let message = $('.confirm_delete_tr').data('value');
        let message_id = $(this).data('message_id');
        $(".message_box_for_"+room_id).append(chat_template_maker.drawConfirmDeleteModal(message, message_id));
        $(document).on('click', '.close_confirmation_modal, .abort_delete',function () {
            $(".confirmation_modal").css('display', 'none');
        });

        $(document).on('click', '.confirm_delete',function () {
            chat_proceesor.deleteMessage(room_id, message_id);
            chat_template_maker.updateMessageToBeDeleted(message_id)
        });
    });

    let shiftDown = false;
    $(document).keypress(function (e) {
        if(e.keyCode == 13) {
            if($('.message_input').is(":focus") && !shiftDown) {
                let room_id = $(e.target).data('room_id');
                let parameters = $(".chat_window_of_"+room_id).data();
                let message_input = $(".message_input_for_"+room_id);
                let message = message_input.val();
                if (message.length < 1) {
                    return
                }
                e.preventDefault(); // prevent another \n from being entered
                let message_id = chatter.makeRandomIdentifier(50);
                let created_at = chatter.getTimestamp();
                chat_proceesor.sendMessage(message, parameters.current_user_id, room_id, 0, message_id, created_at, parameters.is_other_online);
                chat_template_maker.draw_one_message({'message_body': message, 'sender_id': parameters.current_user_id, 'room_id': room_id, 'is_image':0, 'message_id': message_id, 'created_at': created_at}, 0);
                chatter.scrollToBottom(room_id);
                message_input.val('');
            }
        }else {
            if($('.message_input').is(":focus")) {
                let room_id = $(e.target).data('room_id');
                let parameters = $(".chat_window_of_"+room_id).data();
                let my_name = parameters.current_user_name;
                let my_user_id = parameters.current_user_id;
                chat_proceesor.emmitIsTyping(my_name, my_user_id, room_id);
            }
        }
    });

    $(document).keydown(function (e) {
        if(e.keyCode == 16) shiftDown = true;
    });

    $(document).keyup(function (e) {
        if(e.keyCode == 16) shiftDown = false;
    });

    // $(document).on('click', ".chat_modal .close", function(){
    //     $('.chat_modal').modal('hide');
    //     $(".chat_modal").css('display', 'none');
    //     $('.modal-backdrop.fade.show').remove();
    //     chat_proceesor.unsubscribe(room_id, sender_id);
    // });
    //
    // $(window).on('beforeunload', function(){
    //     chat_proceesor.unsubscribe(room_id, sender_id);
    // });
};

/**
 * Initialize script
 * @type {ClientEventsListener}
 */
let events_listener = new ClientEventsListener();
events_listener.init();