const delay = (gap) => new Promise((resolve) => setTimeout(resolve, gap));
class Client {
  chatId = 0;
  socket = undefined;
  constructor(socket, chatId) {
    this.chatId = chatId;
    this.socket = socket;
  }
  sendMessage(message) {
    this.socket.sendMessage(this.chatId, message);
  }
  async sendMessages(messages, gap = 100) {
    for (let message of messages) {
      await delay(gap);
      this.sendMessage(message);
    }
  }
}
module.exports = Client;
