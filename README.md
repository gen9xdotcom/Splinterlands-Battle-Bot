
![Logo](https://d36mxiodymuqjm.cloudfront.net/website/home/splinterlands_logo_fx_1000.png)

# Splinterlands Battle Bot

This is a super fast, lightweight, HIGH RATING (with basic card only) and multi-account bot for Splinterlands.

## Available OS

You can run this Bot on MacOS, Window, Linux

## Features

- Auto battle for multiple concurrent account
- Auto transfer cards for each account to get higher league
- Get high rating (up to 1500) easily with only basic card. You don't have to rent any other cards
- Auto start and play quest
- Auto claim quest
- Auto start/stop account base on Enegy Capture Rate
- Auto delegate more HP to increase Resource Credits if needed
- SPECIAL: THIS BOT CAN SEE ENEMY SUBMITTED TEAM IN CURRENT BATTLE 😎
- And much more tini features...

## Demo

Video demo running bot:

https://3speak.tv/watch?v=spl-bot-provider/ujbbqhbk&jwsource=cl

Account Ratings (with starter cards only):

![App Screenshot](https://raw.githubusercontent.com/gen9xdotcom/Splinterlands-Battle-Bot/main/demo.png)
## Installation

### 1. Prerequisites
Make sure you have installed all of the following prerequisites on your machine:
* [Required] Node.js - [Download & Install Node.js](https://nodejs.org/en/download/) and the npm package manager. If you encounter any problems, you can also use this [GitHub Gist](https://gist.github.com/isaacs/579814) to install Node.js.
* [Optional] Git - [Download & Install Git](https://git-scm.com/downloads). OSX and Linux machines typically have this already installed.
* [Optional] PM2 - PM2 is a daemon process manager that will help you manage and keep this bot online 24/7
After install Node.js, you can install pm2:
```bash
  npm install pm2 -g
```
### 2. Downloading Splinterlands Battle Bot
There are several ways you can get the bot:

#### 2.1 Cloning The GitHub Repository
The recommended way to get Splinterlands Battle Bot is to use git to directly clone the Splinterlands Battle Bot repository:

```bash
$ git clone https://github.com/gen9xdotcom/Splinterlands-Battle-Bot battle-bot
```

This will clone the latest version of the Splinterlands Battle Bot repository to a **battle-bot** folder.

#### 2.2 Downloading The Repository Zip File
Another way to use the Splinterlands Battle Bot is to download a zip copy from the [master branch on GitHub](https://github.com/gen9xdotcom/Splinterlands-Battle-Bot/archive/refs/heads/main.zip)

### 3. Quick Install
Once you've downloaded the Splinterlands Battle Bot and installed all the prerequisites, you're just a few steps away from starting to run this bot.

To install the Splinterlands Battle Bot, run this in the project folder from the command-line:

```bash
$ npm install
```

### 4. Setup accounts, env, proxies
#### 4.1. Setup accounts
Create a new file accounts.json and save it in configs/ directory. The content of file is:
```bash
{
  "accounts": [{
      "username": "username1",
      "posting_key": "postingkey1",
      "active_key": "activekey1"
    }, {
      "username": "username2",
      "posting_key": "postingkey2",
      "active_key": "activekey2"
    }
  ]
}
```
Each account require 3 informations:
* usesrname: it must be lowercase
* posting_key: to sign transaction for battle
* active_key: to transfer cards. If you dont't transfer cards between accounts, no need to fill active_key

#### 4.2. Setup proxies
Create a new file proxies.json and save it in configs/ directory. The content of file is:
```bash
{
  "proxies": [{
      "host": "x.x.x.x",
      "port": "xxxx",
      "auth": {
        "username": "usernamehere",
        "password": "passwordhere"
      },
      "cards": ["uid-card1-here", "uid-card2-here"]
    }
  ]
}
```

You can buy proxies from any proxies provider. I recommend you buy proxies at [Webshare](https://www.webshare.io/?referral_code=fj95ubx69kcq). It is more cheaper and very good!

#### 4.3. Setup env file
Create a new file .env and save it in root directory. The content of file is:
```bash
#Private API: return best team for a match
PRIVATE_API=https://spsbot.fun

#Game API
GAME_API=https://api2.splinterlands.com

#ENABLE TRANSFER CARD FOR COLLECTION POWER
TRANSFER_ENABLE=1

#STOP ECR: Account will stop battle if ECR is LESS THAN MIN_ECR
STOP_ECR=60

#START ECR: Account will start battle if ECR is GREATER THAN MIN_ECR
START_ECR=65

```

Each account require 3 informations:
* PRIVATE_API: This API will calculate best team. It is my private API
* GAME_API: Game api to get user battle, quest, ecr, cards...
* TRANSFER_ENABLE: 1 - Enable transfer cards | 0 - Disable transfer cards
* STOP_ECR: Account will stop battle if ECR is LESS THAN MIN_ECR
* START_ECR: Account will start battle if ECR is GREATER THAN MIN_ECR

## Run BOT and earn DEC

To run the Splinterlands Battle Bot, run this in the project folder from the command-line:

```bash
pm2 start ecosystem.config.js
```

If you want to see the logs, you can run the following command:

```bash
pm2 logs bot
```

To stop Splinterlands Battle Bot, you can run:

```bash
pm2 kill bot
```

or
```bash
pm2 stop bot
```
## Authors

- [@gen9xdotcom](https://github.com/gen9xdotcom)


## Donate/Buy me a coffee
You can buy me a coffee if you think this bot is very useful. Or you can order me to upgrade this bot to add more cool features.

* BUSD/USDT (BEP 20): 0x8aa910dbaacafac0a266e9dbd0ba13c35105263b

* ETH (ERC20): 0x8aa910dbaacafac0a266e9dbd0ba13c35105263b

* HIVE: deepcrypto8, memo: 100846870

* DEC (in game): send to my player username: @gen9x


## Support

For support, contact me via Telegram: [@gen9x](https://t.me/gen9x)




## License

>You can check out the full license [here](https://github.com/gen9xdotcom/Splinterlands-Battle-Bot/blob/main/LICENSE)

This project is licensed under the terms of the **MIT** license.


