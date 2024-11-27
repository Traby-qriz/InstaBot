//InstaBot by Tylor

const { IgApiClient, IgCheckpointError } = require('instagram-private-api');
const { IG_USERNAME, IG_PASSWORD } = require('./config.js');
const lolcat = require('lolcatjs');
const fs = require('fs');

const ig = new IgApiClient({
  userAgent: "Instagram 10.3.2 (iPhone9,1; iOS 13_3; en_US; en-US; scale=2.00; 1080x2536)",
});

// Load saved session
let state;
if (fs.existsSync('session.json')) {
  state = JSON.parse(fs.readFileSync('session.json', 'utf8'));
  ig.state.deserialize(state);
} else {
  state = null;
}

(async () => {
  try {
    if (!state) {
      ig.state.generateDevice(IG_USERNAME + "333");
    }
    await ig.simulate.preLoginFlow();
    try {
      await ig.account.login(IG_USERNAME, IG_PASSWORD);
      console.log(lolcat.fromString("Logged in successfully!", { colors: true }));
    } catch (error) {
      if (error instanceof IgCheckpointError) {
        console.log(lolcat.fromString("Checkpoint detected!", { colors: { text: 'yellow' } }));
// Add automated checkpoint resolution logic
      } else {
        console.error(lolcat.fromString("Login error: " + error.message, { colors: { text: 'red' } }));
      }
    }
 // Save session
    ig.state.serialize().then((serializedState) => {
      fs.writeFileSync('session.json', JSON.stringify(serializedState));
    });
    console.log(lolcat.fromString("InstaBot Online", { colors: true }));
    setInterval(() => {}, 60000);
  } catch (error) {
    console.error(lolcat.fromString("Error: " + error.message, { colors: { text: 'red' } }));
  }
})();
