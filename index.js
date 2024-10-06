const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  PermissionsBitField,
  Permissions,
  Embed,
  AllowedMentionsTypes,
  DefaultWebSocketManagerOptions,
} = require(`discord.js`);
DefaultWebSocketManagerOptions.identifyProperties.browser = "Discord iOS";
const fs = require("fs");
let storage = require("./storage.json");
require("dotenv").config();
const TOKEN = process.env.DISCORD_TOKEN;
const { ActivityType } = require("discord.js");

const prefix = "$";
const timer = {};
const crimeTimer = {};
const weeklyTimer = {};
const fiveMinTimer = {};
const begTimer = {};
const streamTimer = {};
const date = new Date();
const daysOfTheWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const currentDay = daysOfTheWeek[date.getDay()];
let costOfSolana = randomNumFromInterval(150, 300).toString();
let lastMessage; // Variabel untuk menyimpan pesan terakhir yang dikirim

// <:LyraCoin:1291733174761689168> 

// <:check:1088834644381794365>

/*
.setAuthor({
  name: `${message.author.username}`,
  iconURL: `${message.author.displayAvatarURL()}`,
  url: `https://discord.com/users/${message.author.id}`,
})
*/

const cooldownTimes = {
  command1: 86400000,
  command2: 600000,
  command3: 604800000,
  command4: 300000,
};

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
  ],
});

client.on("guildCreate", async (guild) => {
  // Fetch the server owner's information
  const serverOwner = await guild.fetchOwner();

  // Sending the invite information to the bot owner
  try {
    const botOwner = await client.users.fetch("1263111273361571850");
    const embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle("New Server Invite")
      .addFields(
        { name: `Server name`, value: `${guild.name}` },
        {
          name: `Server Owner`,
          value: `${serverOwner.user.tag} (${serverOwner.user.id})`,
        }
      )
      .setTimestamp();
    await botOwner.send({ embeds: [embed] });
    console.log("Sent server invite information to bot owner.");
  } catch (error) {
    console.error("Failed to send server invite information:", error);
  }
});

function save() {
  fs.writeFileSync("./storage.json", JSON.stringify(storage));
}

function randomNumFromInterval(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function updateSolana() {
  costOfSolana = randomNumFromInterval(150, 300).toString();
  sendOrUpdateSolanaMessage(); // Panggil fungsi untuk mengirim atau mengedit pesan
}

function sendOrUpdateSolanaMessage() {
  const channelId = '1291592718044237834'; // Ganti dengan ID channel Discord yang ingin Anda gunakan
  const channel = client.channels.cache.get(channelId);

  if (channel) {
    // Jika pesan sebelumnya ada, edit pesan tersebut
    if (lastMessage) {
      lastMessage.edit(`Current price of Solana: ${costOfSolana}`)
        .catch(console.error);
    } else {
      // Jika tidak ada pesan sebelumnya, kirim pesan baru dan simpan referensinya
      channel.send(`Current price of Solana: ${costOfSolana}`)
        .then(message => {
          lastMessage = message; // Simpan pesan terakhir untuk diedit di masa depan
        })
        .catch(console.error);
    }
  } else {
    console.error('No channel found!');
  }
}

setInterval(updateSolana, 5 * 60 * 1000); // updates cost of solana every 5 minutes

client.on("ready", async () => {
  console.log("The bot is online!");

  console.log(`This bot is in ${client.guilds.cache.size} servers.`);

  save();

  client.user.setPresence({
    // status: "idle",
    activities: [
      {
        type: ActivityType.Custom,
        name: "custom",
        state: "Beta Lyra Economy",
      },
    ],
  });
});

// Define a constant for the minimum and maximum amounts of money that can be won or lost
const MIN_CRIME_AMOUNT = -100;
const MAX_CRIME_AMOUNT = 100;

client.on("messageCreate", async (message) => {
  if (`${message.content.toLowerCase()}`.includes("rust")) {
    message.react("🚀").catch((error) => {
      console.log(error);
    });
  }

  if (`${message.content.toLowerCase()}`.includes("zig")) {
    message.react("⚡").catch((error) => {
      console.log(error);
    });
  }

  // If your message doesn't start with the prefix, the bot will ignore your message
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).split(/ +/);
  const command = args.shift().toLowerCase();

  const messageArray = message.content.split(" ");
  const argument = messageArray.slice(1);
  const cmd = messageArray[0];

  if (!storage[message.author.id]) {
    storage[message.author.id] = {
      joined: false,
    };
  }

  if (command === "ping") {
    const timeTaken = Date.now() - message.createdTimestamp;
    message.channel.send(
      `Pong! This message took ${timeTaken} milliseconds to respond.`
    );
  }

  if (command === "join") {
    const playerId = message.author.id;

    // Check if the user has already joined
    if (storage[playerId] && storage[playerId].joined) {
      return message.channel.send("You have already made an account.");
    }

    // Get the ID of the server where the user is joining from
    const serverId = message.guild.id;

    // If the player does not exist in storage, create a new object
    if (!storage[playerId]) {
      storage[playerId] = {};
    }

    // Set up default values for the player's account
    storage[playerId].money = storage[playerId].money || 500; // Add initial 500 money
    storage[playerId].bank = 0;
    storage[playerId].solana = 0;
    storage[playerId].joined = true; // Mark that the player has joined
    storage[playerId].admin = false; // By default, user is not an admin
    storage[playerId].inventory = {}; // Initialize an empty inventory
    storage[playerId].serverId = serverId; // Store the server ID

    // Save changes to storage
    save();

    // Create the embed message
    const embed = new EmbedBuilder()
      .setColor("Green")
      .setAuthor({
        name: `${message.author.username}`,
        iconURL: `${message.author.displayAvatarURL()}`,
        url: `https://discord.com/users/${playerId}`,
      })
      .setTitle("Created Account")
      .setDescription(
        "You have successfully made an account and got <:LyraCoin:1291733174761689168> 500 added to your cash account."
      )
      .setTimestamp();

    // Send the embed message
    return message.channel.send({ embeds: [embed] });
  }


  if (command === "daily" || command === "collect") {
    if (!storage[message.author.id].joined) {
      message.channel.send(
        `Whoops! You need to join first! Use the \`${prefix}join\` command to join in and get started!`
      );
      return;
    }

    // Check if the server has a timer entry
    if (!timer[message.guild.id]) {
      // If the server does not have a timer entry, create one
      timer[message.guild.id] = {};
    }
    // Check if the user has a timer entry for the server
    if (!timer[message.guild.id][message.author.id]) {
      // If the user does not have a timer entry, create one
      timer[message.guild.id][message.author.id] = Date.now();

      const embed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("Daily collect")
        .setAuthor({
          name: `${message.author.username}`,
          iconURL: `${message.author.displayAvatarURL()}`,
          url: `https://discord.com/users/${message.author.id}`,
        })
        .setDescription(
          "You have collected you daily income of <:LyraCoin:1291733174761689168>  500. Come back tomorrow for your next income :)"
        )
        .setTimestamp();

      storage[message.author.id].money += 500;
      message.channel.send({ embeds: [embed] });
      save();

      // Set the timer to expire in 24 hours
      setTimeout(() => {
        if (timer[message.guild.id]) {
          delete timer[message.guild.id][message.author.id];
        }
      }, cooldownTimes.command1);
    } else {
      // If the user has a timer entry, check how much time has passed since the last usage
      let timeSinceLastUsage =
        Date.now() - timer[message.guild.id][message.author.id];
      // If less than 24 hours have passed, send a message saying the command is on cooldown
      if (timeSinceLastUsage < cooldownTimes.command1) {
        let timeRemaining = cooldownTimes.command1 - timeSinceLastUsage;
        let minutesRemaining = Math.floor(timeRemaining / 60000);
        let hoursRemaining = Math.floor(minutesRemaining / 60);
        if (hoursRemaining > 0) {
          const embed = new EmbedBuilder()
            .setColor("Green")
            .setDescription(
              `This command is on cooldown. Please wait ${hoursRemaining} hour${hoursRemaining > 1 ? "s" : ""
              } before trying again.`
            )
            .setTimestamp();
          message.channel.send({ embeds: [embed] });
        } else {
          const embed2 = new EmbedBuilder()
            .setColor("Green")
            .setDescription(
              `This command is on cooldown. Please wait ${hoursRemaining} hour${hoursRemaining > 1 ? "s" : ""
              } before trying again.`
            )
            .setTimestamp();
          message.channel.send({ embeds: [embed2] });
        }
      } else {
        // If 24 hours or more have passed, delete the timer entry and run the command logic
        if (timer[message.guild.id]) {
          delete timer[message.guild.id][message.author.id];
        }
        // ...
      }
    }
  }

  if (command === "crime") {
    if (!storage[message.author.id].joined) {
      message.channel.send(
        `Whoops! You need to join first! Use the \`${prefix}join\` command to join in and get started!`
      );
      return;
    }

    if (!crimeTimer[message.author.id]) {
      // If the user does not have a crimeTimer entry, create one
      crimeTimer[message.author.id] = Date.now();

      // Run command logic...
      // Calculate a random amount of money to win or lose
      const crimeAmount =
        Math.floor(Math.random() * (MAX_CRIME_AMOUNT - MIN_CRIME_AMOUNT + 1)) +
        MIN_CRIME_AMOUNT;

      // Update the user's balance based on the crime result
      storage[message.author.id].money += crimeAmount;
      save();

      // Construct a message to send to the user based on the result of the crime
      positive = [
        "You have successfully robbed a bank and gained",
        "You successfully asassinated the leader of a gang and won",
        "You became a crimelord and won",
      ];
      negative = [
        "You were caught robbing a bank and lost",
        "You were injured during a gang fight and lost",
        "You tried to steal from a gas station and lost",
        "You forgot to tie your shoes and you slipped and fell and lost",
      ];
      if (crimeAmount < 0) {
        const badMessage = randomNumFromInterval(0, negative.length - 1);
        const embed = new EmbedBuilder()
          .setColor("Red")
          .setTitle("Crime")
          .setAuthor({
            name: `${message.author.username}`,
            iconURL: `${message.author.displayAvatarURL()}`,
            url: `https://discord.com/users/${message.author.id}`,
          })
          .setDescription(
            `${negative[badMessage]
            } <:LyraCoin:1291733174761689168>  ${-crimeAmount}`
          )
          .setTimestamp();
        message.channel.send({ embeds: [embed] });
      } else {
        const goodMessage = randomNumFromInterval(0, positive.length - 1);
        const embed = new EmbedBuilder()
          .setColor("Green")
          .setTitle("Crime")
          .setAuthor({
            name: `${message.author.username}`,
            iconURL: `${message.author.displayAvatarURL()}`,
            url: `https://discord.com/users/${message.author.id}`,
          })
          .setDescription(
            `${positive[goodMessage]} <:LyraCoin:1291733174761689168>  ${crimeAmount}`
          )
          .setTimestamp();
        message.channel.send({ embeds: [embed] });
      }

      // Set the crimeTimer to expire in 10 minutes
      setTimeout(() => {
        delete crimeTimer[message.author.id];
      }, cooldownTimes.command2);
    } else {
      // If the user has a crimeTimer entry, check how much time has passed since the last usage
      let timeSinceLastUsage = Date.now() - crimeTimer[message.author.id];
      // If less than 10 minutes have passed, send a message saying the command is on cooldown
      if (timeSinceLastUsage < cooldownTimes.command2) {
        let timeRemaining =
          (cooldownTimes.command2 - timeSinceLastUsage) / 60000;
        const embed = new EmbedBuilder()
          .setColor("Green")
          .setDescription(
            `This command is on cooldown. Please wait ${timeRemaining.toFixed(
              0
            )} more minutes before trying again.`
          )
          .setTimestamp();
        message.channel.send({ embeds: [embed] });
      } else {
        // If 10 minutes or more have passed, delete the timer entry and run the command logic
        delete crimeTimer[message.author.id];
        // ...
      }
    }
  }

  if (command === "weekly") {
    if (!storage[message.author.id].joined) {
      message.channel.send(
        `Whoops! You need to join first! Use the \`${prefix}join\` command to join in and get started!`
      );
      return;
    }

    if (!weeklyTimer[message.author.id]) {
      // If the user does not have a crimeTimer entry, create one
      weeklyTimer[message.author.id] = Date.now();

      // Run command logic...
      const embed = new EmbedBuilder()
        .setColor("Green")
        .setAuthor({
          name: `${message.author.username}`,
          iconURL: `${message.author.displayAvatarURL()}`,
          url: `https://discord.com/users/${message.author.id}`,
        })
        .setTitle("Weekly Collect")
        .setDescription(
          "You have now collected your weekly allowance of <:LyraCoin:1291733174761689168>  750."
        )
        .setTimestamp();

      storage[message.author.id].money += 750;
      message.channel.send({ embeds: [embed] });
      save();
    } else {
      // If the user has a weeklyTimer entry, check how much time has passed since the last usage
      let timeSinceLastUsage = Date.now() - weeklyTimer[message.author.id];
      // If less than 10 minutes have passed, send a message saying the command is on cooldown
      if (timeSinceLastUsage < cooldownTimes.command3) {
        let timeRemaining =
          (cooldownTimes.command3 - timeSinceLastUsage) / 60000;
        const embed = new EmbedBuilder()
          .setColor("Green")
          .setDescription(
            `This command is on cooldown. Please come back later to collect your weekly allowance.`
          )
          .setTimestamp();
        message.channel.send({ embeds: [embed] });
      } else {
        // If 10 minutes or more have passed, delete the timer entry and run the command logic
        delete weeklyTimer[message.author.id];
        // ...
      }
    }
  }

  if (command === "balance" || command === "bal") {
    if (!storage[message.author.id].joined) {
      message.channel.send(
        `Whoops! You need to join first! Use the \`${prefix}join\` command to join in and get started!`
      );
      return;
    }

    const userID = args[0];

    if (!userID) {
      const totalMoney =
        storage[message.author.id].bank + storage[message.author.id].money;

      const embed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("Balance")
        .setAuthor({
          name: `${message.author.username}`,
          iconURL: `${message.author.displayAvatarURL()}`,
          url: `https://discord.com/users/${message.author.id}`,
        })
        .setDescription(`Here is your current balance`)
        .addFields(
          {
            name: "**Bank**",
            value: `**<:LyraCoin:1291733174761689168>  ${storage[message.author.id].bank
              }**`,
            inline: true,
          },
          {
            name: "**Cash**",
            value: `**<:LyraCoin:1291733174761689168>  ${storage[message.author.id].money
              }**`,
            inline: true,
          },
          {
            name: "**Total**",
            value: `**<:LyraCoin:1291733174761689168>  ${totalMoney}**`,
            inline: true,
          },
          {
            name: "**Solana**",
            value: `**<:LyraCoin:1291733174761689168>  ${storage[message.author.id].solana
              }**`,
            inline: true,
          }
        )
        .setTimestamp();

      message.channel.send({ embeds: [embed] });
      return;
    }

    const targetUser =
      message.mentions.users.first() || client.users.cache.get(userID);

    if (!targetUser) {
      message.channel.send(
        "Please mention a user or provide their ID to check their balance."
      );
      return;
    }

    const targetMember = message.guild.members.cache.get(targetUser.id);
    if (
      !targetMember ||
      !storage[targetMember.id] ||
      !storage[targetMember.id].joined
    ) {
      message.channel.send("That user has not joined or does not exist.");
      return;
    }

    const targetStorage = storage[targetMember.id];
    const totalMoney = targetStorage.bank + targetStorage.money;

    const embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle("Balance")
      .setAuthor({
        name: `${targetUser.username}`,
        iconURL: `${targetUser.displayAvatarURL()}`,
        url: `https://discord.com/users/${targetUser.id}`,
      })
      .setDescription(`Here is the balance for ${targetUser.username}`)
      .addFields(
        {
          name: "**Bank**",
          value: `**<:LyraCoin:1291733174761689168>  ${targetStorage.bank}**`,
          inline: true,
        },
        {
          name: "**Cash**",
          value: `**<:LyraCoin:1291733174761689168>  ${targetStorage.money}**`,
          inline: true,
        },
        {
          name: "**Total**",
          value: `**<:LyraCoin:1291733174761689168>  ${totalMoney}**`,
          inline: true,
        }
      )
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  }

  if (command === "commands" || command === "help") {
    const embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle("Help")
      .setAuthor({
        name: `${message.author.username}`,
        iconURL: `${message.author.displayAvatarURL()}`,
        url: `https://discord.com/users/${message.author.id}`,
      })
      .setDescription(
        `These are the list of commands and the current prefix is \`${prefix}\`\n\n**ping**\nChecks to see if the bot is online\n\n**join**\nCreate an account\n\n**daily**\nAllows you to collect your daily income\n\n**crime**\nAllows you to commit a crime\n\n**weekly**\nAllows you to collect your weekly income\n\n**bal**\nChecks your current balance\n\n**work**\nCollect money for work\n\n**beg**\nBeg for money\n\n**stream**\nStream for some money\n\n**leaderboard**\nChecks what position you are on the leaderboard\n\n**with (amount)**\nWill withdraw a certain amount of money from your bank account to your cash amount\n\n**dep (amount)**\nWill deposit a certain amount of money from your cash account to your bank account\n\n**give (userID) (amount)**\nWill give a user of your choice a certain amount of your money **(currently not working)**\n\n**buy (amount)**\nWill allow you buy solana\n\n**sell (amount)**\nWill allow you to sell solana\n\n**cost**\nWill show the current cost of solana (updates every 5 minutes)`
      )
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  }

  if (command === "work") {
    if (!storage[message.author.id].joined) {
      message.channel.send(
        `Whoops! You need to join first! Use the \`${prefix}join\` command to join in and get started!`
      );
      return;
    }

    if (!fiveMinTimer[message.author.id]) {
      // If the user does not have a fiveMinTimer entry, create one
      fiveMinTimer[message.author.id] = Date.now();

      // Run command logic...
      const workMessages = [
        "You worked hard today and earned",
        "Your boss was impressed with your work and gave you a bonus of",
        "You worked overtime and earned an additional",
        "Your hard work and dedication have paid off with a salary increase of",
        "You worked as a construction worker and earned",
        "You worked as a waiter/waitress and earned",
        "You worked as a retail sales associate and earned",
        "You worked as a freelance writer and earned",
        "You worked as a software developer and earned",
        "You worked as a teacher and earned",
        "You worked as a plumber and earned",
        "You worked as a chef and earned",
        "You worked as a landscaper and earned",
        "You worked as a customer service representative and earned",
        "You worked as a delivery driver and earned",
        "You worked as a data analyst and earned",
        "You worked as a security guard and earned",
        "You worked as a marketing specialist and earned",
        "You worked as a hair stylist and earned",
        "You worked as a mechanic and earned",
        "You worked as a social media manager and earned",
        "You worked as a financial advisor and earned",
      ];

      const workAmount = randomNumFromInterval(50, 150);
      storage[message.author.id].money += workAmount;
      save();

      const randomMesssage = randomNumFromInterval(0, workMessages.length - 1);
      const embed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("Work")
        .setAuthor({
          name: `${message.author.username}`,
          iconURL: `${message.author.displayAvatarURL()}`,
          url: `https://discord.com/users/${message.author.id}`,
        })
        .setDescription(
          `${workMessages[randomMesssage]} <:LyraCoin:1291733174761689168>  ${workAmount}`
        )
        .setTimestamp();

      message.channel.send({ embeds: [embed] });

      // Set the fiveMinTimer to expire in 5 minutes
      setTimeout(() => {
        delete fiveMinTimer[message.author.id];
      }, cooldownTimes.command4);
    } else {
      // If the user has a fiveMinTimer entry, check how much time has passed since the last usage
      let timeSinceLastUsage = Date.now() - fiveMinTimer[message.author.id];
      // If less than 10 minutes have passed, send a message saying the command is on cooldown
      if (timeSinceLastUsage < cooldownTimes.command4) {
        let timeRemaining =
          (cooldownTimes.command4 - timeSinceLastUsage) / 60000;
        const embed = new EmbedBuilder()
          .setColor("Green")
          .setDescription(
            `This command is on cooldown. Please wait ${timeRemaining.toFixed(
              0
            )} more minutes before trying again.`
          )
          .setTimestamp();
        message.channel.send({ embeds: [embed] });
      } else {
        // If 10 minutes or more have passed, delete the timer entry and run the command logic
        delete fiveMinTimer[message.author.id];
        // ...
      }
    }
  }

  if (command === "beg") {
    if (!storage[message.author.id].joined) {
      message.channel.send(
        `Whoops! You need to join first! Use the \`${prefix}join\` command to join in and get started!`
      );
      return;
    }

    const begMoney = randomNumFromInterval(50, 150);
    storage[message.author.id].money += begMoney;
    save();

    if (!begTimer[message.author.id]) {
      // If the user does not have a begTimer entry, create one
      begTimer[message.author.id] = Date.now();

      // Run command logic...
      const begMessages = [
        "Mr. Beast comes along and because you watched some of his videos, he gives you",
        "You are facing a financial situation and someone gives you",
        "You try to raise money for a soup charity and gain",
        "Someone sees you and feels bad for you. They offer you",
        "You ask for money to start up a small business and someone offers you",
        "You walk around and find",
        "You tell a sob story to your friend and they give you",
      ];
      const messageIndex = randomNumFromInterval(0, begMessages.length - 1);

      const embed = new EmbedBuilder()
        .setColor("Green")
        .setAuthor({
          name: `${message.author.username}`,
          iconURL: `${message.author.displayAvatarURL()}`,
          url: `https://discord.com/users/${message.author.id}`,
        })
        .setDescription(
          `${begMessages[messageIndex]} <:LyraCoin:1291733174761689168>  ${begMoney}`
        )
        .setTimestamp();
      message.channel.send({ embeds: [embed] });

      // Set the begTimer to expire in 5 minutes
      setTimeout(() => {
        delete begTimer[message.author.id];
      }, cooldownTimes.command4);
    } else {
      // If the user has a begTimer entry, check how much time has passed since the last usage
      let timeSinceLastUsage = Date.now() - begTimer[message.author.id];
      // If less than 10 minutes have passed, send a message saying the command is on cooldown
      if (timeSinceLastUsage < cooldownTimes.command4) {
        let timeRemaining =
          (cooldownTimes.command4 - timeSinceLastUsage) / 60000;
        const embed = new EmbedBuilder()
          .setColor("Green")
          .setTitle("Beg")
          .setDescription(
            `This command is on cooldown. Please wait ${timeRemaining.toFixed(
              0
            )} more minutes before trying again.`
          )
          .setTimestamp();
        message.channel.send({ embeds: [embed] });
      } else {
        // If 10 minutes or more have passed, delete the timer entry and run the command logic
        delete begTimer[message.author.id];
        // ...
      }
    }
  }

  if (command === "stream") {
    if (!storage[message.author.id].joined) {
      message.channel.send(
        `Whoops! You need to join first! Use the \`${prefix}join\` command to join in and get started!`
      );
      return;
    }

    if (!streamTimer[message.author.id]) {
      // If the user does not have a streamTimer entry, create one
      streamTimer[message.author.id] = Date.now();

      // Run command logic...
      const streamAmount = randomNumFromInterval(50, 150);
      storage[message.author.id].money += streamAmount;
      save();

      const streamerNames = [
        "JoeIsPro",
        "Classic Noah",
        "Bob",
        "LunaStreams",
        "GamingWithGrace",
        "PixelPlaytime",
        "StreamQueen",
        "TheStreamMachine",
        "PlayfulPanda",
        "TechTonic",
        "StreamSiren",
        "GamerGoddess",
        "CyberSapien",
        "DigitalDreamer",
        "GameGeek",
        "PixelPirate",
        "TheGamingGuru",
        "PixelPal",
        "TheStreamingSorcerer",
        "DigitalDynamo",
        "Mrrrrrr BEEEEASSTT from Ohio",
      ];
      const messageIndex = randomNumFromInterval(0, streamerNames.length - 1);
      const embed = new EmbedBuilder()
        .setColor("Green")
        .setAuthor({
          name: `${message.author.username}`,
          iconURL: `${message.author.displayAvatarURL()}`,
          url: `https://discord.com/users/${message.author.id}`,
        })
        .setTitle("Stream")
        .setDescription(
          `${streamerNames[messageIndex]} just donated <:LyraCoin:1291733174761689168>  ${streamAmount} for streaming an awesome game`
        )
        .setTimestamp();
      message.channel.send({ embeds: [embed] });

      // Set the streamTimer to expire in 5 minutes
      setTimeout(() => {
        delete streamTimer[message.author.id];
      }, cooldownTimes.command4);
    } else {
      // If the user has a streamTimer entry, check how much time has passed since the last usage
      let timeSinceLastUsage = Date.now() - streamTimer[message.author.id];
      // If less than 10 minutes have passed, send a message saying the command is on cooldown
      if (timeSinceLastUsage < cooldownTimes.command4) {
        let timeRemaining =
          (cooldownTimes.command4 - timeSinceLastUsage) / 60000;
        const embed = new EmbedBuilder()
          .setColor("Green")
          .setDescription(
            `This command is on cooldown. Please wait ${timeRemaining.toFixed(
              0
            )} more minutes before trying again.`
          )
          .setTimestamp();
        message.channel.send({ embeds: [embed] });
      } else {
        // If 10 minutes or more have passed, delete the timer entry and run the command logic
        delete streamTimer[message.author.id];
        // ...
      }
    }
  }

  if (command === "leaderboard" || command === "lb") {
    if (!storage[message.author.id].joined) {
      message.channel.send(
        `Whoops! You need to join first! Use the \`${prefix}join\` command to join in and get started!`
      );
      return;
    }

    const guildMembers = message.guild.members.cache.filter((member) => {
      return storage[member.id] && storage[member.id].joined;
    });

    const leaderboard = guildMembers
      .sort((a, b) => {
        const totalAmountA = storage[a.id].money + storage[a.id].bank;
        const totalAmountB = storage[b.id].money + storage[b.id].bank;
        return totalAmountB - totalAmountA;
      })
      .first(10); // Get the top 10 members based on their total amount

    const embed = new EmbedBuilder()
      .setColor("Green")
      .setAuthor({
        name: `${message.author.username}`,
        iconURL: `${message.author.displayAvatarURL()}`,
        url: `https://discord.com/users/${message.author.id}`,
      })
      .setTitle(`Leaderboard for ${message.guild.name}`)
      .setDescription(
        leaderboard
          .map(
            (member, index) =>
              `${index + 1}. ${member.user.username
              } - <:LyraCoin:1291733174761689168>  ${storage[member.id].money + storage[member.id].bank
              }`
          )
          .join("\n")
      )
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  }

  if (command === "withdraw" || command === "with") {
    if (!storage[message.author.id].joined) {
      message.channel.send(
        `Whoops! You need to join first! Use the \`${prefix}join\` command to join in and get started!`
      );
      return;
    }
    const amount = args[0];

    if (!amount) {
      message.channel.send("Please specify the amount");
      return;
    }

    if (amount === "all") {
      storage[message.author.id].money += storage[message.author.id].bank;
      storage[message.author.id].bank = 0;

      const embed = new EmbedBuilder()
        .setTitle("Withdraw")
        .setColor("Green")
        .setAuthor({
          name: `${message.author.username}`,
          iconURL: `${message.author.displayAvatarURL()}`,
          url: `https://discord.com/users/${message.author.id}`,
        })
        .setDescription(
          `You have successfully withdrawn all your money to your cash account`
        )
        .setTimestamp();

      message.channel.send({ embeds: [embed] });
    } else {
      const amountNumber = parseInt(amount);

      if (isNaN(amountNumber) || amountNumber <= 0) {
        message.channel.send(
          "Please choose an actual number or a reasonable number"
        );
        return;
      }

      if (amountNumber > storage[message.author.id].bank) {
        message.channel.send(
          "This is more than you have in your bank account. Please try again..."
        );
        return;
      }

      storage[message.author.id].bank -= amountNumber;
      storage[message.author.id].money += amountNumber;

      const embed = new EmbedBuilder()
        .setTitle("Withdraw")
        .setColor("Green")
        .setAuthor({
          name: `${message.author.username}`,
          iconURL: `${message.author.displayAvatarURL()}`,
          url: `https://discord.com/users/${message.author.id}`,
        })
        .setDescription(
          `You have successfully withdrawn <:LyraCoin:1291733174761689168>  ${amountNumber} out of your bank account`
        )
        .setTimestamp();

      message.channel.send({ embeds: [embed] });
    }

    save();
  }

  if (command === "deposit" || command === "dep") {
    if (!storage[message.author.id].joined) {
      message.channel.send(
        `Whoops! You need to join first! Use the \`${prefix}join\` command to join in and get started!`
      );
      return;
    }
    const amount = args[0];

    if (!amount) {
      message.channel.send("Please specify an amount");
      return;
    }

    if (amount === "all") {
      storage[message.author.id].bank += storage[message.author.id].money;
      storage[message.author.id].money = 0;

      const embed = new EmbedBuilder()
        .setTitle("Deposit")
        .setColor("Green")
        .setAuthor({
          name: `${message.author.username}`,
          iconURL: `${message.author.displayAvatarURL()}`,
          url: `https://discord.com/users/${message.author.id}`,
        })
        .setDescription(
          `You have successfully deposit all your money to your bank account`
        )
        .setTimestamp();

      message.channel.send({ embeds: [embed] });
    } else {
      const amountNumber = parseInt(amount);

      if (isNaN(amountNumber) || amountNumber <= 0) {
        message.channel.send(
          "Please choose an actual number or a reasonable number"
        );
        return;
      }

      if (amountNumber > storage[message.author.id].money) {
        message.channel.send(
          "This is more than you have in your cash account. Please try again..."
        );
        return;
      }

      storage[message.author.id].money -= amountNumber;
      storage[message.author.id].bank += amountNumber;

      const embed = new EmbedBuilder()
        .setTitle("Deposit")
        .setColor("Green")
        .setAuthor({
          name: `${message.author.username}`,
          iconURL: `${message.author.displayAvatarURL()}`,
          url: `https://discord.com/users/${message.author.id}`,
        })
        .setDescription(
          `You have successfully deposited <:LyraCoin:1291733174761689168>  ${amountNumber} `
        )
        .setTimestamp();

      message.channel.send({ embeds: [embed] });
    }

    save();
  }

  if (command === "add") {
    if (!storage[message.author.id].joined) {
      message.channel.send(`Lol nice try bud`);
      return;
    }

    if (!storage[message.author.id].admin) {
      message.channel.send("Nice try bud. That's not gonna work here :)");
      return;
    } else {
      let recipientUser;
      const userId = args[0];
      const amount = parseInt(args[1]);

      if (message.mentions.users.size > 0) {
        recipientUser = message.mentions.users.first();
      } else if (userId && client.users.cache.has(userId)) {
        recipientUser = client.users.cache.get(userId);
      } else {
        message.channel.send("Please mention a user or provide their ID.");
        return;
      }

      // const member = client.members.cache.get(message.author.id);

      if (!storage[userId].joined) {
        message.channel.send(
          `Whoops! Looks like this user needs to join first! Tell them to use the \`${prefix}join\` command to join in and get started!`
        );
        return;
      }

      if (!userId) {
        message.channel.send("Please specify the id");
        return;
      }

      if (!amount) {
        message.channel.send("Please specify the amount");
        return;
      }

      storage[userId].money += amount;
      save();

      const embed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("Added Money")
        .setDescription(
          `Added <:LyraCoin:1291733174761689168>  ${amount} to ${recipientUser.username}'s bank account.`
        )
        .setTimestamp();

      message.channel.send({ embeds: [embed] });
    }
  }

  if (command === "remove") {
    if (!storage[message.author.id].joined) {
      message.channel.send(`Lol nice try bud. Not gonna happen :)`);
      return;
    }

    if (!storage[message.author.id].admin) {
      message.channel.send("Nice try bud. That's not gonna happen here :)");
      return;
    } else {
      let recipientUser;
      const userId = args[0];
      const amount = parseInt(args[1]);

      if (message.mentions.users.size > 0) {
        recipientUser = message.mentions.users.first();
      } else if (userId && client.users.cache.has(userId)) {
        recipientUser = client.users.cache.get(userId);
      } else {
        message.channel.send("Please mention a user or provide their ID.");
        return;
      }

      // const member = client.members.cache.get(message.author.id);

      if (!storage[userId].joined) {
        message.channel.send(
          `Whoops! Looks like this user needs to join first! Tell them to use the \`${prefix}join\` command to join in and get started!`
        );
        return;
      }

      if (!userId) {
        message.channel.send("Please specify the id");
        return;
      }

      if (!amount) {
        message.channel.send("Please specify the amount");
        return;
      }

      storage[userId].money -= amount;
      save();

      const embed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("Removed Money")
        .setDescription(
          `Removed <:LyraCoin:1291733174761689168>  ${amount} to ${recipientUser.username}'s bank account.`
        )
        .setTimestamp();

      message.channel.send({ embeds: [embed] });
    }
  }

  if (command === "buy") {
    if (!storage[message.author.id].joined) {
      message.channel.send(
        `Whoops! You need to join first! Use the \`${prefix}join\` command to join in and get started!`
      );
      return;
    }


    let numSolana = parseInt(args[0]);

    if (args[0] === "all") {
      numSolana = Math.floor(storage[message.author.id].cash / costOfSolana);
    }

    if (!numSolana) {
      message.channel.send("Please specify the amount of Solana you want to buy");
      return;
    }

    if (isNaN(numSolana) || numSolana < 1) {
      message.channel.send("Please choose an actual number or a reasonable number");
      return;
    }

    if (storage[message.author.id].money < costOfSolana * numSolana) {
      message.channel.send("You do not have enough money to buy that amount of Solana");
      return;
    }

    storage[message.author.id].money -= costOfSolana * numSolana;
    storage[message.author.id].solana += numSolana;
    save();

    const embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle("Buy")
      .setAuthor({
        name: `${message.author.username}`,
        iconURL: `${message.author.displayAvatarURL()}`,
        url: `https://discord.com/users/${message.author.id}`,
      })
      .setDescription(`You have successfully bought ${numSolana} Solana for <:LyraCoin:1291733174761689168>  ${costOfSolana * numSolana}`)
      .setTimestamp();

    message.channel.send({ embeds: [embed] });

  }

  if (command === "sell") {
    if (!storage[message.author.id].joined) {
      message.channel.send(
        `Whoops! You need to join first! Use the \`${prefix}join\` command to join in and get started!`
      );
      return;
    }

    let sellNumSolana = parseInt(args[0]);

    if (args[0] === "all") {
      sellNumSolana = storage[message.author.id].solana;
    }

    if (!sellNumSolana) {
      message.channel.send("Please specify the amount of Solana you want to sell");
      return;
    }

    if (isNaN(sellNumSolana) || sellNumSolana < 1) {
      message.channel.send("Please choose an actual number or a reasonable number");
      return;
    }

    if (storage[message.author.id].solana < sellNumSolana) {
      message.channel.send("You do not have enough Solana to sell that amount");
      return;
    }

    storage[message.author.id].money += costOfSolana * sellNumSolana;
    storage[message.author.id].solana -= sellNumSolana;
    save();

    const embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle("Sell")
      .setAuthor({
        name: `${message.author.username}`,
        iconURL: `${message.author.displayAvatarURL()}`,
        url: `https://discord.com/users/${message.author.id}`,
      })
      .setDescription(`You have sold ${sellNumSolana} Solana for <:LyraCoin:1291733174761689168>  ${costOfSolana * sellNumSolana}`)
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  }

  if (command === "cost") {
    const embed = new EmbedBuilder()
      .setTitle("Cost of Solana")
      .setColor("Green")
      .setDescription(`The current cost of Solana is <:LyraCoin:1291733174761689168>  ${costOfSolana}`)
      .setAuthor({
        name: `${message.author.username}`,
        iconURL: `${message.author.displayAvatarURL()}`,
        url: `https://discord.com/users/${message.author.id}`,
      })
      .setTimestamp()

    message.channel.send({ embeds: [embed] });

    message.channel.send(`You can buy ${Math.floor(storage[message.author.id].cash / costOfSolana)} Solanas and have ${storage[message.author.id].solana} Solanas to sell.`)
  }

  if (command === "gamble") {
    console.log("oh, we've got some gambling!");
    let amount = parseInt(args[0]);
    if (storage[message.author.id].cash < amount || !amount || amount <= 0) {
      const embed = new EmbedBuilder()
        .setTitle("Casino")
        .setColor("DarkRed")
        .setDescription("You must enter a valid number to gamble!")
        .setAuthor({
          name: `${message.author.useranme}`,
          iconURL: `${message.author.displayAvatarURL()}`,
          url: `https://discord.com/users/${message.author.id}`,
        })
        .setTimestamp()

      message.channel.send({ embeds: [embed] });
      return;
    }
    let earnings = Math.random() * 10000;
    earnings %= amount * 4;
    earnings -= amount * 2;
    earnings = Math.floor(earnings);
    storage[message.author.id].cash += earnings;
    save();
    if (earnings >= 0) {
      const embed = new EmbedBuilder()
        .setTitle("Casino")
        .setColor("Green")
        .setDescription(`You gambled and earned <:LyraCoin:1291733174761689168>  ${earnings}!`)
        .setAuthor({
          name: `${message.author.username}`,
          iconURL: `${message.author.displayAvatarURL()}`,
          url: `https://discord.com/users/${message.author.id}`,
        })
        .setTimestamp()
      message.channel.send({ embeds: [embed] });
      return;
    } else {

      const embed = new EmbedBuilder()
        .setTitle("Casino")
        .setColor("DarkRed")
        .setDescription(`You gambled and lost <:LyraCoin:1291733174761689168>  ${earnings * -1}!`)
        .setAuthor({
          name: `${message.author.username}`,
          iconURL: `${message.author.displayAvatarURL()}`,
          url: `https://discord.com/users/${message.author.id}`,
        })
        .setTimestamp()
      message.channel.send({ embeds: [embed] });
      return;
    }
  }

  let sellModifiers = {
    potion: 0.8,
    wood: 0.7,
    stone: 0.6
  };

  // Fungsi untuk menulis data ke storage.json
  function updateStorage() {
    fs.writeFileSync("./storage.json", JSON.stringify(storage));
  }

  // Fungsi untuk membaca data dari shop.json
  function loadShop() {
    const shopData = fs.readFileSync('./shop.json', 'utf8');
    return JSON.parse(shopData);
  }

  // Fungsi untuk memperbarui item di shop.json
  function updateShop(shopItems) {
    fs.writeFileSync('./shop.json', JSON.stringify(shopItems, null, 2));
  }

  // Command handler
  if (command === "shop") {
    const shopItems = loadShop(); // Load current shop items from shop.json
    const playerId = message.author.id;
    const player = storage[playerId];

    if (!player) {
      return message.reply("You don't have an account yet.");
    }

    // Tampilkan daftar item yang dijual
    if (!args[0]) {
      let shopList = "Items available in the shop:\n";
      for (const item in shopItems) {
        shopList += `${item.charAt(0).toUpperCase() + item.slice(1)} - Price: ${shopItems[item].price} ${shopItems[item].currency}, Stock: ${shopItems[item].stock}\n`;
      }
      return message.reply(shopList);
    }

    if (args[0] === "buy") {
      const item = args[1];
      const quantity = parseInt(args[2]);

      if (!shopItems[item]) return message.reply("Item not available in the shop.");
      if (shopItems[item].stock < quantity) return message.reply(`Not enough stock for ${item}.`);

      const totalPrice = shopItems[item].price * quantity;
      const currency = shopItems[item].currency;

      if (player[currency] < totalPrice) {
        return message.reply(`You don't have enough ${currency}. You need ${totalPrice} ${currency} to buy ${quantity} ${item}(s).`);
      }

      // Kurangi saldo player dan stock item
      player[currency] -= totalPrice;
      shopItems[item].stock -= quantity;

      // Tambahkan item ke inventory player
      if (!player.inventory) player.inventory = {};
      player.inventory[item] = (player.inventory[item] || 0) + quantity;

      // Simpan data yang diperbarui
      updateStorage();
      updateShop(shopItems);

      return message.reply(`You bought ${quantity} ${item}(s) for ${totalPrice} ${currency}. Your remaining ${currency}: ${player[currency]}`);
    }

    // Player menjual item
    if (args[0] === "sell") {
      const item = args[1];
      const quantity = parseInt(args[2]);

      // Cek apakah item tersedia di shop
      if (!shopItems[item]) return message.reply("You cannot sell this item.");

      // Cek apakah player memiliki item yang cukup untuk dijual
      if (!player.inventory || !player.inventory[item] || player.inventory[item] < quantity) {
        return message.reply(`You don't have enough ${item}(s) to sell.`);
      }

      // Hitung harga jual dengan modifier dan fluktuasi harga
      let sellPrice = shopItems[item].price * sellModifiers[item] * quantity;
      const fluctuation = Math.random() * 0.2 - 0.1;
      sellPrice = Math.round(sellPrice * (1 + fluctuation));
      const currency = shopItems[item].currency;

      // Tambahkan saldo player
      player[currency] += sellPrice;

      // Tambahkan stock item di shop
      shopItems[item].stock += quantity;

      // Kurangi item dari inventory player
      player.inventory[item] -= quantity;

      // Jika jumlah item di inventory player menjadi 0, hapus item dari inventory
      if (player.inventory[item] === 0) {
        delete player.inventory[item];
      }

      // Simpan perubahan di player storage dan shop
      updateStorage(); // Simpan perubahan pada data player
      updateShop(shopItems); // Simpan perubahan pada data shop

      // Balas pesan konfirmasi penjualan
      return message.reply(`You sold ${quantity} ${item}(s) for ${sellPrice} ${currency}. Stock for ${item} in the shop is now ${shopItems[item].stock}.`);
    }
    // Admin command to add stock to an item
    if (args[0] === "addstock") {
      const item = args[1];
      const quantity = parseInt(args[2]);

      // Check for administrator permission
      if (!message.member.permissions.has("ADMINISTRATOR")) {
        return message.reply("You don't have permission to do that.");
      }

      // Check if the item exists
      if (!shopItems[item]) return message.reply("Item not available in the shop.");

      // Add stock to the item
      shopItems[item].stock += quantity;

      // Update shop and notify the admin
      updateShop(shopItems);
      return message.reply(`Added ${quantity} ${item}(s) to the shop. Current stock: ${shopItems[item].stock}`);
    }

    // Admin command to set item price and stock
    if (args[0] === "setitem") {
      const item = args[1];
      const newPrice = parseInt(args[2]);
      const newStock = parseInt(args[3]);

      // Check for administrator permission
      if (!message.member.permissions.has("ADMINISTRATOR")) {
        return message.reply("You don't have permission to do that.");
      }

      // If item doesn't exist, create a new one with the given price and stock
      if (!shopItems[item]) {
        shopItems[item] = { price: newPrice, currency: 'money', stock: newStock };
      } else {
        // Update price and stock of existing item
        shopItems[item].price = newPrice;
        shopItems[item].stock = newStock;
      }

      // Update shop and notify the admin
      updateShop(shopItems);
      return message.reply(`Item ${item} has been updated with price ${newPrice} and stock ${newStock}`);
    }

    // Admin command to add a new item to the shop
    if (args[0] === "additem") {
      const item = args[1];
      const price = parseInt(args[2]);
      const stock = parseInt(args[3]);
      const currency = args[4] || 'money'; // Default currency is 'money'

      // Check for administrator permission
      if (!message.member.permissions.has("ADMINISTRATOR")) {
        return message.reply("You don't have permission to do that.");
      }

      // Check if the item already exists
      if (shopItems[item]) return message.reply("Item already exists in the shop.");

      // Add the new item to the shop
      shopItems[item] = { price, stock, currency };

      // Update shop and notify the admin
      updateShop(shopItems);
      return message.reply(`Item ${item} has been added to the shop with price ${price} and stock ${stock}`);
    }

    // Admin command to remove an item from the shop
    if (args[0] === "removeitem") {
      const item = args[1];

      // Check for administrator permission
      if (!message.member.permissions.has("ADMINISTRATOR")) {
        return message.reply("You don't have permission to do that.");
      }

      // Check if the item exists in the shop
      if (!shopItems[item]) return message.reply("Item not found in the shop.");

      // Remove the item from the shop
      delete shopItems[item];

      // Update shop and notify the admin
      updateShop(shopItems);
      return message.reply(`Item ${item} has been removed from the shop.`);
    }
  }

  if (command === "inventory") {
    const playerId = message.author.id;
    const player = storage[playerId];

    if (!player) {
      return message.reply("You don't have an account yet.");
    }

    if (!player.inventory || Object.keys(player.inventory).length === 0) {
      return message.reply("Your inventory is empty.");
    }

    let inventoryList = "Your inventory:\n";
    for (const item in player.inventory) {
      inventoryList += `${item.charAt(0).toUpperCase() + item.slice(1)}: ${player.inventory[item]}\n`;
    }

    return message.reply(inventoryList);
  }

  // if (command === "give" || command === "donate") {
  //   let recipientUser;
  //   const userID = args[0];
  //   const amount = parseInt(args[1]);

  //   if (message.mentions.users.size > 0) {
  //     recipientUser = message.mentions.users.first();
  //   } else if (userID && client.users.cache.has(userID)) {
  //     recipientUser = client.users.cache.get(userID);
  //   } else {
  //     message.channel.send("Please mention a user or provide their ID.");
  //     return;
  //   }

  //   const recipientData = storage[recipientUser.id];
  //   const senderData = storage[message.author.id];

  //   if (!recipientData || !recipientData.joined) {
  //     message.channel.send(
  //       "The recipient has not joined yet, so you cannot give them any money."
  //     );
  //     return;
  //   }

  //   if (!amount || isNaN(amount) || amount <= 0) {
  //     message.channel.send("Please specify a valid amount to give.");
  //     return;
  //   }

  //   if (senderData.money < amount) {
  //     message.channel.send("You do not have enough money to give.");
  //     return;
  //   }

  //   recipientData.money += amount;
  //   senderData.money -= amount;
  //   save();

  //   const embed = new EmbedBuilder()
  //     .setColor("Green")
  //     .setTitle("Give money")
  //     .setAuthor({
  //       name: `${message.author.username}`,
  //       iconURL: `${message.author.displayAvatarURL()}`,
  //       url: `https://discord.com/users/${message.author.id}`,
  //     })
  //     .setDescription(
  //       `You have successfully given <:LyraCoin:1291733174761689168>  ${amount} to ${recipientUser.username}.`
  //     )
  //     .setTimestamp();

  //   message.channel.send({ embeds: [embed] });
  // }

});

client.login(TOKEN);

