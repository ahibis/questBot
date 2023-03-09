const Client = require("./Client");
const QuestBotList = require("./QuestBotList");
const questionsData = require("./questions.json");

const delay = (gap) => new Promise((resolve) => setTimeout(resolve, gap));

class QuestBot {
  static questBots = {};
  client = undefined;
  currentQuestionId = undefined;
  countOfRightAnswers = 0;
  scores = 0;
  attempts = 0;
  _chatId = 0;
  get scoresForAns() {
    if (this.attempts == 0) return 3;
    if (this.attempts == 1) return 2;
    return 1;
  }
  get currentQuestion() {
    return questionsData[this.currentQuestionId];
  }
  constructor(socket, chatId) {
    this._chatId = chatId
    const questBot = QuestBotList.getByChatId(chatId);
    if (questBot) {
      return questBot;
    }
    QuestBotList.addQuestBot(this, chatId);
    this.client = new Client(socket, chatId);
  }
  get questionsCount() {
    return questionsData.length;
  }
  get isLastQuestion() {
    return this.currentQuestionId == this.questionsCount - 1;
  }
  get isStarted() {
    return this.currentQuestionId != undefined;
  }
  start() {
    this.currentQuestionId = 0;
    this.client.sendMessages([
      `Приветствую, я Квест бот.`,
      `Предлагаю вам поучаствовать в игре, в которой я буду задавать вопросы, а вы отвечать.`,
      `Если вы не знаете ответ напишите фразу "сдаюсь".`,
      `Для завершения игры напишите "завершить квест".`,
      `Раз вы меня потревожили, то думаю спрашивать хотите ли вы играть не стоит, а можно уже сразу начинать))))))) шлем`,
      `Так начнем!!!`,
      `Первый вопрос: ${this.getQuestionText() || ""}`,
    ]);
  }
  checkAnswer(ans) {
    return new RegExp(this.currentQuestion?.regexp, "i").test(ans);
  }
  getAnswer() {
    return this.currentQuestion?.ans;
  }
  getQuestionText() {
    return this.currentQuestion?.text;
  }
  nextQuestion() {
    if (this.isLastQuestion) return;
    this.currentQuestionId += 1;
    this.attempts = 0;
  }
  async complete() {
    this.client.sendMessage(
      `КВЕСТ ПРОЙДЕН\nВы ОГРОМНЫЙ молодец!!!\nВы дали ${
        this.countOfRightAnswers || 0
      } правильных ответов из ${this.questionsCount} и получили ${
        this.scores
      } очка`
    );
    await delay(100)
    if (this.scores < this.questionsCount * 1.5) {
      this.client.sendMessage(
        "https://www.youtube.com/watch?v=n9uEfydsQF8"
      );
    }
    if (this.scores == this.questionsCount * 3) {
      this.client.sendMessage(
        "ВЫ НАБРАЛИ МАКСИМУМ БАЛЛОВ, ВЫ СЛУЧАЙНО НЕ ГЕНИЙ"
      );
    }
    QuestBotList.removeQuestBot(this._chatId)
  }
  async reply(message) {
    if(/сдаюсь/i.test(message)){
      return this.giveUp()
    }
    if(/завершить квест/i.test(message)){
      return this.complete()
    }
    if (!this.isStarted) {
      return this.start();
    }
    if (this.checkAnswer(message)) {
      this.countOfRightAnswers += 1;
      this.scores += this.scoresForAns;
      if (this.isLastQuestion) return this.complete();
      this.client.sendMessage(
        `Вы дали правильный ответ за ${this.attempts} попыток и получили ${this.scoresForAns} очков !!!`
      );
      await delay(100);
      this.nextQuestion();
      this.client.sendMessage(
        `Следующий вопрос: ${this.getQuestionText()}`
      );
    } else {
      this.attempts += 1;
      if (this.attempts == 10) {
        this.client.sendMessage(`вы превысили лимит попыток`);
        return this.giveUp();
      }
      this.client.sendMessage(`Неправильный ответ. Попробуйте еще`);
    }
  }
  async giveUp() {
    if (!this.isStarted) {
      return this.start();
    }
    this.client.sendMessage(`Правильный ответ был ${this.getAnswer()}`);
    await delay(100);
    this.nextQuestion();
    this.client.sendMessage(
      `Следующий вопрос:
      ${this.getQuestionText()}`
    );
  }
}
module.exports = QuestBot;
