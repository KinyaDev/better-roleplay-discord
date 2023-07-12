const { Client } = require("discord.js");

/**
 *
 * @param {Client} client
 * @param {import("discord.js").Interaction} interaction
 */
module.exports = async (client, interaction) => {
  const { CharactersAPI, GuildAPI, BotActivityAPI } = require("../modules/db");
  const ask = require("../components/ask");

  // Setup APIs
  let db = new CharactersAPI(interaction.member.id);
  new GuildAPI(interaction.guild.id).init();

  if (!(await db.getSelected()) && (await db.getCharas()).length > 0) {
    db.select((await db.getCharas())[0]._id);
  }

  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return interaction.reply("This command is outdated");
    if (command.developer && interaction.user.id !== "505832674217295875")
      return interaction.reply(
        "This command is only available for the developer"
      );

    // Get all the commands in client.commands and run the used interaction.
    try {
      await interaction.deferReply({ fetchReply: true });
      try {
        await client.commands
          .get(interaction.commandName)
          .run(client, interaction);
      } catch (e) {
        console.log("Unable to execute", interaction.commandName);
      }
    } catch (e) {
      console.error(e);
    }

    new BotActivityAPI().addInteraction({
      guild_id: interaction.guildId,
      commandName: interaction.commandName,
      options: interaction.options.data.toString(),
      timestamp: interaction.createdTimestamp,
      user_id: interaction.user.id,
    });

    console.log(
      `${interaction.member.user.username} just used ${interaction.commandName}`,
      interaction.options.data
    );
  } else {
    /* Component Interaction in the interactions/help.js command
     * Button to ask a question and the question is sent in the questions channel of the support server
     */
    await ask(interaction, db);
  }
};
