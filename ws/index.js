const WebSocket = require('ws');

exports.get_enemy_team = async (account, enemy) => {
  if (enemy == null) {
    return null
  }
  return new Promise(function (resolve, reject) {

    const ws = new WebSocket('wss://ws2.splinterlands.com/');

    ws.on('open', function open() {
      ws.send(JSON.stringify({
        "type": "auth",
        "player": enemy
      }))
    });

    ws.on('message', async function message(messageData) {

      const json = JSON.parse(messageData)
      if (json.id == 'transaction_complete' && json.data) {
        const data = json.data
        const trx_info = data.trx_info
        if (trx_info && trx_info.type && trx_info.type == 'submit_team') {
          const enemy_team = trx_info.data
          const enemy_team_json = JSON.parse(trx_info.data)


          if (enemy_team_json && enemy_team_json.summoner && enemy_team_json.monsters) {
            ws.close()
            // console.log(`${account.username} COUNTER ENEMY TEAM: `, enemy_team_json);
            resolve(enemy_team)
          } else {
            setTimeout(() => {
              ws.close()
              resolve(null)
            }, 10000)

          }
        } else if (trx_info && trx_info.type && trx_info.type == 'team_reveal') {
          const enemy_team = trx_info.data
          const enemy_team_json = JSON.parse(trx_info.data)

          ws.close()
          if (enemy_team_json && enemy_team_json.summoner && enemy_team_json.monsters) {
            // console.log(`${account.username} COUNTER ENEMY TEAM: `, enemy_team_json);
            resolve(enemy_team)
          }
          resolve(null)
        }
      }
    });

    setTimeout(() => {
      ws.close()
      resolve(null)
    }, 150000)

  });


}