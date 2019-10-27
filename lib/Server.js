const app = require('express')();
const fs = require('fs');
const http = require('http').Server(app);
const io = require('socket.io')(http);
const pathLib = require('path');
const DatabaseHandler = require('./DatabaseHandler');
const chatSettings = require('../usage_example/ChatAndGoConfig').settings;

const onlineUsers = {};

app.get('/', (req, res) => {
  const indexFile = pathLib.join(__dirname, '../index.html');
  res.sendFile(indexFile);
});

/*  This is auto initiated event when Client connects to Your Machine.  */

io.on('connection', socket => {
  socket.on('subscribe', (roomId, userId) => {
    if(!roomId) {
      return;
    }
    socket.join(roomId);
    console.log(`A user ${userId} is connected`);
    if (!(roomId in onlineUsers)) {
      onlineUsers[roomId] = [];
    }
    if (!onlineUsers[roomId].includes(userId)) {
      onlineUsers[roomId].push(userId);
    }
    io.to(roomId).emit('whoIsOnline', { roomId, onlineUsers: onlineUsers[roomId] });
  });

  socket.on('unsubscribe', (roomId, userId) => {
    console.log(`unsubscribe ${roomId}`);
    socket.leave(roomId, () => {});
    if (onlineUsers[roomId] !== undefined) {
      for (let i = 0; i <= onlineUsers[roomId].length - 1; i += 1) {
        if (onlineUsers[roomId][i] === userId) {
          onlineUsers[roomId].splice(i, 1);
        }
      }
    } else {
      onlineUsers[roomId] = [];
    }
    io.to(roomId).emit('whoIsOnline', { roomId, onlineUsers: onlineUsers[roomId] });
    console.log(onlineUsers);
    DatabaseHandler.updateLastOnline(roomId, userId, res => {
      console.log(`updated last seen ${res}`);
    });
  });

  socket.on(
    'sendMessage',
    (message, senderId, roomId, isImage, messageId, customData, createdAt) => {
    console.log(`sent to ${roomId}`);
      DatabaseHandler.sendMessage(
        message,
        senderId,
        roomId,
        isImage,
        messageId,
        customData,
        res => {
          if (res) {
            io.to(roomId).emit('messageReceived', {
              message_body: message,
              sender_id: senderId,
              room_id: roomId,
              is_image: isImage,
              message_id: messageId,
              custom_data: JSON.stringify(customData),
              is_seen: 0,
              is_deleted: 0,
              last_online: createdAt,
              created_at: createdAt,
            });
            console.log(message);
          } else {
            io.to(roomId).emit('error');
            console.log('erroare');
          }
        },
      );
    },
  );

  socket.on('checkLastSeen', (roomId, userId) => {
    DatabaseHandler.getUserLastSeen(roomId, userId, res => {
      io.to(roomId).emit('userLastSeen', { roomId, last_seen: res });
    });
  });

  socket.on('deleteMessage', (roomId, messageId) => {
    DatabaseHandler.deleteMessage(messageId, res => {
      if (res) {
        console.log('message deleted');
        console.log(res);
        io.to(roomId).emit('messageDeleted', { roomId, message_id: messageId });
      } else {
        console.log('erroare');
      }
    });
  });

  socket.on('messageSeen', messageId => {
    DatabaseHandler.setMessageIsSeen(messageId, res => {
      if (res) {
        console.log('message seen');
      } else {
        console.log('erroare');
      }
    });
  });

  socket.on('allMyMessagesSeen', (roomId, userId) => {
    DatabaseHandler.bulkMessageIsSeen(roomId, userId, res => {
      if (res) {
        console.log('message seen');
      } else {
        console.log('erroare');
      }
    });
  });

  socket.on(
    'sendImage',
    (imageFile, fileName, extension, senderId, roomId, type, messageId, customData, createdAt) => {
      const fullName = `${fileName}.${extension}`;
      const path = pathLib.join(__dirname, `../chat_images/${fullName}`);
      fs.writeFile(path, imageFile, type, err => {
        if (err) {
          console.log(err);
        } else {
          DatabaseHandler.sendMessage(fullName, senderId, roomId, 1, messageId, customData, res => {
            if (res) {
              io.to(roomId).emit('messageReceived', {
                message_body: fullName,
                sender_id: senderId,
                room_id: roomId,
                is_image: 1,
                message_id: messageId,
                is_seen: 0,
                is_deleted: 0,
                last_online: createdAt,
                custom_data: JSON.stringify(customData),
                created_at: createdAt,
              });
            } else {
              io.to(roomId).emit('error');
              console.log('erroare');
            }
          });
        }
      });
    },
  );
  socket.on('typing', (roomId, senderId, senderName) => {
    console.log(`${senderName} typing`);
    io.to(roomId).emit('typing', { roomId, senderName, senderId });
  });

  socket.on('getAllMessages', (roomId, limit, page) => {
    DatabaseHandler.getOldMessages(roomId, limit, page, res => {
      io.to(roomId).emit('fetchMessages', { roomId, oldMessages: res });
    });
  });
});

http.listen(chatSettings.port, () => {
  console.log(`Listening on  ${chatSettings.port}`);
});
