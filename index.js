const { IgApiClient, IgCheckpointError } = require('instagram-private-api');
const { IG_USERNAME, IG_PASSWORD } = require('./config.js');
const lolcat = require('lolcatjs');
const fs = require('fs');

const ig = new IgApiClient({
  userAgent: "Instagram 10.3.2 (iPhone9,1; iOS 13_3; en_US; en-US; scale=2.00; 1080x2536)",
});

// Bot information
const BOT_INFO = {
  name: "CASPER X TECH IG BOT",
  owner: "TRABY CASPER",
  version: "1.0.0",
  original: "InstaBot by Tylor"
};

// Load saved session
let state;
if (fs.existsSync('session.json')) {
  state = JSON.parse(fs.readFileSync('session.json', 'utf8'));
  ig.state.deserialize(state);
} else {
  state = null;
}

// Function to view stories from followed accounts
async function viewFollowedAccountsStories() {
  try {
    console.log(lolcat.fromString("🔄 Checking for stories from followed accounts...", { colors: { text: 'blue' } }));
    
    // Get user's following list
    const followingFeed = ig.feed.accountFollowing(ig.state.cookieUserId);
    const following = await followingFeed.items();
    
    console.log(lolcat.fromString(`📱 Found ${following.length} followed accounts`, { colors: { text: 'green' } }));
    
    let totalStoriesViewed = 0;
    
    // Check stories for each followed account
    for (const user of following) {
      try {
        // Get user's story reel
        const reelFeed = ig.feed.reelsMedia({
          userIds: [user.pk],
        });
        
        const stories = await reelFeed.items();
        
        if (stories.length > 0) {
          console.log(lolcat.fromString(`👀 Viewing ${stories.length} stories from ${user.username}`, { colors: { text: 'cyan' } }));
          
          // Mark each story as seen
          for (const story of stories) {
            try {
              await ig.story.seen([story]);
              totalStoriesViewed++;
              
              // Add small delay to avoid rate limiting
              await new Promise(resolve => setTimeout(resolve, 1000));
              
            } catch (storyError) {
              console.log(lolcat.fromString(`❌ Error viewing story from ${user.username}: ${storyError.message}`, { colors: { text: 'red' } }));
            }
          }
        }
        
        // Add delay between users to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (userError) {
        console.log(lolcat.fromString(`⚠️ Skipping ${user.username}: ${userError.message}`, { colors: { text: 'yellow' } }));
      }
    }
    
    console.log(lolcat.fromString(`✅ Auto-view completed! Viewed ${totalStoriesViewed} stories from followed accounts`, { colors: { text: 'green' } }));
    
  } catch (error) {
    console.log(lolcat.fromString(`❌ Error in auto-view stories: ${error.message}`, { colors: { text: 'red' } }));
  }
}

// Function to display bot information
function displayBotInfo() {
  console.log(lolcat.fromString("┌──────────────────────────────────┐", { colors: true }));
  console.log(lolcat.fromString(`│         ${BOT_INFO.name}         │`, { colors: true }));
  console.log(lolcat.fromString("├──────────────────────────────────┤", { colors: true }));
  console.log(lolcat.fromString(`│ Owner: ${BOT_INFO.owner}`, { colors: true }));
  console.log(lolcat.fromString(`│ Version: ${BOT_INFO.version}`, { colors: true }));
  console.log(lolcat.fromString(`│ Based on: ${BOT_INFO.original}`, { colors: true }));
  console.log(lolcat.fromString("└──────────────────────────────────┘", { colors: true }));
}

(async () => {
  try {
    // Display bot information
    displayBotInfo();
    
    if (!state) {
      ig.state.generateDevice(IG_USERNAME + "333");
    }
    
    await ig.simulate.preLoginFlow();
    
    try {
      await ig.account.login(IG_USERNAME, IG_PASSWORD);
      console.log(lolcat.fromString("✅ Logged in successfully!", { colors: { text: 'green' } }));
    } catch (error) {
      if (error instanceof IgCheckpointError) {
        console.log(lolcat.fromString("⚠️ Checkpoint detected!", { colors: { text: 'yellow' } }));
        // Add automated checkpoint resolution logic
      } else {
        console.error(lolcat.fromString("❌ Login error: " + error.message, { colors: { text: 'red' } }));
      }
    }
    
    // Save session
    ig.state.serialize().then((serializedState) => {
      fs.writeFileSync('session.json', JSON.stringify(serializedState));
    });
    
    console.log(lolcat.fromString("🚀 CASPER X TECH IG BOT Online", { colors: true }));
    
    // Run auto view stories immediately
    await viewFollowedAccountsStories();
    
    // Schedule auto view stories every 30 minutes (adjust as needed)
    const AUTO_VIEW_INTERVAL = 30 * 60 * 1000; // 30 minutes
    
    setInterval(async () => {
      await viewFollowedAccountsStories();
    }, AUTO_VIEW_INTERVAL);
    
    console.log(lolcat.fromString(`⏰ Auto-view stories scheduled every ${AUTO_VIEW_INTERVAL / 60000} minutes`, { colors: { text: 'blue' } }));
    
    // Keep the bot running
    setInterval(() => {}, 60000);
    
  } catch (error) {
    console.error(lolcat.fromString("❌ Error: " + error.message, { colors: { text: 'red' } }));
  }
})();