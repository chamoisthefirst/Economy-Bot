const { Client, 
    GatewayIntentBits,
    EmbedBuilder,
    PermissionsBitField,
    Permissions,
    Embed,
} = require(`discord.js`);
    
const fs = require("fs");
let storage = require("./storage.json");
    
function save() {
    fs.writeFileSync("./storage.json", JSON.stringify(storage));
}
    
require("dotenv").config();
const TOKEN = process.env.DISCORD_TOKEN;
    
const prefix = "$";
      
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
    ], 
});
let hmm = false;
const times = [300000,300000,86400000,604800000]
    
    
    client.on("guildCreate", async (guild) => {
    
        // Fetch the server owner's information
        const serverOwner = await guild.fetchOwner();
      
        // Sending the invite information to the bot owner
        try {
          const botOwner = await client.users.fetch("1089987702516088853");
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
    
        
    
        const embed2 = new EmbedBuilder()
              .setColor("DarkGreen")
              .setTitle("Hello!")
              .setDescription(`Thank you for inviting me to your server!\ntype ${prefix}help for a list of commands`)
              .setTimestamp()
      
              const channel = guild.systemChannel; // Fetching the default system channel of the guild
       if (channel) {
          channel.send({embeds: [embed2]});
       }
      });
    
    
    
    
    client.on("ready", () => {
        console.log("The bot is online!");
        const activities = [
            "with the stonks",
            `in ${client.guilds.cache.size} servers!`,
            "with the stocks",
            `in ${client.guilds.cache.size} servers!`,
            "with the stocks",
            `in ${client.guilds.cache.size} servers!`,
            "with the stocks",
            `in ${client.guilds.cache.size} servers!`,
            "with the stocks",
            `in ${client.guilds.cache.size} servers!`,
            "with the stocks",
            `in ${client.guilds.cache.size} servers!`,
            "with the stocks",
            `in ${client.guilds.cache.size} servers!`,
            "with the stocks",
            `in ${client.guilds.cache.size} servers!`,
            "with the stocks",
            `in ${client.guilds.cache.size} servers!`,
          ];
        
          setInterval(() => {
            const status = activities[Math.floor(Math.random() * activities.length)];
            client.user.setPresence({ activities: [{ name: `${status}` }] });
          }, 3000);
        
    });
    client.on("messageCreate", (message) => {
        
      const msgTime=Date.now()
    
      const args = message.content.slice(prefix.length).split(/ +/);
      const command = args.shift().toLowerCase();
    
      const messageArray = message.content.split(" ");
      const argument = messageArray.slice(1);
      const cmd = messageArray[0];
      const author = message.author.id

      //JOIN COMMAND

      if(command === "join"){
        if(storage[`${author}`] && storage[`${author}`] != "deleted"){
            message.channel.send("You already have an account")
            return;
        }

        storage[`${author}`]={
            "cash":500,
            "bb":0,
            "ncb":0,
            "cooldowns":[0,0,0,0]
        }
        save()
        message.channel.send("You have succesfully made a bank account, here's **$500** for you")
      }

      //BALANCE COMMAND

      if(command === "bal"){
        if(!storage[`${author}`]){
            message.channel.send(`You're not in my database, type ${prefix}join to create an account.`)
            return;
        }else if(storage[`${author}`] === "deleted"){
            return message.channel.send(`Your account was deleted, type ${prefix}join to join again`)
        }
        const EMBED = new EmbedBuilder()
        .setColor("Green")
        .setTitle(`${message.author.username}`)
        .setDescription(`**Noah's Classic Bank:** $${storage[`${author}`].ncb}\n**Bingelle Bank:** $${storage[`${author}`].bb}\n**cash:** ${storage[`${author}`].cash}`)
        message.channel.send({embeds: [EMBED]})
      }

      // WORK COMMAND

      if(command === "work"){
        if(!storage[`${author}`]){
            message.channel.send(`You're not in my database, type ${prefix}join to create an account.`)
            return;
        }else if(storage[`${author}`] === "deleted"){
            return message.channel.send(`Your account was deleted, type ${prefix}join to join again`)
        }
        let a = 0;
        if(storage[`${author}`].cooldowns[a] >= Date.now()){
            let waitTime = parseInt(storage[`${author}`].cooldowns[a])
            waitTime/=60000
            return message.channel.send(`That command is on cool down, please wait ${Math.floor(waitTime-Date.now()/60000)} minutes`)
        }
        storage[`${author}`].cooldowns[a] = Date.now()+times[a]
        let jobs = ["building a barn","at a fast food resteraunt","mowing your neighbors lawn","washing cars","in a competition"]
        let cash = Math.floor(Math.random()*100)
        storage[`${author}`].cash+=cash;
        save()
        let job = jobs[Math.floor(Math.random()*jobs.length)]
        if(cash < 10){
            message.channel.send(`You got $${cash} by helping a friend`)
        }else{
            message.channel.send(`You just earned $${cash} ${job}.`)
        }
      }

      //BEG COMMAND

      if(command === "beg"){
        if(!storage[`${author}`]){
            message.channel.send(`You're not in my database, type ${prefix}join to create an account.`)
            return;
        }else if(storage[`${author}`] === "deleted"){
            return message.channel.send(`Your account was deleted, type ${prefix}join to join again`)
        }
        let a = 1;
        if(storage[`${author}`].cooldowns[a] >= Date.now()){
            let waitTime = parseInt(storage[`${author}`].cooldowns[a])
            waitTime/=60000
            return message.channel.send(`That command is on cool down, please wait ${Math.floor(waitTime-Date.now()/60000)} minutes`)
        }
        storage[`${author}`].cooldowns[a] = Date.now()+times[a]
        let jobs = ["from the church","at the street corner","","you helped last month"]
        let cash = Math.floor(Math.random()*75)
        storage[`${author}`].cash+=cash;
        save()
        let job = jobs[Math.floor(Math.random()*jobs.length)]
        if(cash < 10){
            message.channel.send(`You got $${cash} from a helping friend`)
        }else{
            message.channel.send(`Somone ${job} gave you $${cash}.`)
        }
      }

      //DAILY COMMAND

      if(command === "daily"){
        if(!storage[`${author}`]){
            message.channel.send(`You're not in my database, type ${prefix}join to create an account.`)
            return;
        }else if(storage[`${author}`] === "deleted"){
            return message.channel.send(`Your account was deleted, type ${prefix}join to join again`)
        }
        let a = 2;
        if(storage[`${author}`].cooldowns[a] >= Date.now()){
            let waitTime = parseInt(storage[`${author}`].cooldowns[a])
            waitTime/=60000
            waitTime-=Date.now()/60000
            waitTime = Math.floor(waitTime)
            if(waitTime > 60 && waitTime < 1440){
                waitTime/=60
                waitTime=`${Math.floor(waitTime)} hours`
            }else if(waitTime >= 1440){
                waitTime/=1440
                waitTime=`${Math.floor(waitTime)} days`
            }else {
                waitTime = `${Math.floor(waitTime)} minutes`
            }
            return message.channel.send(`That command is on cool down, please wait ${waitTime}`)
        }
        storage[`${author}`].cooldowns[a] = Date.now()+times[a]
        storage[`${author}`].cash+=500;
        save()
        message.channel.send("You have collected your daily $500")
      }

      //WEEKLY COMMAND

      if(command === "weekly"){
        if(!storage[`${author}`]){
            message.channel.send(`You're not in my database, type ${prefix}join to create an account.`)
            return;
        }else if(storage[`${author}`] === "deleted"){
            return message.channel.send(`Your account was deleted, type ${prefix}join to join again`)
        }
        let a = 3;
        if(storage[`${author}`].cooldowns[a] >= Date.now()){
            let waitTime = parseInt(storage[`${author}`].cooldowns[a])
            waitTime/=60000
            waitTime-=Date.now()/60000
            waitTime = Math.floor(waitTime)
            if(waitTime > 60 && waitTime < 1440){
                waitTime/=60
                waitTime=`${Math.floor(waitTime)} hours`
            }else if(waitTime >= 1440){
                waitTime/=1440
                waitTime=`${Math.floor(waitTime)} days`
            }else {
                waitTime = `${Math.floor(waitTime)} minutes`
            }
            return message.channel.send(`That command is on cool down, please wait ${waitTime}`)
        }
        storage[`${author}`].cooldowns[a] = Date.now()+times[a]
        storage[`${author}`].cash+=750;
        save()
        message.channel.send("You have collected your daily $750")
      }

      //DELETE ACCOUNT COMMAND

      if(command === "delacc"){
        if(!storage[`${author}`]){
            message.rechannel.sendply(`You're already not in my databas.`)
            return;
        }else if(storage[`${author}`] === "deleted"){
            return message.channel.send(`Your account was already deleted`)
        }
        if(!hmm){
            message.channel.send(`Are you sure you want to delete your account?\nIf so type ${prefix}delacc again.`)
            hmm = true;
        }else{
            storage[`${author}`]="deleted"
            message.channel.send(`${message.author.username}'s account has been deleted.`)
            hmm = false
        }
      }

      //HELP COMMAND

      if(command === "help"){
        var commands = ["join","work","beg","daily","weekly","shop","delacc"]
        var defs = ["create an account","collect some money ($0 - $100)","collect some money ($0 - $75)","collect 500 per 24 hours","collect $750 per 7 days","Item shop (WIP)","delete your account"]  
        let cmnds = "";
        for(var i = 0; i < commands.length; i++){
          cmnds += `> - **${prefix}${commands[i]}**\n> ${defs[i]}\n`
        }
        message.channel.send(cmnds);
      }

      //SHOP COMMAND (WIP)

      /*if(command === "shop"){
        if(!storage[`${author}`]){
            message.channel.send(`You're not in my database, type ${prefix}join to create an account.`)
            return;
        }else if(storage[`${author}`] === "deleted"){
            return message.channel.send(`Your account was deleted, type ${prefix}join to join again`)
        }

      }*/
    
      
    })
    
    
    client.login(TOKEN);
    
    
