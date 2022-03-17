const {
  Client,
  PrivateKey
} = require("@hiveio/dhive");
const {
  rnd
} = require("../utils");

const client = new Client(['https://anyx.io',
  'https://hived.splinterlands.com',
  'https://hived-2.splinterlands.com',
  'https://api.openhive.network',
  'https://api.hive.blog',
]);

const API = require('../api/game')
const Config = require('../configs');

async function loadChainProps() {
  const result = await client.database.getDynamicGlobalProperties()
  const header = await client.database.getBlockHeader(result.last_irreversible_block_num)
  return {
    ref_block_num: result.last_irreversible_block_num,
    ref_block_id: header.previous,
    ref_block_prefix: Buffer.from(header.previous, 'hex').readUInt32LE(4),
    time: new Date(result.time + 'Z'),
  }
}

async function signTransaction(operations, key) {
  const chain_props = await loadChainProps()

  const transaction = {
    ref_block_num: chain_props.ref_block_num & 0xFFFF,
    ref_block_prefix: chain_props.ref_block_prefix,
    expiration: new Date(chain_props.time.getTime() + 600 * 1000).toISOString().split('.')[0],
    extensions: [],
    operations
  }

  const signed_transaction = await client.broadcast.sign(transaction, PrivateKey.fromString(key))
  return signed_transaction
}

exports.sign_new_battle_match = async (account) => {
  try {
    let json = {
      match_type: 'Ranked',
      app: 'splinterlands/0.7.139',
      n: rnd(10)
    };

    const custom_json = {
      id: 'sm_find_match',
      json: JSON.stringify(json),
      required_auths: [],
      required_posting_auths: [account.username.toLowerCase()],
    };

    const operations = [
      ['custom_json', custom_json]
    ];

    const signed_transaction = await signTransaction(operations, account.posting_key)
    return JSON.stringify(signed_transaction)
  } catch (error) {
    console.log(`${account.username} SIGN FIND MATCH ERROR`, error.message);
  }
}

exports.sign_submit_team = async (account, trx_id, team_hash, secret) => {
  try {
    let json = {
      trx_id,
      team_hash,
      secret,
      app: 'splinterlands/0.7.139',
      n: rnd(10),
    };

    const custom_json = {
      id: 'sm_submit_team',
      json: JSON.stringify(json),
      required_auths: [],
      required_posting_auths: [account.username.toLowerCase()],
    };

    const operations = [
      ['custom_json', custom_json]
    ];

    const signed_transaction = await signTransaction(operations, account.posting_key)
    return JSON.stringify(signed_transaction)
  } catch (error) {
    console.log(`${account.username} SIGN SUBMIT TEAM ERROR`, error.message);
  }
}

exports.sign_reveal_team = async (account, trx_id, summoner, monsters, secret) => {
  try {
    let json = {
      trx_id,
      summoner,
      monsters,
      secret,
      app: 'splinterlands/0.7.139',
      n: rnd(10),
    };

    const custom_json = {
      id: 'sm_team_reveal',
      json: JSON.stringify(json),
      required_auths: [],
      required_posting_auths: [account.username.toLowerCase()],
    };

    const operations = [
      ['custom_json', custom_json]
    ];

    const signed_transaction = await signTransaction(operations, account.posting_key)
    return JSON.stringify(signed_transaction)
  } catch (error) {
    console.log(`${account.username} SIGN REVEAL TEAM ERROR`, error.message);

  }
}

exports.claim_quest = async (account, quest) => {
  try {
    let json = {
      type: 'quest',
      quest_id: quest.id,
      app: 'splinterlands/0.7.139',
      n: rnd(10),
    };

    const custom_json = {
      id: 'sm_claim_reward',
      json: JSON.stringify(json),
      required_auths: [],
      required_posting_auths: [account.username.toLowerCase()],
    };

    const transaction = await client.broadcast.json(custom_json, PrivateKey.fromString(account.posting_key))
    console.log(`${account.username} CLAIM QUEST`, transaction);
    return transaction
  } catch (error) {
    console.log(`${account.username} CLAIM QUEST ERROR`, error.message);
  }
}

exports.start_quest = async (account) => {
  try {
    let json = {
      type: 'daily',
      app: 'splinterlands/0.7.139',
      n: rnd(10),
    };

    const custom_json = {
      id: 'sm_start_quest',
      json: JSON.stringify(json),
      required_auths: [],
      required_posting_auths: [account.username.toLowerCase()],
    };

    const transaction = await client.broadcast.json(custom_json, PrivateKey.fromString(account.posting_key))
    console.log(`${account.username} START QUEST`, transaction);
    return transaction
  } catch (error) {
    console.log(`${account.username} START QUEST ERROR`, error.message);
  }
}

exports.send_dec_to_main_account = async (account) => {
  try {

    const main_acc = process.env.MAIN_ACC
    if (main_acc && main_acc.length > 0) {
      const balance = await API.get_user_balance(account)

      const decBalances = balance.filter(_obj => _obj.token === 'DEC')
      if (decBalances && decBalances.length > 0) {
        const decBalance = decBalances[0]

        const dec = parseFloat(decBalance.balance)
        if (dec > 0) {
          let json = {
            to: process.env.MAIN_ACC,
            qty: dec,
            token: 'DEC',
            type: 'withdraw',
            memo: process.env.MAIN_ACC,
            app: 'splinterlands/0.7.139',
            n: rnd(10),
          };

          const custom_json = {
            id: 'sm_token_transfer',
            json: JSON.stringify(json),
            required_auths: [account.username.toLowerCase()],
            required_posting_auths: [],
          };

          const transaction = await client.broadcast.json(custom_json, PrivateKey.fromString(account.active_key))
          console.log(
            `${account.username} SEND ${dec} DEC TO ${process.env.MAIN_ACC}. `, transaction
          );
          return transaction;
        }
      }
    }

    return null
  } catch (error) {
    console.log(`${account.username} send dec to main account `, error.message);
    return null
  }
}

exports.transfer_card = async (account) => {
  try {
    if (parseInt(process.env.TRANSFER_MODE, 10) === 1) {
      let cards = account.proxy.cards;
      if (!cards || cards.length == 0) {
        return;
      }
      let uid = cards[0];

      const findCard = await API.find_card(uid, account, 0);

      if (findCard && findCard.player !== account.username) {
        const player = await Config.get_account_by_username(findCard.player);
        if (player == null || (player != null && player.username == account.username)) {
          return;
        }


        let json = {
          to: account.username,
          cards: cards,
        };

        const custom_json = {
          id: 'sm_gift_cards',
          json: JSON.stringify(json),
          required_auths: [player.username.toLowerCase()],
          required_posting_auths: [],
        };

        const transaction = await client.broadcast.json(custom_json, PrivateKey.fromString(player.active_key))
        console.log(
          `${account.username} TRANSFER CARD FROM ${player.username}. CARD UIDS: ${cards}`, transaction
        );
        await new Promise((resolve) => setTimeout(resolve, 10000));
        return transaction;
      } else {
        return;
      }
    } else if (parseInt(process.env.TRANSFER_MODE, 10) === 2) {
      return await this.delegate_cards(account)
    } else {
      return
    }
  } catch (error) {
    console.log(`${account.username} transfer card `, error.message);
    if (error.message.includes('Please wait to transact, or power up HIVE')) {
      console.log(`${account.username} do not have enough RC `, error.message);
      return
    } else {
      return await this.transfer_card(account);
    }


  }
}

exports.delegate_cards = async (account) => {
  try {
    let cards = account.proxy.cards;
    if (!cards || cards.length == 0) {
      return;
    }
    let uid = cards[0];

    const findCard = await API.find_card(uid, account, 0);

    if (findCard && findCard.player !== account.username) {
      const holder = await Config.find_holder(findCard.player);
      if (holder == null || (holder != null && holder.username == account.username)) {
        return;
      }

      if (findCard.delegated_to && findCard.delegated_to != null && findCard.delegated_to.length > 0) {
        await this.undelegate_cards(holder, cards)
      }

      let json = {
        to: account.username,
        cards: cards,
      };

      const custom_json = {
        id: 'sm_delegate_cards',
        json: JSON.stringify(json),
        required_auths: [],
        required_posting_auths: [holder.username.toLowerCase()],
      };

      const transaction = await client.broadcast.json(custom_json, PrivateKey.fromString(holder.posting_key))
      console.log(
        `${account.username} DELEGATE CARD FROM ${holder.username}. CARD UIDS: ${cards}`, transaction
      );
      await new Promise((resolve) => setTimeout(resolve, 10000));
      return transaction;
    } else {
      return;
    }
  } catch (error) {
    console.log(`${account.username} delegate card error: `, error.message);
    if (error.message.includes('Please wait to transact, or power up HIVE')) {
      console.log(`${account.username} do not have enough RC `, error.message);
      return
    } else {
      return await this.delegate_cards(account);
    }
  }
}

exports.undelegate_cards = async (account, cards) => {
  try {
    if (cards.length == 0) {
      return
    }

    let json = {
      cards: cards,
    };

    const custom_json = {
      id: 'sm_undelegate_cards',
      json: JSON.stringify(json),
      required_auths: [],
      required_posting_auths: [account.username.toLowerCase()],
    };

    const transaction = await client.broadcast.json(custom_json, PrivateKey.fromString(account.posting_key))
    console.log(
      `${account.username} UNDELEGATE CARD UIDS: ${cards}`, transaction
    );
    await new Promise((resolve) => setTimeout(resolve, 10000));
    return transaction;
  } catch (error) {
    console.log(`${account.username} undelegate card error: `, error.message);
    if (error.message.includes('Please wait to transact, or power up HIVE')) {
      console.log(`${account.username} do not have enough RC `, error.message);
      return
    } else {
      return await this.undelegate_cards(account, cards);
    }
  }
}

// MARK: GET USER RC
exports.get_user_ecr = async (account) => {
  const data = await client.rc.findRCAccounts([account.username])
  const rcData = data[0]
  const max_rc = rcData.max_rc
  const CURRENT_UNIX_TIMESTAMP = parseInt((new Date().getTime() / 1000).toFixed(0))
  const elapsed = CURRENT_UNIX_TIMESTAMP - rcData.rc_manabar.last_update_time;
  var current_mana = parseFloat(rcData.rc_manabar.current_mana) + elapsed * max_rc / 432000;
  if (current_mana > max_rc) {
    current_mana = max_rc
  }

  const currentManaPerc = current_mana * 100 / max_rc;

  return currentManaPerc
}