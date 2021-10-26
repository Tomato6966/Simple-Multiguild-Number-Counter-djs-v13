const config = require("./config.json");
const Discord = require("discord.js")
//Export this file!
module.exports = client => {
    //create a messageCreate listener EVENT
    client.on("messageCreate", async (message) => {
        //return if not inside of a guild or the guild is not available or got sent by a BOT
        if(!message.guild || message.guild.available === false || message.author.bot) return;
        let { prefix } = config; // i have a data inside of config.json which is the prefix with object destructering u can grab it!
        //Commands
        if(message.content.startsWith(prefix)){
            let args = message.content.slice(prefix.length).trim().split(" ");
            let cmd = args.shift()?.toLowerCase();
            //create all commands
            if(cmd && cmd.length > 0){
                switch(cmd){
                    //for this tutorial we will name the setup command "setup"
                    case "setup": {
                        if(!message.member.permissions.has(Discord.Permissions.FLAGS.ADMINISTRATOR)) {
                            return message.reply(":x: Only admins can do it!")
                        }
                        let channel = message.mentions.channels.first();
                        if(!channel) return message.reply(`Try this: \`${prefix}setup #Channel\``);
                        //set the database
                        client.settings.set(message.guild.id, {
                            counter: channel.id, //if you want to DISABLE it set "no" instead of channel.id !!
                            counternum: 0,
                            counterauthor: "",
                        })
                        message.reply("👍 **SUCCESSFULLY SETUP THE NUMBER COUNTER!**")
                    }break;
                }
            }
        }
        //Number Counter
        //ensure the database, before using it!
        client.settings.ensure(message.guild.id, {
            counter: " ", 
            counternum: 0,
            counterauthor: "",
        })
        if(message.channel.id == client.settings.get(message.guild.id, "counter")){
            let count = client.settings.get(message.guild.id, "counternum") //get the current counter number;
            let counterauthorId = client.settings.get(message.guild.id, "counterauthor") //get the last counter user!
            if(isNaN(count)){
                client.settings.set(message.guild.id, 0, "counternum"); //Rest the counternumber if it got out of range (INT_MAX)
                count = 0;
            }
            //if the current counter == last counter
            if(message.author.id == counterauthorId){
                await message.reply(":clock1: **Please wait for your turn!**").then(msg=>{
                    setTimeout(()=>{
                        msg.delete().catch(() => {}); //Delete the error message after 3 seconds!
                    }, 3000 )
                })
                return message.delete().catch(() => {});
            }
            //if the content is invalid //MY MISTAKE its isNaN mind the UPPERCASE letters!
            if(!message.content || isNaN(message.content)){
                await message.reply(":x: **Please only use a __real__ Number!**").then(msg=>{
                    setTimeout(()=>{
                        msg.delete().catch(() => {}); //Delete the error message after 3 seconds!
                    }, 3000 )
                })
                //return setTimeout(()=>{message.delete().catch(() => {});}, 500) //Delete the content message after X TIME if you want
                return message.delete().catch(() => {});
            }
            //if the number is not right!
            if(parseInt(message.content) !== count + 1){
                await message.reply(`:x: **This is not the right Number!** ||Tipp: \`${count}\` was it before...||`).then(msg=>{
                    setTimeout(()=>{
                        msg.delete().catch(() => {}); //Delete the error message after 3 seconds!
                    }, 3000 )
                })
                return message.delete().catch(() => {});
            }
            client.settings.inc(message.guild.id, "counternum"); //increase the counternumber in the database
            client.settings.set(message.guild.id, message.author.id, "counterauthor"); //set the counterauthor in the database
            //you can add reactions / responses if you want to, like:
            //message.react("👍").catch(() => {}); //but keep in mind, if spamming that would slow down the bot!
        }
    })
}