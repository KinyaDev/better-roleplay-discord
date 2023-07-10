const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Client,
  StringSelectMenuBuilder,
  ActionRowBuilder,
  ComponentType,
} = require("discord.js");
const charaSelectMenu = require("../modules/charaSelectMenu");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pay")
    .setDescription("Pay a character with your personal balance.")
    .addUserOption((opt) =>
      opt
        .setName("user")
        .setDescription("Mention of the user")
        .setRequired(true)
    )
    .addNumberOption((opt) =>
      opt
        .setName("balance")
        .setDescription("The balance to pay.")
        .setRequired(true)
    ),

  /**
   *
   * @param {Client} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    const { CharactersAPI, EconomyAPI } = require("../modules/db");

    let user = interaction.options.getUser("user");
    let db = new CharactersAPI(interaction.user.id);
    let chara = await db.getSelected();
    let balance = interaction.options.getNumber("balance");
    let economy = new EconomyAPI(chara._id);

    const CharaSel = await require("../modules/charaSelectMenu")(
      user,
      interaction
    );

    if ((await economy.getPersonalBalance()) >= balance) {
      let message = interaction.editReply({
        content: `Choose the character of the user. Your character, ${chara.name} will pay them ${balance}.`,
        components: menu.selectMenu.options.length >= 1 ? [menu.row] : null,
        fetchReply: true,
      });

      let collector = CharaSel.genCollector(
        message,
        async (chara2, charas, db) => {
          let aimEconomy = new EconomyAPI(chara2._id);
          economy.setPersonalBalance(
            (await economy.getPersonalBalance()) - balance
          );
          aimEconomy.setPersonalBalance(
            balance + (await aimEconomy.getPersonalBalance())
          );

          interaction.followUp(
            `${chara.name} paid ${chara2.name} ${balance} 💰.`
          );
        }
      );
    } else
      interaction.followUp(
        `Your character, ${
          chara.name
        }, don't have enough (they have ${await economy.getPersonalBalance()} 💰)!`
      );
  },
};
