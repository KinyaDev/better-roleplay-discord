const { EmbedBuilder, Client } = require("discord.js");
const { CharactersAPI } = require("./db");

async function CharaEmbed(chara, member, guild) {
  console.log(guild);
  let db = new CharactersAPI(member.id);

  let statsToAppend = "";

  let stats = await db.getStats(chara._id);

  stats.forEach((s, i) => {
    if (i === 0) {
      statsToAppend += "__Stats__:\n";
    }
    statsToAppend += ` **${s.name}**: ${s.value}\n`;
  });

  let emb = new EmbedBuilder()
    .setAuthor({
      name: member.username,
      iconURL: member.displayAvatarURL(),
    })
    .setTitle(chara.name)
    .setDescription(`${chara.bio || ""}\n\n${statsToAppend}`)
    .setThumbnail(chara.avatar)
    .setFooter({
      text: `Character ID: ${(await db.indexOf(chara._id)) + 1}`,
    });

  if (chara.species) {
    emb.addFields({ name: "🐱 Species", value: chara.species });
  } else emb.addFields({ name: "🐱 Species", value: "Human" });

  if (chara.location) {
    let ch = await guild.channels.fetch(chara.location);
    emb.addFields({ name: "🗺️ Location", value: ch.name });
  } else emb.addFields({ name: "🗺️ Location", value: "Nowhere" });

  return emb.toJSON();
}
const helpEmbed = new EmbedBuilder()
  .setColor("#0099ff")
  .setTitle("Bot Help")
  .setDescription("Here are some commands and their descriptions:")
  .setFields([
    {
      name: "**Auto-Proxy**",
      value:
        "Enable or disable auto-proxy in any channel with the `/auto-proxy` command. Fine-tune your roleplaying environment to suit your needs.",
    },
    {
      name: "**Character Customization**",
      value:
        "Set Avatar: Personalize your character's appearance by setting their avatar with the `/avatar [avatar]` command.\nBio: Craft a captivating backstory or description for your character using the `/bio` command.\nSpecies: Define your character's species and give them a unique identity with the `/species` command.",
    },
    {
      name: "**Character Management**",
      value:
        'View Characters: Keep track of all your characters by using the `/characters` command. Easily access their details and update their information. Click on the "Use" button to select the current shown character, and try `/say [message]` to make them speak.\nRegister: Create a new character and start shaping their story by using the `/register` command.\nUnregister: Remove a character from your roster with the `/unregister` command.',
    },
    {
      name: "**Place System**",
      value:
        "Enable/Disable: Customize the place system in your server by using the `/place-system enable` command.\nChannels: Set up specific channels for roleplaying locations using the `/place-system channels [add/delete]` command.\nTravel: Traverse between different places within your roleplaying world with the `/place-system travel` command.\nReset: Reset the place system and clear all location data with the `/place-system reset` command.\nLink/Unlink: Connect or disconnect a roleplaying channel to the place system using the `/place-system link` or `/place-system unlink` command.",
    },
    {
      name: "**Stats Management**",
      value:
        "Set Stats: Define custom stats for your characters using the `/stats-set` command. Set various attributes and abilities to enhance their roleplaying capabilities.\nDelete Stats: Remove unwanted or outdated stats from your character's profile with the `/stats-del` command.",
    },
    {
      name: "**Language Support**",
      value:
        "This bot provides multilingual support. Use the `/language [lang]` command to select your preferred language. It is available in English (100%), French (90%), and German (90%).",
    },
    {
      name: "**Help & Support**",
      value:
        "For more information, guidance, and frequently asked questions, use the `/help` command. Our helpful and friendly support team is ready to assist you in making the most of our bot.",
    },
  ]);

const placeSystemEmbed = new EmbedBuilder()
  .setColor("#0099ff")
  .setTitle("Place System Command")
  .setDescription(
    "Customize the place system in your server with these subcommands:"
  )
  .setFields([
    {
      name: "**Enable/Disable**",
      value:
        "Enable or disable the place system in your server.\nUsage: `/place-system enable`, use that command again to disable.",
    },
    {
      name: "**Channels**",
      value:
        "Set up specific channels for roleplaying locations.\nUsage: `/place-system channels [add/delete]`.",
    },
    {
      name: "**Travel**",
      value:
        "Traverse between different places within your roleplaying world.\nUsage: `/travel`.",
    },
    {
      name: "**Reset**",
      value:
        "Reset the place system and clear all location data.\nUsage: `/place-system reset`.",
    },
    {
      name: "**Link/Unlink**",
      value:
        "Connect or disconnect a roleplaying channel to the place system.\nUsage: `/place-system link` or `/place-system unlink`.",
    },
  ]);

module.exports = {
  placeSystemEmbed,
  helpEmbed,
  CharaEmbed,
};
