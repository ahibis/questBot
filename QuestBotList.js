class QuestBotList{
  questBots = {}
  getByChatId(chatId){
    return this.questBots[chatId]
  }
  addQuestBot(questBot, chatId){
    this.questBots[chatId] = questBot
  }
  removeQuestBot(chatId){
    delete this.questBots[chatId];
  }
}
const questBotsList = new QuestBotList()

module.exports = questBotsList