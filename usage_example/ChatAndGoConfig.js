const chatConf = {
  db_user: 'jafar',
  db_password: '68yIr5K1',
  db_name: 'bringo_chat',
  end_point: 'https://chat-and-go.ascendnet.ro',
  loading_image: 'https://chat-and-go.ascendnet.ro/assets/images/loading.gif',
  images_path: 'https://chat-and-go.ascendnet.ro/chat_images/',
  port: 3000,
};

try {
  exports.settings = chatConf;
} catch (err) {}

//// const socket = io('http://192.168.11.206:3000', {
// const socket = io('http://192.168.0.107:3000', {
// // const socket = io('https://chat-and-go.ascendnet.ro', {
