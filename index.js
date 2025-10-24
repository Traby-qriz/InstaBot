const { IgApiClient, IgCheckpointError, IgApiClientMQTT } = require('instagram-private-api');
const { IG_USERNAME, IG_PASSWORD } = require('./config.js');
const lolcat = require('lolcatjs');
const fs = require('fs');

const ig = new IgApiClient();
const igMqtt = new IgApiClientMQTT();

// Bot information
const BOT_INFO = {
  name: "CASPER X TECH IG BOT",
  owner: "TRABY CASPER",
  version: "1.0.0",
  original: "InstaBot by Tylor"
};

// Available commands
const COMMANDS = {
  help: "📖 Show all available commands",
  stats: "📊 Show bot statistics",
  viewstories: "👀 View stories from followed accounts now",
  status: "🟢 Check bot status",
  info: "ℹ️ Show bot information",
  stop: "🛑 Stop auto story viewing",
  start: "▶️ Start auto story viewing"
};

// Bot statistics
let botStats = {
  storiesViewed: 0,
  commandsProcessed: 0,
  lastActive: new Date(),
  startTime: new Date(),
  autoViewEnabled: true
};

// Load saved session
let state;
if (fs.existsSync('session.json')) {
  try {
    state = JSON.parse(fs.readFileSync('session.json', 'utf8'));
    ig.state.deserialize(state);
    igMqtt.state.deserialize(state);
    console.log(lolcat.fromString("✅ Session loaded successfully", { colors: { text: 'green' } }));
  } catch (sessionError) {
    console.log(lolcat.fromString("⚠️ Corrupted session, creating new one...", { colors: { text: 'yellow' } }));
    state = null;
    if (fs.existsSync('session.json')) {
      fs.unlinkSync('session.json');
    }
  }
} else {
  state = null;
}

// Function to view stories from followed accounts
async function viewFollowedAccountsStories() {
  if (!botStats.autoViewEnabled) {
    console.log(lolcat.fromString("⏸️ Auto story viewing is disabled", { colors: { text: 'yellow' } }));
    return { totalStoriesViewed: 0, usersWithStories: 0 };
  }

  try {
    console.log(lolcat.fromString("🔄 Checking for stories from followed accounts...", { colors: { text: 'blue' } }));
    
    // Check if we're properly logged in
    if (!ig.state.cookieUserId) {
      throw new Error("Not properly authenticated. Please restart the bot.");
    }
    
    // Get user's following list
    const followingFeed = ig.feed.accountFollowing(ig.state.cookieUserId);
    const following = await followingFeed.items();
    
    console.log(lolcat.fromString(`📱 Found ${following.length} followed accounts`, { colors: { text: 'green' } }));
    
    let totalStoriesViewed = 0;
    let usersWithStories = 0;
    
    // Check stories for each followed account (limit to first 50 to avoid rate limits)
    const limitedFollowing = following.slice(0, 50);
    
    for (const user of limitedFollowing) {
      try {
        // Get user's story reel
        const reelFeed = ig.feed.reelsMedia({
          userIds: [user.pk],
        });
        
        const stories = await reelFeed.items();
        
        if (stories.length > 0) {
          usersWithStories++;
          console.log(lolcat.fromString(`👀 Viewing ${stories.length} stories from ${user.username}`, { colors: { text: 'cyan' } }));
          
          // Mark each story as seen
          for (const story of stories) {
            try {
              await ig.story.seen([story]);
              totalStoriesViewed++;
              botStats.storiesViewed++;
              
              // Add small delay to avoid rate limiting
              await new Promise(resolve => setTimeout(resolve, 500));
              
            } catch (storyError) {
              console.log(lolcat.fromString(`⚠️ Error viewing story from ${user.username}: ${storyError.message}`, { colors: { text: 'yellow' } }));
            }
          }
        }
        
        // Add delay between users to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (userError) {
        console.log(lolcat.fromString(`⏭️ Skipping ${user.username}: ${userError.message}`, { colors: { text: 'yellow' } }));
        continue;
      }
    }
    
    console.log(lolcat.fromString(`✅ Auto-view completed! Viewed ${totalStoriesViewed} stories from ${usersWithStories} accounts`, { colors: { text: 'green' } }));
    
    return { totalStoriesViewed, usersWithStories };
    
  } catch (error) {
    console.log(lolcat.fromString(`❌ Error in auto-view stories: ${error.message}`, { colors: { text: 'red' } }));
    throw error;
  }
}

// Function to process individual commands
async function processCommand(command, userId, threadId) {
  try {
    let response = "";
    
    switch(command) {
      case '/help':
      case 'help':
      case '/start':
        response = `🤖 *${BOT_INFO.name}* - Available Commands:\n\n`;
        for (const [cmd, description] of Object.entries(COMMANDS)) {
          response += `• */${cmd}* - ${description}\n`;
        }
        response += `\n_Version: ${BOT_INFO.version}_`;
        break;
        
      case '/stats':
      case 'stats':
        const uptime = Math.floor((new Date() - botStats.startTime) / 1000 / 60);
        response = `📊 *Bot Statistics*\n\n` +
                   `• Stories Viewed: ${botStats.storiesViewed}\n` +
                   `• Commands Processed: ${botStats.commandsProcessed}\n` +
                   `• Uptime: ${uptime} minutes\n` +
                   `• Auto View: ${botStats.autoViewEnabled ? '🟢 ON' : '🔴 OFF'}\n` +
                   `• Last Active: ${botStats.lastActive.toLocaleTimeString()}`;
        break;
        
      case '/viewstories':
      case 'viewstories':
        response = "🔄 Starting manual story viewing...";
        await sendDMResponse(threadId, response);
        
        // Execute story viewing
        const result = await viewFollowedAccountsStories();
        response = `✅ *Story Viewing Complete*\n\n` +
                   `• Stories Viewed: ${result.totalStoriesViewed}\n` +
                   `• Accounts with Stories: ${result.usersWithStories}\n` +
                   `• Total Stories Viewed (All Time): ${botStats.storiesViewed}`;
        break;
        
      case '/status':
      case 'status':
        response = `🟢 *Bot Status: ONLINE*\n\n` +
                   `• ${BOT_INFO.name}\n` +
                   `• Version: ${BOT_INFO.version}\n` +
                   `• Owner: ${BOT_INFO.owner}\n` +
                   `• Auto View: ${botStats.autoViewEnabled ? '🟢 ON' : '🔴 OFF'}\n` +
                   `• Last Active: ${botStats.lastActive.toLocaleTimeString()}`;
        break;
        
      case '/info':
      case 'info':
        response = `ℹ️ *Bot Information*\n\n` +
                   `• Name: ${BOT_INFO.name}\n` +
                   `• Version: ${BOT_INFO.version}\n` +
                   `• Owner: ${BOT_INFO.owner}\n` +
                   `• Based on: ${BOT_INFO.original}\n` +
                   `• Started: ${botStats.startTime.toLocaleString()}`;
        break;

      case '/stop':
      case 'stop':
        botStats.autoViewEnabled = false;
        response = `🛑 *Auto Story Viewing DISABLED*\n\nAuto story viewing has been stopped. Use /start to enable it again.`;
        break;

      case '/start':
      case 'start':
        botStats.autoViewEnabled = true;
        response = `▶️ *Auto Story Viewing ENABLED*\n\nAuto story viewing has been started. Use /stop to disable it.`;
        break;
        
      default:
        response = `❓ Unknown command: "${command}"\n\n` +
                   `Type */help* to see all available commands.`;
        break;
    }
    
    await sendDMResponse(threadId, response);
    botStats.commandsProcessed++;
    botStats.lastActive = new Date();
    
  } catch (error) {
    console.log(lolcat.fromString(`❌ Error processing command: ${error.message}`, { colors: { text: 'red' } }));
    await sendDMResponse(threadId, "❌ Error processing your command. Please try again later.");
  }
}

// Function to send DM response
async function sendDMResponse(threadId, message) {
  try {
    await ig.directThread.broadcastText({
      threadIds: [threadId],
      text: message,
    });
    console.log(lolcat.fromString(`📤 Sent DM response to thread: ${threadId}`, { colors: { text: 'green' } }));
  } catch (error) {
    console.log(lolcat.fromString(`❌ Error sending DM: ${error.message}`, { colors: { text: 'red' } }));
  }
}

// Initialize MQTT and set up real-time listeners
async function initializeRealTimeListeners() {
  try {
    console.log(lolcat.fromString("🔌 Initializing real-time DM listeners...", { colors: { text: 'blue' } }));
    
    // Connect to MQTT for real-time updates
    await igMqtt.connect();
    await igMqtt.direct.sendPresence({ state: 'active' });
    
    // Listen for new direct messages
    igMqtt.direct.on('message', async (message) => {
      try {
        console.log(lolcat.fromString(`💬 Received real-time message from user: ${message.user_id}`, { colors: { text: 'cyan' } }));
        
        // Only process text messages
        if (message.item_type === 'text' && message.text) {
          const command = message.text.toLowerCase().trim();
          const userId = message.user_id;
          const threadId = message.thread_id;
          
          console.log(lolcat.fromString(`📝 Processing command: "${command}"`, { colors: { text: 'cyan' } }));
          
          // Process the command
          await processCommand(command, userId, threadId);
        }
      } catch (error) {
        console.log(lolcat.fromString(`❌ Error in message listener: ${error.message}`, { colors: { text: 'red' } }));
      }
    });
    
    // Listen for thread updates
    igMqtt.direct.on('threadUpdate', async (thread) => {
      try {
        if (thread.unread_count > 0) {
          console.log(lolcat.fromString(`📨 Unread messages in thread: ${thread.thread_id}`, { colors: { text: 'blue' } }));
        }
      } catch (error) {
        console.log(lolcat.fromString(`❌ Error in thread update: ${error.message}`, { colors: { text: 'red' } }));
      }
    });
    
    // Handle connection events
    igMqtt.on('error', (error) => {
      console.log(lolcat.fromString(`❌ MQTT Error: ${error.message}`, { colors: { text: 'red' } }));
    });
    
    igMqtt.on('close', () => {
      console.log(lolcat.fromString("🔌 MQTT Connection closed", { colors: { text: 'yellow' } }));
    });
    
    igMqtt.on('reconnect', () => {
      console.log(lolcat.fromString("🔌 MQTT Reconnecting...", { colors: { text: 'blue' } }));
    });
    
    console.log(lolcat.fromString("✅ Real-time DM listeners activated!", { colors: { text: 'green' } }));
    
  } catch (error) {
    console.log(lolcat.fromString(`❌ Error initializing real-time listeners: ${error.message}`, { colors: { text: 'red' } }));
  }
}

// Function to display bot information
function displayBotInfo() {
  console.log(lolcat.fromString("┌──────────────────────────────────┐", { colors: true }));
  console.log(lolcat.fromString(`│         ${BOT_INFO.name}         │`, { colors: true }));
  console.log(lolcat.fromString("├──────────────────────────────────┤", { colors: true }));
  console.log(lolcat.fromString(`│ Owner: ${BOT_INFO.owner.padEnd(23)} │`, { colors: true }));
  console.log(lolcat.fromString(`│ Version: ${BOT_INFO.version.padEnd(20)} │`, { colors: true }));
  console.log(lolcat.fromString(`│ Based on: ${BOT_INFO.original.padEnd(18)} │`, { colors: true }));
  console.log(lolcat.fromString("└──────────────────────────────────┘", { colors: true }));
}

// Function to handle login
async function login() {
  try {
    // Generate device if no state
    if (!state) {
      ig.state.generateDevice(IG_USERNAME);
      igMqtt.state.generateDevice(IG_USERNAME);
    }
    
    await ig.simulate.preLoginFlow();
    await igMqtt.simulate.preLoginFlow();
    
    // Try to login
    const loggedInUser = await ig.account.login(IG_USERNAME, IG_PASSWORD);
    await igMqtt.account.login(IG_USERNAME, IG_PASSWORD);
    
    console.log(lolcat.fromString(`✅ Logged in as: ${loggedInUser.username}`, { colors: { text: 'green' } }));
    
    // Save session
    const serializedState = await ig.state.serialize();
    const serializedStateMqtt = await igMqtt.state.serialize();
    fs.writeFileSync('session.json', JSON.stringify(serializedState));
    
    return true;
  } catch (error) {
    if (error instanceof IgCheckpointError) {
      console.log(lolcat.fromString("⚠️ Checkpoint detected! Manual verification required.", { colors: { text: 'yellow' } }));
      console.log(lolcat.fromString("ℹ️ Please check your Instagram app/email for verification", { colors: { text: 'blue' } }));
    } else {
      console.error(lolcat.fromString(`❌ Login error: ${error.message}`, { colors: { text: 'red' } }));
    }
    return false;
  }
}

(async () => {
  try {
    // Display bot information
    displayBotInfo();
    
    // Login
    const loginSuccess = await login();
    
    if (!loginSuccess) {
      console.log(lolcat.fromString("🚫 Failed to login. Please check your credentials or complete checkpoint verification.", { colors: { text: 'red' } }));
      process.exit(1);
    }
    
    console.log(lolcat.fromString("🚀 CASPER X TECH IG BOT Online", { colors: true }));
    
    // Initialize real-time DM listeners
    await initializeRealTimeListeners();
    
    // Wait a bit before starting auto-view
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Run auto view stories immediately
    await viewFollowedAccountsStories();
    
    // Schedule auto view stories every 30 minutes
    const AUTO_VIEW_INTERVAL = 30 * 60 * 1000;
    setInterval(async () => {
      await viewFollowedAccountsStories();
    }, AUTO_VIEW_INTERVAL);
    
    console.log(lolcat.fromString(`⏰ Auto-view stories scheduled every ${AUTO_VIEW_INTERVAL / 60000} minutes`, { colors: { text: 'blue' } }));
    
    // Keep the bot running
    console.log(lolcat.fromString("🤖 Bot is now listening for DM commands in real-time!", { colors: { text: 'green' } }));
    
    process.on('SIGINT', async () => {
      console.log(lolcat.fromString("🛑 Shutting down bot...", { colors: { text: 'yellow' } }));
      await igMqtt.destroy();
      process.exit(0);
    });
    
  } catch (error) {
    console.error(lolcat.fromString(`❌ Critical Error: ${error.message}`, { colors: { text: 'red' } }));
    process.exit(1);
  }
})();