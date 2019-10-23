import io from 'socket.io-client';
import Utils from './Utils';

const chatSettings = require('../usage_example/ChatAndGoConfig').settings;

const socket = io(chatSettings.end_point, {
  timeout: 10000,
  jsonp: false,
  transports: ['websocket'],
  autoConnect: false,
});

const disconnect = () => {
  socket.removeAllListeners();
  socket.disconnect();
};

const listener = () => {
  return socket;
};

const deleteMessage = (roomId, messageId) => {
  socket.emit('deleteMessage', roomId, messageId);
};

const isTyping = (roomId, senderId, senderName) => {
  socket.emit('typing', roomId, senderId, senderName);
};

const subscribe = (roomId, senderId) => {
  socket.emit('subscribe', roomId, senderId);
};
const unsubscribe = (roomId, senderId) => {
  socket.emit('unsubscribe', roomId, senderId);
};

const messageSeen = messageId => {
  socket.emit('messageSeen', messageId);
};

const allMessageSeen = (roomId, senderId) => {
  socket.emit('allMyMessagesSeen', roomId, senderId);
};

const checkLastSeen = (roomId, senderId, callBack) => {
  socket.emit('checkLastSeen', roomId, senderId);
  socket.on('userLastSeen', data => {
    return callBack(data);
  });
};

const chatUp = (roomId, userId) => {
  socket.connect();

  socket.on('connect', () => {
    subscribe(roomId, userId);
  });

  socket.on('reconnect_attempt', () => {
    socket.io.opts.transports = ['polling', 'websocket'];
  });

  socket.on('reconnect_failed', () => {});

  socket.on('error', error => {
    console.warn(error.message);
  });

  socket.on('disconnect', reason => {
    unsubscribe(roomId, userId);
    if (reason === 'io server disconnect') {
      socket.connect();
    }
  });
};

const getAllMessages = (roomId, limit, page, callBack) => {
  socket.emit('getAllMessages', roomId, limit, page);
  socket.on('fetchMessages', data => {
    return callBack(data.oldMessages);
  });
};

const sendMessage = (message, senderId, roomId, customData) => {
  const messageId = Utils.default.makeRandomIdentifier(50);
  const createdAt = Utils.default.getTimeStamp();
  socket.emit('sendMessage', message, senderId, roomId, 0, messageId, customData, createdAt);
};

const sendImage = (imageFile, extension, senderId, roomId, type, customData) => {
  const messageId = Utils.default.makeRandomIdentifier();
  const createdAt = Utils.default.getTimeStamp();
  socket.emit(
      'sendImage',
      imageFile,
      messageId,
      extension,
      senderId,
      roomId,
      type,
      messageId,
      customData,
      createdAt,
  );
};

export default {
  chatUp,
  disconnect,
  subscribe,
  unsubscribe,
  getAllMessages,
  sendMessage,
  listener,
  sendImage,
  deleteMessage,
  isTyping,
  messageSeen,
  allMessageSeen,
  checkLastSeen,
};
