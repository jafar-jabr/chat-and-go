/**
 * ChatAndGo.
 *
 * Copyright 2018 Jafar Jabr. All Rights Reserved.
 *
 * @author : Jafar Jabr <jafaronly@yahoo.com>
 *
 * @version : 1.0.2
 *
 * https://github.com/jafaronly
 *
 */

'use strict';

(function(){
    var element = function(id){
        return document.getElementById(id);
    };
    // Get Elements
    const status = element('status');
    const chat_body = element('chat-wrapper');
    var message_input = element('message_input');
    var file_input    = element('file-upload');
    var send_message  = element('send_message');
    var user_data     = element('user-data');
    var username      = element('userNameInput').innerHTML;
    var my_id         = 123456;
    var database      = null;
    var storage       = null;
    var messagesRef   = null;

    send_message.onclick = function () {
        var msg = message_input.value;
        sendMessage(msg);
        message_input.value = '';
    };
    var buttonTogglingHandler = toggleButton.bind(this);
    send_message.addEventListener('keyup', buttonTogglingHandler);
    send_message.addEventListener('change', buttonTogglingHandler);
    firebaseInit();
    loadMessages();
    toggleButton();
    file_input.addEventListener('change', saveImageMessage.bind(this));

function firebaseInit()
{
    firebase.initializeApp(config);
    database    = firebase.database();
    storage     = firebase.storage();
    messagesRef = database.ref('messages');
}

    signUp();
    function signUp() {
        firebase.database().ref('users').push({
            name: 'Jafar Jabr',
            email: 'jafaronly@yahoo.com',
            image_url: 'message',
            joined_at: Date.now()
        });
    }

function sendMessage(msg) {
    firebase.database().ref('messages').push({
        name: 'Jafar Jabr',
        message: msg,
        message_type: 'message',
        phone: 123456,
        avatar: null,
        sender_id: my_id,
        order_id: 123456,
        date: Date.now()
    });
}

    message_input.addEventListener('keydown', function(event){
        if(event.which === 13 && event.shiftKey == false){
            // Emit to server input
            event.preventDefault();
            sendMessage(message_input.value);
            message_input.value = '';
        }
    });

function showMessages(key, data) {
        var msg_type  = data.message_type;
        var timestamp = formatTheTime(data.date);
        var msg       = data.message;
        var html      = '';
        if (data.sender_id != my_id) {
             html += '<div class="message-item driver d-flex">' +
                     '<div class="driver-wrapper">' +
                     '<p style="font-style: italic">'+username+'</p>'+
                     '<div class="message">' + msg + '</div></div>' +
                     '<div class="time">' + timestamp + '</div></div>';
        } else {
             html += '<div class="message-item me">' +
                     '<div class="me-wrapper d-flex">' +
                     '<p style="font-style: italic">'+username+'</p>'+
                     '<div class="message">' + msg + '</div>' +
                     '<div class="time">' + timestamp + '</div></div></div>';
        }
        if (html.length > 1) {
            chat_body.innerHTML +=html;
            setTimeout(function(){
                chat_body.scrollTop = chat_body.scrollHeight;
             },500);
        }
    }

    function addZero(x, n) {
        while (x.toString().length < n) {
            x = "0" + x;
        }
        return x;
    }
function formatTheTime(UNIX_timestamp)
{
    var t_dd = Date.now();
    var today = new Date(t_dd);
    var dd = new Date(UNIX_timestamp);
    var t_year = today.getFullYear();
    var t_month = today.getMonth();
    var t_date = today.getDate();
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var year = dd.getFullYear();
    var month = dd.getMonth();
    var str_month = months[dd.getMonth()];
    var date = dd.getDate();
    var hour = dd.getHours();
    var min = dd.getMinutes();
    var sec = dd.getSeconds();

    if(t_year == year && t_month == month && t_date == date){
        return addZero(hour, 2) + ':' + addZero(min, 2);
    }else{
        return 'Yesterday '+addZero(hour, 2) + ':' + addZero(min, 2);
    }
}

function loadMessages() {
    // Make sure we remove all previous listeners.
    messagesRef.off();
    // Loads the last 12 messages and listen for new ones.
    var setMessage = function(data) {
        var val = data.val();
        console.log(val);
        console.log(data.key);
        showMessages(data.key, val);
    }.bind(this);
    messagesRef.limitToLast(20).on('child_added', setMessage);
    messagesRef.limitToLast(20).on('child_changed', setMessage);
}

function setImageUrl(message) {
    // If the image is a Cloud Storage URI we fetch the URL.
    if (message.startsWith('gs://')) {
        storage.refFromURL(message).getMetadata().then(function(metadata) {
            return '<img src="'+metadata.downloadURLs[0]+'" style="width:30px"/>';
        });
    } else {
        return message;
    }
}

function toggleButton () {
    if (message_input.value) {
        send_message.disabled = false;
    } else {
        send_message.disabled = true;
    }
}

// Saves a new message containing an image URI in Firebase.
// This first saves the image in Firebase storage.
function saveImageMessage(event) {
    event.preventDefault();
    var file = event.target.files[0];
    // Check if the file is an image.
    if (!file.type.match('image.*')) {
        var data = {
            message: 'You can only share images',
            timeout: 2000
        };
        console.log(data);
        return;
    }
    // We add a message with a loading icon that will get updated with the shared image.
    messagesRef.push({
        message: 'http://jafaronly.com/downloads/spin-32.gif',
        name: 'Jafar Jabr',
        message_type: 'message',
        phone: 123456,
        avatar: null,
        sender_id: my_id,
        order_id: 123456,
        date: Date.now()
    }).then(function (data) {
        // Upload the image to Cloud Storage.
        var filePath = 'just_test' + '/' + data.key + '/' + file.name;
        return storage.ref(filePath).put(file).then(function (snapshot) {
            // Get the file's Storage URI and update the chat message placeholder.
            var fullPath = snapshot.metadata.fullPath;
            return data.update({message: storage.ref(fullPath).toString()});
        }.bind(this));
    }.bind(this)).catch(function (error) {
        console.error('There was an error uploading a file to Cloud Storage:', error);
    });
}

    firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // ...
    });

})();