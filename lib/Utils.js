const makeRandomIdentifier = length => {
  const result = [];
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i += 1) {
    result.push(characters.charAt(Math.floor(Math.random() * charactersLength)));
  }
  return result.join('');
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
module.exports = { makeRandomIdentifier, getTimeStamp };
