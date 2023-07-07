const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Client,
  StringSelectMenuBuilder,
  BaseGuildTextChannel,
  ActionRowBuilder,
  ComponentType,
} = require("discord.js");
const { KeyPlaceAPI, CharactersAPI, EconomyAPI } = require("../modules/db");
const { ObjectId } = require("mongodb");

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
  run: async (client, interaction, d, langdata) => {
    let user = interaction.options.getMember("user") || interaction.member;
    let db = new CharactersAPI(user.id);
    let charas = await db.getCharas();
    let type = interaction.options.getString("type");
    let balance = interaction.options.getNumber("balance");

    if (interaction.memberPermissions.has("Administrator")) {
      async function doTheThing(type2, callback) {
        let selectmenu = new StringSelectMenuBuilder().setCustomId(
          "economyset"
        );

        for (let chara of charas) {
          selectmenu.addOptions({
            label: chara.name,
            value: chara._id.toString(),
          });
        }

        if (selectmenu.options.length !== 0) {
          let message = await interaction.editReply({
            content: `Their ${type} balance will be ${type2} to ${balance} after selecting the character of the user.`,
            components: [new ActionRowBuilder().addComponents(selectmenu)],
          });

          const collector = message.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            max: 1,
          });

          collector.on("collect", async (i) => {
            if (i.user.id === interaction.user.id) {
              for (let chara of await db.getCharas()) {
                let _id = new ObjectId(i.values[0]);
                if (chara._id.equals(_id)) {
                  await callback(chara);
                  setTimeout(() => interaction.deleteReply(), 5000);

                  break;
                }
              }
            }
          });
        } else {
          interaction.editReply({
            content: langdata["no-chara"],
            ephemeral: true,
          });
        }
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
        await doTheThing("added", async (chara) => {
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
        await doTheThing("removed", async (chara) => {
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
