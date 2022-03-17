const {
  default: axios
} = require("axios");
const Hive = require('../hive');
const {
  rnd
} = require("../utils");
require('dotenv').config()
const moment = require('moment')
const md5 = require('md5');
const ecc = require('eosjs-ecc');

exports.create_new_battle_match = async (account) => {
  try {

    const signed_tx = await Hive.sign_new_battle_match(account)

    const {
      data
    } = await axios({
      url: 'https://battle.splinterlands.com/battle/battle_tx',
      method: 'POST',
      data: new URLSearchParams({
        signed_tx,
      }),
      proxy: account.proxy,
      httpAgent: null,
      httpsAgent: null,
    });

    if (data && data.success) {
      console.log(`${account.username} FIND MATCH: `, data.id);
      return data.id;
    }

    return null;
  } catch (error) {
    console.log(`${account.username} FIND MATCH ERROR: `, error.message);
    return null;
  }
}

exports.submit_team = async (account, trx_id, team) => {
  try {

    let summoner = `starter-${team.summoner_id}-${rnd(5)}`;

    let monsters = [];
    if (parseInt(team.monster1, 10) > 0) {
      let monster = `starter-${team.monster1}-${rnd(5)}`;
      monsters.push(monster);
    }
    if (parseInt(team.monster2, 10) > 0) {
      let monster = `starter-${team.monster2}-${rnd(5)}`;
      monsters.push(monster);
    }
    if (parseInt(team.monster3, 10) > 0) {
      let monster = `starter-${team.monster3}-${rnd(5)}`;
      monsters.push(monster);
    }
    if (parseInt(team.monster4, 10) > 0) {
      let monster = `starter-${team.monster4}-${rnd(5)}`;
      monsters.push(monster);
    }
    if (parseInt(team.monster5, 10) > 0) {
      let monster = `starter-${team.monster5}-${rnd(5)}`;
      monsters.push(monster);
    }
    if (parseInt(team.monster6, 10) > 0) {
      let monster = `starter-${team.monster6}-${rnd(5)}`;
      monsters.push(monster);
    }

    let secret = rnd(10);
    let team_hash = md5(`${summoner},${monsters.join()},${secret}`);

    const signed_tx = await Hive.sign_submit_team(account, trx_id, team_hash, secret);

    const reveal_signed_tx = await Hive.sign_reveal_team(account, trx_id, summoner, monsters, secret);

    const {
      data
    } = await axios({
      url: 'https://battle.splinterlands.com/battle/battle_tx',
      method: 'POST',
      data: new URLSearchParams({
        signed_tx,
      }),
      proxy: account.proxy,
      httpAgent: null,
      httpsAgent: null,
    });

    if (data && data.success) {
      console.log(`${account.username} SUBMIT TEAM: `, data.id);
      return {
        id: data.id,
        reveal_tx: reveal_signed_tx,
      };
    }
    return null;
  } catch (error) {
    console.log(`${account.username} SUBMIT TEAM ERROR: `, error.message);
    return null;
  }
}

exports.reveal_team = async (account, signed_tx) => {
  try {
    const {
      data
    } = await axios({
      url: 'https://battle.splinterlands.com/battle/battle_tx',
      method: 'POST',
      data: new URLSearchParams({
        signed_tx,
      }),
      proxy: account.proxy,
      httpAgent: null,
      httpsAgent: null,
    });
    if (data && data.success) {
      // console.log(`${account.username} REVEAL TEAM: `, data.id);
      return data.id;
    }
    console.log(`${account.username} REVEAL TEAM ERROR: `, data);
    return null;
  } catch (error) {
    console.log(`${account.username} REVEAL TEAM ERROR: `, error.message);
    return null;
  }
}

exports.get_battle_info = async (account, retry, timeout) => {
  if (retry > 120) {
    return null;
  }
  try {
    if (timeout) {
      await new Promise((resolve) => setTimeout(resolve, timeout));
    }

    const {
      data
    } = await axios({
      url: `${process.env.GAME_API}/players/outstanding_match?username=${account.username}`,
      proxy: account.proxy,
      httpAgent: null,
      httpsAgent: null,
    });

    if (data && data !== null && parseInt(data.mana_cap, 10) > 0) {
      // console.log(`${account.username} BATTLE INFO: `, {
      //   id: data.id,
      //   player: data.player,
      //   mana_cap: data.mana_cap,
      //   ruleset: data.ruleset,
      //   inactive: data.inactive,
      //   opponent_player: data.opponent_player
      // });
      return data;
    }
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return await this.get_battle_info(account, retry + 1, timeout);
  } catch (error) {
    console.log(`${account.username} GET BATTLE INFO ERROR: `, error.message);
    await new Promise((resolve) => setTimeout(resolve, 60000));
    return await this.get_battle_info(account, retry + 1, timeout);
  }
}

exports.get_current_quest = async (account, timeout) => {
  try {
    if (account === null || account === undefined) {
      return null;
    }

    if (timeout) {
      await new Promise((resolve) => setTimeout(resolve, timeout));
    }

    const {
      data
    } = await axios({
      url: `${process.env.GAME_API}/players/quests?username=${account.username}`,
      proxy: account.proxy,
      httpAgent: null,
      httpsAgent: null,
    });

    if (data && data.length > 0) {

      let quest = data[0];
      // console.log(`${account.username} CURRENT QUEST: `, {
      //   id: quest.id,
      //   player: quest.player,
      //   name: quest.name,
      //   total_items: quest.total_items,
      //   completed_items: quest.completed_items,
      //   claim_trx_id: quest.claim_trx_id
      // });
      if (quest.total_items === quest.completed_items && quest.claim_trx_id == null) {
        await Hive.claim_quest(account, quest)
      }

      if (quest.total_items === quest.completed_items) {
        let created_date = moment(quest.created_date);
        let now = moment();
        let duration = moment.duration(now.diff(created_date));
        let seconds = duration.asSeconds();
        if (seconds >= 23 * 3600) {
          await Hive.start_quest(account)
        }
      }

      return quest;
    }

    return null;
  } catch (error) {
    console.log(`${account.username} GET QUEST ERROR: `, error.message);
    return null;
  }
}

exports.get_playable_cards = async (account, timeout, retry) => {
  if (retry > 5) {
    return [];
  }
  try {
    if (account === null || account === undefined) {
      return [];
    }

    if (timeout) {
      await new Promise((resolve) => setTimeout(resolve, timeout));
    }

    const {
      data
    } = await axios({
      url: `${process.env.GAME_API}/cards/collection/${account.username}`,
      proxy: account.proxy,
      httpAgent: null,
      httpsAgent: null,
    });

    if (data && data.cards && data.cards.length > 0) {
      return data.cards.filter((card) => {
        if (card.market_id && card.market_listing_status == 0) return false;

        if (card.delegated_to && card.delegated_to != account.username) return false;

        return true;
      });
    }

    return [];
  } catch (error) {
    console.log(`${account.username} GET PLAYABLE CARD ERROR: `, error.message);
    return await this.get_playable_cards(account, timeout, retry + 1);
  }
}

exports.find_card = async (uid, account, retry) => {
  if (retry > 15) {
    return null;
  }

  try {
    const {
      data
    } = await axios({
      url: `${process.env.GAME_API}/cards/find?ids=${uid}`,
      proxy: account.proxy,
      httpAgent: null,
      httpsAgent: null,
    });

    if (data && data.length > 0) {
      return data[0];
    } else {
      return null;
    }
  } catch (error) {
    console.log(`${account.username} FIND CARD: `, error.message);
    await new Promise((resolve) => setTimeout(resolve, 10000));
    return await this.find_card(uid, account, retry + 1);
  }
};

exports.get_battle_status = async (account, battle_tx, reveal_tx, retry) => {
  if (retry > 60) {
    return 2;
  }

  try {

    const {
      data
    } = await axios({
      url: `${process.env.GAME_API}/battle/status?id=${battle_tx}`,
      proxy: account.proxy,
      httpAgent: null,
      httpsAgent: null,
    });

    if (data) {
      if (data.id && data.status) {
        // console.log(`${account.username} BATTLE STATUS: `, {
        //   id: data.id,
        //   player: data.player,
        //   status: data.status
        // });
      } else if (data && (typeof data === 'string' || data instanceof String) && data.includes('Error: no battle queue transaction found with ID')) {
        console.log(`${account.username} ${data}`);
        return 1
      }
    }

    if (data && data.opponent_team_hash && data.opponent_team_hash.length > 0) {
      await this.reveal_team(account, reveal_tx);
    }

    if (data && data.id === battle_tx) {

      let status = parseInt(data.status, 10);
      if (status === 2) {
        return status;
      }

    }

    await new Promise((resolve) => setTimeout(resolve, 3000));
    return await this.get_battle_status(account, battle_tx, reveal_tx, retry + 1);
  } catch (error) {
    console.log(`${account.username} CHECK BATTLE STATUS ERROR: `, error.message);
    if (error.code == 429) {
      await new Promise((resolve) => setTimeout(resolve, 30000));
    } else {
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
    return await this.get_battle_status(account, battle_tx, reveal_tx, retry + 1);
  }
}

exports.get_user_ecr = async (account, retry) => {
  if (retry > 10) {
    return 80;
  }

  try {

    const {
      data
    } = await axios({
      url: `${process.env.GAME_API}/players/balances?username=${account.username}`,
      proxy: account.proxy,
      httpAgent: null,
      httpsAgent: null,
    });

    let objects = data.filter((_obj) => _obj.token === 'ECR');
    if (objects && objects.length > 0) {
      let ecrToken = objects[0];

      let last_reward_time = moment(ecrToken.last_reward_time);
      let now = moment();
      let duration = moment.duration(now.diff(last_reward_time));
      let hours = duration.asHours();

      let newEcr = (parseFloat(ecrToken.balance) + hours * 1.04 * 100) / 100;
      let ecr = Math.min(newEcr, 100);
      console.log(`${account.username} GET ECR: ${ecr}%`);
      return ecr;
    } else {
      return 70;
    }
  } catch (error) {
    console.log(`${account.username} GET ECR ERROR: `, error.message);
    if (error.code == 429) {
      await new Promise((resolve) => setTimeout(resolve, 30000));
    } else {
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    return await this.get_user_ecr(account, retry + 1);
  }
}

exports.get_user_balance = async (account) => {
  try {
    const {
      data
    } = await axios({
      url: `https://api2.splinterlands.com/players/balances?username=${account.username}`,
      proxy: account.proxy,
      httpAgent: null,
      httpsAgent: null,
    });

    return data
  } catch (error) {
    console.log(error);
    return []
  }
}

exports.delegate_more_hp = async (account) => {
  try {
    let ts = Date.now();
    const sig = ecc.sign(account.username + ts, account.posting_key);

    const {
      data
    } = await axios({
      url: `${process.env.GAME_API}/players/login?name=${account.username}&ts=${ts}&sig=${sig}`,
      proxy: account.proxy,
      httpAgent: null,
      httpsAgent: null,
    });

    if (data && data.token && data.token.length > 0) {

      const response = await axios({
        url: `${process.env.GAME_API}/players/delegation?token=${data.token}&username=${data.name}`,
        proxy: account.proxy,
        httpAgent: null,
        httpsAgent: null,
      });

      if (response.data && response.data.error && response.data.error.length > 0) {
        console.log(`${account.username} can not delegate`, response.data);
        return false;
      } else {
        console.log(`${account.username} is delegated more HP`, response.data);
        return true;
      }
    }

    return false
  } catch (error) {
    console.log(`${account.username} delegate hp error: `, error.message);
    return false
  }

}