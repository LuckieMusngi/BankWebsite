const express = require("express");
const mongoose = require("mongoose");

const app = express();

app.use(express.json());

const transactionRoutes = require("./routes/transactionRoutes");

app.use("/transactions", transactionRoutes);

mongoose.connect("mongodb://localhost:27017/yourDatabaseName", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => 
    console.log("MongoDB connected")
)
.catch(err => 
    console.log(err)
);

const PORT = 8080;

// read data
const data = JSON.parse(fs.readFileSync('Users.Banking.json', 'utf8'));
const users = data.find(d => d.users).users;
const accounts = data.find(d => d.Accounts).Accounts;

function renderLoginPage(errorMessage) {
  return fs.readFileSync('logIn2.html', 'utf8').replace('__LOGIN_ERROR__', errorMessage || '');
}

http.createServer((req, res) => {
  // parse url (w/ query)
  const parsed = url.parse(req.url, true);
  
  //* login page (default)
  if (req.method === 'GET' && (parsed.pathname === '/' || parsed.pathname === '/login2')) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(renderLoginPage(''));
    return;
  }

  //! accounts page (shouldn't work bc no log in, but here anyway)
  if (req.method === 'GET' && parsed.pathname === '/accounts') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(fs.readFileSync('accounts.html'));
    return;
  }

  //* checks login post, goes to accounts page if good
  if (req.method === 'POST' && parsed.pathname === '/login2') {
    
    // get data
    let body = '';
    req.on('data', chunk => body += chunk);
    
    // parse it and check
    req.on('end', () => {
      const bodyData = qs.parse(body);
      
      // username, password
      const username = bodyData.username;
      const password = bodyData.password;
      
      // get the user with those credentials (if any)
      const user = users.find(u => u.Username === username && u.Password === password);

      // bad login !
      if (!user) {
        res.writeHead(401, { 'Content-Type': 'text/html' });
        res.end(renderLoginPage('Invalid username or password.'));
        return;
      }

      // good login, get their accounts !
      const userAccounts = [];
      for (const a of accounts) {
        if (user.Accounts.includes(a['Account #'])) userAccounts.push(a);
      }

      // writehead and send
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(updateAccountsHTML(user, userAccounts));
    });
    return;
  }

  // therefore random url
  res.writeHead(404);
  res.end('Not found');

}).listen(PORT, () => console.log('server running at http://127.0.0.1:' + PORT));


//* update accounts.html, replacing placeholders with user info and account info
function updateAccountsHTML(user, userAccounts) {

  // list of accounts (account number, type, balance)
  let accountItems = '';
  for (const curAcc of userAccounts) {
    accountItems += `<li class="account-card">
      <div>Account Number: ${curAcc['Account #']}</div>
      <div>Account Type: ${curAcc['Account Type']}</div>
      <div>Balance: $${Number(curAcc.Balance).toFixed(2)}</div>
    </li>`;
  }

  return fs.readFileSync('accounts.html', 'utf8')
    .replace('__USERNAME__', user.Name)
    .replace('__STATUS__', userAccounts.length + ' account(s).')
    .replace('__ACCOUNT_LIST__', accountItems);
}
