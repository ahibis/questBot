const TelegramBot = require("node-telegram-bot-api");
const QuestBot = require("./QuestBot")

const token = "6190850869:AAG9DKI6PbfnODzvh2gE0QZIB_yRFvLokwM";

const bot = new TelegramBot(token, { polling: true });
console.log("bot was started...");
bot.onText(/(.+)/, (msg, match) => {
  const questBot = new QuestBot(bot, msg.chat.id);
  questBot.reply(msg.text)
});
