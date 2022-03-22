const {
  default: axios
} = require('axios');
require('dotenv').config()

exports.get_best_team = async (account, battle, quest, cards, enemy_team, retry) => {

  if (retry > 10) {
    return null
  }

  try {

    const myCards = cards.map((_obj) => _obj.card_detail_id);

    const postData = {
      summonerIds: [167, 440, 178, 437, 189, 439, 156, 441, 145, 438, 224],
      quest,
      username: account.username,
      mana_cap: battle.mana_cap,
      enemy: battle.opponent_player,
      ruleset: battle.ruleset,
      inactive: battle.inactive,
      myCards,
      enemy_team,
    };

    const {
      data
    } = await axios.post(`${process.env.PRIVATE_API}/v1/bot`, postData);

    // console.log(`${account.username} GET TEAM DATA: `, data);
    return data

  } catch (error) {
    console.log(`${account.username} GET TEAM DATA ERROR: `, error.message);
    await new Promise((resolve) => setTimeout(resolve, 5000));
    return await this.get_best_team(account, battle, quest, cards, enemy_team, retry + 1)
  }
}