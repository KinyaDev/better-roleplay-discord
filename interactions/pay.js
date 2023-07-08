const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Client,
  StringSelectMenuBuilder,
  ActionRowBuilder,
  ComponentType,
} = require("discord.js");

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
    const { ObjectId } = require("mongodb");
    const { noChara } = require("../modules/errors");

    let user = interaction.options.getUser("user");
    let db = new CharactersAPI(user.id);
    let charas = await db.getCharas();
    let chara = await db.getSelected();
    let balance = interaction.options.getNumber("balance");
    let economy = new EconomyAPI(chara._id);

    if ((await economy.getBankBalance()) >= balance) {
      let selectmenu = new StringSelectMenuBuilder().setCustomId(
        "pay-selectmenu"
      );

      for (let chara of charas) {
        selectmenu.addOptions({
          label: chara.name,
          value: chara._id.toString(),
        });
      }

      if (chara && selectmenu.options.length !== 0) {
        let message = await interaction.editReply({
          content: `Choose the character of the user. Your character, ${chara.name} will pay them ${balance}.`,
          components: [new ActionRowBuilder().addComponents(selectmenu)],
        });

        const collector = message.createMessageComponentCollector({
          componentType: ComponentType.StringSelect,
          max: 1,
        });

        collector.on("collect", async (i) => {
          if (i.user.id === interaction.user.id) {
            for (let chara2 of await db.getCharas()) {
              let _id = new ObjectId(i.values[0]);
              if (chara2._id.equals(_id)) {
                let aimEconomy = new EconomyAPI(chara2._id);
                economy.setPersonalBalance(
                  (await economy.getPersonalBalance()) - balance
                );
                aimEconomy.setBankBalance(
                  balance + (await aimEconomy.getPersonalBalance())
                );

                interaction.followUp(
                  `${chara.name} paid ${chara.name} ${balance} 💰.`
                );
                break;
              }
            }
          }
        });
      } else noChara(interaction);
    } else {
      interaction.followUp(
        `Your character, ${
          chara.name
        }, don't have enough (they have ${await economy.getPersonalBalance()} 💰)!`
      );
    }
  },
};
