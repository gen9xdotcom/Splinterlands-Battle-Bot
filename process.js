const {
  Bot
} = require('./bot');


var Config = require('./configs');

exports.start = async () => {
  const processes = await Config.get_proxies();
  const accounts = await Config.get_accounts();

  let number_process = processes.length;
  if (number_process <= 0) {
    number_process = 1;
  }
  if (accounts.length < processes.length) {
    number_process = accounts.length;
  }

  for (let index = 0; index < number_process; index++) {
    var subAccounts = [];
    for (let pos = 0; pos < accounts.length; pos++) {
      if (pos % number_process == index) {
        var account = accounts[pos];
        account.proxy = processes[index];
        subAccounts.push(account);
      }
    }
    const bot = Bot.makeBOT(subAccounts, index);
    (await bot).start();
  }
};