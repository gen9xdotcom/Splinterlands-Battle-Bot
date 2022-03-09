const fs = require('fs');

exports.get_accounts = async () => {
  filePath = `configs/accounts.json`;
  const file = await fs.readFileSync(filePath);
  const {
    accounts
  } = JSON.parse(file);
  return accounts;
};

exports.get_account_by_username = async (username) => {
  filePath = `configs/accounts.json`;
  const file = await fs.readFileSync(filePath);
  const {
    accounts
  } = JSON.parse(file);

  const account = accounts.filter((_obj) => _obj.username == username);
  if (account && account.length > 0) {
    return account[0];
  }

  return null;
};

exports.get_proxies = async () => {
  filePath = `configs/proxies.json`;
  const file = await fs.readFileSync(filePath);
  const {
    proxies
  } = JSON.parse(file);
  return proxies;
};