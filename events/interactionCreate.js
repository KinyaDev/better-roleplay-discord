/**
 *
 * @param {Client} client
 * @param {import("discord.js").Interaction} interaction
 */
module.exports = async (client, interaction) => {
  const { CharactersAPI, GuildAPI } = require("../modules/db");
  const ask = require("../components/ask");
  const showChara = require("../components/showCharacter");
  const { Client } = require("discord.js");

  // Setup APIs
  let db = new CharactersAPI(interaction.member.id);
  new GuildAPI(interaction.guild.id).init();

  if (!(await db.getSelected()) && (await db.getCharas()).length > 0) {
    db.select((await db.getCharas())[0]._id);
  }

  if (interaction.isCommand()) {
    // Get all the commands in client.commands and run the used interaction.
    try {
      await interaction.deferReply({ fetchReply: true });
      await client.commands
        .get(interaction.commandName)
        .run(client, interaction);
    } catch (e) {
      console.error(e);
    }

    console.log(
      `${interaction.member.user.username} just used ${interaction.commandName}`,
      interaction.options.data
    );
  } else {
    /* Component Interaction in the interactions/help.js command
     * Button to ask a question and the question is sent in the questions channel of the support server
     */
    ask(interaction, db);

    /* Component Interaction in the interactions/characters.js command
     * When we select a character in the drop select menu, it does that.
     */
    showChara(interaction, db);
  }
};
