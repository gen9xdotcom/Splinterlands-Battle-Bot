const API = require('./api');
const Hive = require('./hive')
const WS = require('./ws')
require('dotenv').config()

class Bot {
  constructor() {}

  static async makeBOT(accounts) {
    let bot = new Bot();
    await bot._init(accounts);
    return bot;
  }

  async _init(accounts) {
    this._account = null;
    this._accounts = accounts;
    this._totalAccounts = accounts;
  }

  get account() {
    return this._account;
  }

  get accounts() {
    return this._accounts;
  }

  get totalAccounts() {
    return this._totalAccounts;
  }

  // MARK: GET NEXT ACCOUNT IN PROCESS
  async getNextAccount() {
    if (this.accounts.length > 0) {
      this._account = this.accounts[0];
      const [, ...remains] = this.accounts;
      this._accounts = remains;
      return this._account;
    } else {
      this._accounts = this.totalAccounts;
      return await this.getNextAccount();
    }
  }

  async start() {
    const account = await this.getNextAccount()

    const ecr = await API.Game.get_user_ecr(account, 0)

    if (ecr < parseInt(process.env.START_ECR, 10)) {
      return await Hive.send_dec_to_main_account(account).then(() => this.start())
    } else {
      // console.log('START: ', account.username);
      const cards = await API.Game.get_playable_cards(account, 4000, 0)
      return await Hive.transfer_card(account).then(() => this.battle(account, cards, ecr))
    }
  }

  async battle(account, cards, current_ecr) {
    var ecr = current_ecr
    if (ecr == undefined || ecr == null) {
      ecr = await API.Game.get_user_ecr(account, 0)
    }

    if (ecr < parseInt(process.env.STOP_ECR, 10)) {
      return await Hive.send_dec_to_main_account(account).then(() => this.start())
    } else {

      // console.log('BATTLE: ', account.username);
      var trx_id = await API.Game.create_new_battle_match(account)
      if (trx_id) {
        const quest = await API.Game.get_current_quest(account)
        const battle = await API.Game.get_battle_info(account, 0, 0)

        if (battle) {
          if (battle.id !== trx_id) {
            trx_id = battle.id
          }
          const enemy_team = await WS.get_enemy_team(account, battle.opponent_player)

          const team = await API.Private.get_best_team(account, battle, quest, cards, enemy_team, 0)

          if (team) {
            const submit_data = await API.Game.submit_team(account, trx_id, team)
            if (submit_data && submit_data.id) {
              const battle_tx = submit_data.id;
              if (battle_tx) {
                return await API.Game.get_battle_status(account, trx_id, submit_data.reveal_tx, 0)
                  .then(async (status) => {
                    if (status == 1) {
                      return await Hive.send_dec_to_main_account(account).then(() => this.start())
                    } else {
                      return await this.battle(account, cards, current_ecr * 0.99)
                    }
                  })
              }
            } else {
              return await Hive.send_dec_to_main_account(account).then(() => this.start())
            }

          }
        }
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 5000));
    return await this.battle(account, cards, current_ecr)
  }

}

module.exports = {
  Bot
}