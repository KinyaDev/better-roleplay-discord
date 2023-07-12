const { SlashCommandBuilder } = require("discord.js");
const { CharactersAPI } = require("../modules/db");
const charaSelectMenu = require("../modules/charaSelectMenu");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("select")
    .setDescription(
      "Make the selected character, your currently using character"
    ),
  /**
   *
   * @param {Client} client
   * @param {import("discord.js").CommandInteraction} interaction
   */
  run: async (client, interaction) => {
    const CharaSel = await require("../modules/charaSelectMenu")(
      interaction.user,
      interaction
    );

    let menu = await CharaSel.genMenu();
    if (menu.selectMenu.options.length > 1) {
      let message = await interaction.editReply({
        content:
          "Select a character and do further actions with it, like `/say`, `/stats-set`, `/stats-del`, `/species`, `/bio`, etc...",
        components: menu.row,
        fetchReply: true,
      });

      let collector = CharaSel.genCollector(
        message,
        async (chara, charas, db) => {
          db.select(chara._id);

          interaction.editReply(
            `${chara.name} has been set to your current character`
          );
        }
      );
    } else {
      interaction.editReply(
        "You have only one character! If you intend to create another character, don't forget to use this command for doing further action as the character you selected."
      );
    }
  },
};
