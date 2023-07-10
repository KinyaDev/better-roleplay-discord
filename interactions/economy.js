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
    .setName("economy")
    .setDescription(
      "Economy system of the server, set balance, pay other's characters, etc."
    )
    .addSubcommand((sc) =>
      sc
        .setName("set-balance")
        .setDescription("Set-balance subcommand")

        .addStringOption((opt) =>
          opt
            .setName("type")
            .setDescription("Type of the balance, bank or personal")
            .setChoices(
              { name: "bank", value: "bank" },
              { name: "personal", value: "personal" }
            )
            .setRequired(true)
        )
        .addNumberOption((opt) =>
          opt
            .setName("balance")
            .setDescription("The balance to set.")
            .setRequired(true)
        )
        .addUserOption((opt) =>
          opt
            .setName("user")
            .setDescription("Mention of the user")
            .setRequired(false)
        )
    )
    .addSubcommand((sc) =>
      sc
        .setName("add-balance")
        .setDescription("Give bank or personal balance to a character.")

        .addStringOption((opt) =>
          opt
            .setName("type")
            .setDescription("Type of the balance, bank or personal")
            .setChoices(
              { name: "bank", value: "bank" },
              { name: "personal", value: "personal" }
            )
            .setRequired(true)
        )
        .addNumberOption((opt) =>
          opt
            .setName("balance")
            .setDescription("The balance to add.")
            .setRequired(true)
        )
        .addUserOption((opt) =>
          opt
            .setName("user")
            .setDescription("Mention of the user")
            .setRequired(false)
        )
    )
    .addSubcommand((sc) =>
      sc
        .setName("remove-balance")
        .setDescription("Remove some bank or personal balance to a character.")

        .addStringOption((opt) =>
          opt
            .setName("type")
            .setDescription("Type of the balance, bank or personal")
            .setChoices(
              { name: "bank", value: "bank" },
              { name: "personal", value: "personal" }
            )
            .setRequired(true)
        )
        .addNumberOption((opt) =>
          opt
            .setName("balance")
            .setDescription("The balance to remove.")
            .setRequired(true)
        )
        .addUserOption((opt) =>
          opt
            .setName("user")
            .setDescription("Mention of the user")
            .setRequired(false)
        )
    ),

  /**
   *
   * @param {Client} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    const { EconomyAPI } = require("../modules/db");

    let user = interaction.options.getMember("user") || interaction.user;
    let type = interaction.options.getString("type");
    let balance = interaction.options.getNumber("balance");

    if (interaction.memberPermissions.has("Administrator")) {
      async function doTheThing(type2, callback) {
        const CharaSel = await require("../modules/charaSelectMenu")(
          user,
          interaction
        );

        let menu = await CharaSel.genMenu();

        let message = await interaction.editReply({
          content: `Select a character to ${type2} the ${type} balance.`,
          components: menu.selectMenu.options.length >= 1 ? [menu.row] : null,
          fetchReply: true,
        });

        let collector = CharaSel.genCollector(
          message,
          async (chara, charas, db) => {
            callback(chara);
          }
        );
      }

      if (interaction.options.getSubcommand() === "set-balance") {
        await doTheThing("set", (chara) => {
          let economy = new EconomyAPI(chara._id);

          if (type === "bank") economy.setBankBalance(balance);
          if (type === "personal") economy.setPersonalBalance(balance);

          interaction.followUp(
            `Done! ${chara.name} (${user.user}) has now ${balance} 💰 in their ${type} balance`
          );
        });
      }

      if (interaction.options.getSubcommand() === "add-balance") {
        await doTheThing("add", async (chara) => {
          let economy = new EconomyAPI(chara._id);
          let newBankBalance = balance + (await economy.getBankBalance());
          let newPersonalBalance =
            balance + (await economy.getPersonalBalance());

          if (type === "bank") economy.setBankBalance(newBankBalance);

          if (type === "personal")
            economy.setPersonalBalance(newPersonalBalance);

          interaction.followUp(
            `Done! ${chara.name} (${user.user}) has now ${
              type === "bank" ? newBankBalance : newPersonalBalance
            } 💰 in their ${type} balance`
          );
        });
      }
      if (interaction.options.getSubcommand() === "remove-balance") {
        await doTheThing("remove", async (chara) => {
          let economy = new EconomyAPI(chara._id);
          let newBankBalance = (await economy.getBankBalance()) - balance;
          let newPersonalBalance =
            (await economy.getPersonalBalance()) - balance;

          if (type === "bank") economy.setBankBalance(newBankBalance);
          if (type === "personal")
            economy.setPersonalBalance(newPersonalBalance);

          interaction.followUp(
            `Done! ${chara.name} (${user.user}) has now ${
              type === "bank" ? newBankBalance : newPersonalBalance
            } 💰 in their ${type} balance`
          );
        });
      }
    }
  },
};
