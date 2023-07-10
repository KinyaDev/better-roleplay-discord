const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Client,
  StringSelectMenuBuilder,
  BaseGuildTextChannel,
  ActionRowBuilder,
  ComponentType,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("key")
    .setDescription(
      "Give access to special channels to a specific character's user"
    )
    .addSubcommand((sc) =>
      sc
        .setName("give")
        .setDescription("Give subcommand")
        .addUserOption((opt) =>
          opt
            .setName("user")
            .setDescription("Mention of the user")
            .setRequired(true)
        )
        .addChannelOption((opt) =>
          opt
            .setName("channel")
            .setDescription("Mention of the text channel")
            .setRequired(true)
        )
    )
    .addSubcommand((sc) =>
      sc
        .setName("remove")
        .setDescription("Remove subcommand")
        .addUserOption((opt) =>
          opt
            .setName("user")
            .setDescription("Mention of the user")
            .setRequired(true)
        )
        .addChannelOption((opt) =>
          opt
            .setName("channel")
            .setDescription("Mention of the text channel")
            .setRequired(true)
        )
    ),

  /**
   *
   * @param {Client} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction, d, langdata) => {
    const { KeyPlaceAPI, CharactersAPI } = require("../modules/db");

    async function remove() {
      let user = interaction.options.getUser("user");
      let channel = interaction.options.getChannel("channel");

      const CharaSel = await require("../modules/charaSelectMenu")(
        user,
        interaction
      );

      let menu = await CharaSel.genMenu();

      let message = await interaction.editReply({
        content: `Choose the character of the user. Their character will get the key for ${channel}`,
        components: menu.selectMenu.options.length >= 1 ? [menu.row] : null,
        fetchReply: true,
      });

      let collector = CharaSel.genCollector(
        message,
        async (chara, charas, db) => {
          let keydb = new KeyPlaceAPI(chara._id);
          await keydb.remove(channel.id);

          interaction.editReply({
            content: `${chara.name} (${user}) got the key for ${channel}.`,
            components: [],
          });

          channel.send({
            content: `${chara.name} (${user}) got the key for ${channel}.`,
          });
        }
      );
    }

    async function give() {
      let user = interaction.options.getUser("user");
      let channel = interaction.options.getChannel("channel");

      const CharaSel = await require("../modules/charaSelectMenu")(
        user,
        interaction
      );

      let menu = await CharaSel.genMenu();

      let message = await interaction.editReply({
        content: `Choose the character of the user. Their character will get the key for ${channel}`,
        components: menu.selectMenu.options.length >= 1 ? [menu.row] : null,
        fetchReply: true,
      });

      let collector = CharaSel.genCollector(
        message,
        async (chara, charas, db) => {
          let keydb = new KeyPlaceAPI(chara._id);
          await keydb.give(channel.id);

          interaction.editReply({
            content: `${chara.name} (${user}) got the key for ${channel}.`,
            components: [],
          });

          channel.send({
            content: `${chara.name} (${user}) got the key for ${channel}.`,
          });
        }
      );
    }

    let channel = interaction.options.getChannel("channel");

    let db = new CharactersAPI(interaction.user.id);
    let keydb = new KeyPlaceAPI((await db.getSelected())._id);

    if (interaction.options.getSubcommand() === "give") {
      if (
        (await keydb.get(channel.id)) ||
        interaction.memberPermissions.has("Administrator")
      )
        give();
    } else if (interaction.options.getSubcommand() === "remove") {
      if (
        (await keydb.get(channel.id)) ||
        interaction.memberPermissions.has("Administrator")
      )
        remove();
    }
  },
};
