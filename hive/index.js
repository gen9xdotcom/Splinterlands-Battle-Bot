const {
  Client,
  Signature,
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
const Config = require('../configs')

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

exports.transfer_card = async (account) => {
  try {
    if (parseInt(process.env.TRANSFER_ENABLE, 10) === 1) {
      let cards = account.proxy.cards;
      if (cards.length == 0) {
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
    } else {
      return
    }
  } catch (error) {
    console.log(`${account.username} transfer card `, error.message);
    if (error.message.includes('Please wait to transact, or power up HIVE')) {
      console.log(`${account.username} do not have enough RC `, error.message);
      await new Promise((resolve) => setTimeout(resolve, 300000));
    }

    return await this.transfer_card(account);
  }
}