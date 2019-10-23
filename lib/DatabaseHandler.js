const mysql = require('mysql');
const Utils = require('./Utils').default;
const chatSettings = require('../usage_example/ChatAndGoConfig').settings;

/* Creating POOL MySQL connection. */

const pool = mysql.createPool({
  connectionLimit: 20000,
  host: 'localhost',
  user: chatSettings.db_user,
  password: chatSettings.db_password,
  database: chatSettings.db_name,
  debug: false,
});

const getOldMessages = (roomId, limit, page, callback) => {
  const total = 100;
  const offset = Math.min((page - 1) * limit, total);
  const paginationPart = ` LIMIT ${limit} OFFSET ${offset}`;
  pool.getConnection((err, connection) => {
    if (err) {
      callback(false);
      return;
    }
    connection.query(
      `SELECT * FROM \`chats\` where \`room_id\` = '${roomId}'${paginationPart}`,
      (error, result, fields) => {
        connection.release();
        if (!error) {
          return callback(result);
        }
        return callback([]);
      },
    );
    connection.on('error', err => {
      return callback([]);
    });
  });
};

const getUserLastSeen = (roomId, userId, callback) => {
  pool.getConnection((err, connection) => {
    if (err) {
      callback(false);
      return;
    }
    connection.query(
      `SELECT \`last_online\` FROM \`chats\` where \`room_id\` = '${roomId}' AND sender_id = '${userId}' LIMIT 1;`,
      (error, result, fields) => {
        connection.release();
        if (!error) {
          return callback(result);
        }
        return callback([]);
      },
    );
    connection.on('error', eror => {
      return callback([]);
    });
  });
};

const sendMessage = (message, senderId, roomId, isImage, messageId, customData, callback) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      callback(false);
      return;
    }
    const timeStamp = Utils.getTimeStamp();
    connection.query(
      `INSERT INTO \`chats\` (\`sender_id\`, \`room_id\`, \`message_body\`, \`is_image\`, \`message_id\`,\`custom_data\`, \`created_at\`, \`updated_at\`) VALUES ('${senderId}', '${roomId}', ${connection.escape(
        message,
      )}, '${isImage}', '${messageId}', '${JSON.stringify(
        customData,
      )}', '${timeStamp}', '${timeStamp}')`,
      (error, rows) => {
        connection.release();
        if (!error) {
          return callback(true);
        }
        console.log(error);

        return callback(false);
      },
    );
    connection.on('error', eror => {
      console.log(eror);
      return callback(false);
    });
  });
};

const deleteMessage = (messageId, callback) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      return callback(false);
    }
    connection.query(
      `UPDATE \`chats\` SET \`is_deleted\` = 1 WHERE \`message_id\` = '${messageId}';`,
      (error, rows) => {
        connection.release();
        if (!error) {
          return callback(true);
        }
        console.log(error);
        return callback(false);
      },
    );
    connection.on('error', errors => {
      console.log(errors);
      return callback(false);
    });
    return callback(true);
  });
};

const setMessageIsSeen = (messageId, callback) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      return callback(false);
    }
    connection.query(
      `UPDATE \`chats\` SET \`is_seen\` = 1 WHERE \`message_id\` = '${messageId}';`,
      (error, rows) => {
        connection.release();
        if (!error) {
          return callback(true);
        }
        console.log(error);
        return callback(false);
      },
    );
    connection.on('error', errors => {
      console.log(errors);
      return callback(false);
    });
    return callback(false);
  });
};

const bulkMessageIsSeen = (roomId, userId, callback) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      return callback(false);
    }
    connection.query(
      `UPDATE \`chats\` SET \`is_seen\` = 1 WHERE \`sender_id\` = '${userId}' AND \`room_id\` = '${roomId}' AND \`is_seen\` = 0;`,
      (error, rows) => {
        connection.release();
        if (!error) {
          return callback(true);
        }
        console.log(error);
        return callback(false);
      },
    );
    connection.on('error', errors => {
      console.log(errors);
      return callback(false);
    });
    return callback(false);
  });
};

const updateLastOnline = (roomId, userId, callback) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      return callback(false);
    }
    const currentTime = Utils.getTimeStamp();
    connection.query(
      `UPDATE \`chats\` SET \`last_online\` = '${currentTime}' WHERE \`sender_id\` = '${userId}' AND \`room_id\` = '${roomId}';`,
      (error, rows) => {
        connection.release();
        if (!error) {
          return callback(true);
        }
        console.log(error);
        return callback(false);
      },
    );
    connection.on('error', errors => {
      console.log(errors);
      return callback(false);
    });
    return callback(false);
  });
};

exports.default = { getOldMessages,
  getUserLastSeen,
  sendMessage,
  deleteMessage,
  setMessageIsSeen,
  bulkMessageIsSeen,
  updateLastOnline, };
