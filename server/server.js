let app       =     require("express")();
let mysql     =     require("mysql");
let fs        =     require("fs");
let http      =     require('http').Server(app);
let io        =     require("socket.io")(http);
let pathLib   =     require('path');
require('events').EventEmitter.prototype._maxListeners = 100;
const chat_settings = require('../usage_example/chat_and_go_config').settings;
let onlineUsers = {};

/* Creating POOL MySQL connection.*/

let pool    =    mysql.createPool({
    connectionLimit   :   20000,
    host              :   'localhost',
    user              :   chat_settings.db_user,
    password          :   chat_settings.db_password,
    database          :   chat_settings.db_name,
    debug             :   false
});

app.get("/",function(req, res){
    let indexFile = pathLib.join(__dirname, '../index.html');
    res.sendFile(indexFile);
});

/*  This is auto initiated event when Client connects to Your Machine.  */

io.on('connection', function(socket){
    socket.on('subscribe', function(roomId, userId) {
        socket.join(roomId);
        console.log("A user "+userId+" is connected");
        if(!(roomId in onlineUsers)) {
            onlineUsers[roomId] = [];
        }
        if(!onlineUsers[roomId].includes(userId)) {
            onlineUsers[roomId].push(userId);
        }
        io.to(roomId).emit('whoIsOnline', {roomId: roomId, onlineUsers: onlineUsers[roomId]});
        getOldMessages(roomId, function(res) {
            io.to(roomId).emit('fetchMessages', {roomId: roomId, oldMessages: res});
        });
    });

    socket.on('unsubscribe', function(roomId, userId) {
        console.log('unsubscribe ' + roomId);
        socket.leave(roomId, () => {});
        if(onlineUsers[roomId] !== undefined) {
            for(let i = 0; i <= onlineUsers[roomId].length-1; i += 1) {
                if(onlineUsers[roomId][i] === userId) {
                    onlineUsers[roomId].splice(i, 1);
                }
            }
        }else {
            onlineUsers[roomId] = [];
        }
        io.to(roomId).emit('whoIsOnline', {roomId: roomId, onlineUsers: onlineUsers[roomId]});
        console.log(onlineUsers);
        updateLastOnline(roomId, userId, function(res) {
            console.log('updated last seen');
        });
    });

    socket.on('sendMessage', function(message, senderId, roomId, isImage, messageId, createdAt){
        console.log('sent to '+roomId);
        sendMessage(message, senderId, roomId, isImage, messageId, function(res){
            if(res){
                io.to(roomId).emit('messageReceived', {message_body:message, sender_id:senderId, roomId:roomId, is_image:isImage, message_id: messageId, created_at: createdAt});
                console.log(message);
            } else {
                io.to(roomId).emit('error');
                console.log('erroare')
            }
        });
    });

    socket.on('checkLastSeen', function(roomId, userId){
        getUserLastSeen(roomId, userId, function(res) {
            io.to(roomId).emit('userLastSeen', {roomId: roomId, last_seen: res});
        });
    });

    socket.on('deleteMessage', function(roomId, messageId){
        deleteMessage(messageId, function(res){
            if(res){
                 console.log('message deleted');
                 console.log(res);
                 io.to(roomId).emit('messageDeleted', {roomId: roomId, message_id: messageId});
            } else {
                console.log('erroare')
            }
        });
    });

    socket.on('messageSeen', function(message_id){
        setMessageIsSeen(message_id, function(res){
            if(res){
                console.log('message seen');
            } else {
                console.log('erroare')
            }
        });
    });

    socket.on('allMyMessagesSeen', function(roomId, userId){
        bulkMessageIsSeen(roomId, userId, function(res){
            if(res){
                console.log('message seen');
            } else {
                console.log('erroare')
            }
        });
    });

    socket.on('sendImage', function(imageFile, fileName, extension, senderId, roomId, type, messageId, createdAt) {
        let fullName = fileName+"."+extension;
        let path = pathLib.join(__dirname, '../chat_images/'+fullName);
        fs.writeFile(path, imageFile, type,function(err) {
            if(err) {
                console.log(err);
            } else {
                sendMessage(fullName, senderId, roomId, 1, messageId, function(res){
                    if(res){
                        io.to(roomId).emit('messageReceived', {'message_body':fullName, 'unique_name': fileName, 'sender_id':senderId, 'roomId':roomId, 'is_image':1, 'message_id': messageId, 'created_at': createdAt});
                    } else {
                        io.to(roomId).emit('error');
                        console.log('erroare')
                    }
                });
            }
        });
    });
    socket.on('typing', function(senderName, senderId, roomId) {
        console.log(senderName+ ' typing');
        io.to(roomId).emit('typing', {'roomId': roomId, 'sender_name': senderName, 'sender_id': senderId})
    });
});


const getOldMessages = (roomId, callback) => {
    pool.getConnection(function(err, connection){
        if (err) {
            callback(false);
            return;
        }
        connection.query("SELECT * FROM `chats` where `room_id` = '"+ roomId+"'", function (err, result, fields) {
           connection.release();
            if(!err) {
                return callback(result);
            }else{
                return callback([]);
            }
        });
        connection.on('error', function(err) {
            return callback([]);
        });
    });
};

const getUserLastSeen = (roomId, userId, callback) => {
    pool.getConnection(function(err, connection){
        if (err) {
            callback(false);
            return;
        }
        connection.query("SELECT `last_online` FROM `chats` where `room_id` = '"+ roomId+"' AND sender_id = '"+userId+"' LIMIT 1;", function (err, result, fields) {
            connection.release();
            if(!err) {
                return callback(result);
            }else{
                return callback([]);
            }
        });
        connection.on('error', function(err) {
            return callback([]);
        });
    });
};

const sendMessage = (message, senderId, roomId, isImage, messageId, callback) => {
    pool.getConnection(function(err, connection){
        if (err) {
            console.log(err);
            callback(false);
            return;
        }
        let timeStamp = getTimeStamp();
        connection.query("INSERT INTO `chats` (`sender_id`, `room_id`, `message_body`, `is_image`, `message_id`, `created_at`, `updated_at`) VALUES ('"+senderId+"', '"+roomId+"', "+connection.escape(message)+", '"+isImage+"', '"+messageId+"', '"+timeStamp+"', '"+timeStamp+"')", function(err, rows){
            connection.release();
            if(!err) {
                return callback(true);
            }else{
                console.log(err);
            }
        });
        connection.on('error', function(err) {
            console.log(err);
            return callback(false);
        });
    });
};

const deleteMessage = (messageId, callback) => {
    pool.getConnection(function(err, connection){
        if (err) {
            console.log(err);
            return callback(false);
        }
        connection.query("UPDATE `chats` SET `is_deleted` = 1 WHERE `message_id` = '"+messageId+"';", function(err, rows){
            connection.release();
            if(!err) {
                return callback(true);
            }else{
                console.log(err);
            }
        });
        connection.on('error', function(err) {
            console.log(err);
            return callback(false);
        });
    });
};

const setMessageIsSeen = (messageId, callback) => {
    pool.getConnection(function(err, connection){
        if (err) {
            console.log(err);
            return callback(false);
        }
        connection.query("UPDATE `chats` SET `is_seen` = 1 WHERE `message_id` = '"+messageId+"';", function(err, rows){
            connection.release();
            if(!err) {
                return callback(true);
            }else{
                console.log(err);
            }
        });
        connection.on('error', function(err) {
            console.log(err);
            return callback(false);
        });
    });
};

const bulkMessageIsSeen = (roomId, userId, callback) => {
    pool.getConnection(function(err, connection){
        if (err) {
            console.log(err);
            return callback(false);
        }
        connection.query("UPDATE `chats` SET `is_seen` = 1 WHERE `sender_id` = '"+userId+"' AND `room_id` = '"+roomId+"' AND `is_seen` = 0;", function(err, rows){
            connection.release();
            if(!err) {
                return callback(true);
            }else{
                console.log(err);
            }
        });
        connection.on('error', function(err) {
            console.log(err);
            return callback(false);
        });
    });
};

const updateLastOnline = (roomId, userId, callback) => {
    pool.getConnection(function(err, connection){
        if (err) {
            console.log(err);
            return callback(false);
        }
        let current_time = getTimeStamp();
        connection.query("UPDATE `chats` SET `last_online` = '"+current_time+"' WHERE `sender_id` = '"+userId+"' AND `room_id` = '"+roomId+"';", function(err, rows){
            connection.release();
            if(!err) {
                return callback(true);
            }else{
                console.log(err);
            }
        });
        connection.on('error', function(err) {
            console.log(err);
            return callback(false);
        });
    });
};

const getTimeStamp = () => {
    const now = new Date();
    return `${now.getFullYear()}/${
        now.getMonth() + 1 < 10 ? `0${now.getMonth() + 1}` : now.getMonth() + 1
    }/${now.getDate() < 10 ? `0${now.getDate()}` : now.getDate()} ${
        now.getHours() < 10 ? `0${now.getHours()}` : now.getHours()
    }:${now.getMinutes() < 10 ? `0${now.getMinutes()}` : now.getMinutes()}:${
        now.getSeconds() < 10 ? `0${now.getSeconds()}` : now.getSeconds()
    }`;
};

http.listen(3000, function(){
    console.log("Listening on 3000");
});