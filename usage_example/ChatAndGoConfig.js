const chatConf = {
  db_user: 'jafar',
  db_password: '123456',
  db_name: 'bringo_chat',
  end_point: 'http://192.168.0.107:3000',
  loading_image: 'http://chat-and-go.com/assets/images/loading.gif',
  images_path: 'http://chat-and-go.com/chat_images/',
  port: 3000,
};

try {
  exports.settings = chatConf;
} catch (err) {}

//// const socket = io('http://192.168.11.206:3000', {
// const socket = io('http://192.168.0.107:3000', {
// // const socket = io('https://chat-and-go.ascendnet.ro', {
