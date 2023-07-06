const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Client,
  StringSelectMenuBuilder,
  BaseGuildTextChannel,
  ActionRowBuilder,
  ComponentType,
} = require("discord.js");
const { KeyPlaceAPI, CharactersAPI } = require("../modules/db");
const { ObjectId } = require("mongodb");

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
    async function remove() {
      let user = interaction.options.getUser("user");
      let db = new CharactersAPI(user.id);
      let charas = await db.getCharas();
      let channel = interaction.options.getChannel("channel");

      let selectmenu = new StringSelectMenuBuilder().setCustomId(
        "keyloose-select"
      );

      for (let chara of charas) {
        selectmenu.addOptions({
          label: chara.name,
          value: chara._id.toString(),
        });
      }

      if (selectmenu.options.length !== 0) {
        if (channel instanceof BaseGuildTextChannel) {
          let message = await interaction.editReply({
            content: `Choose the character of the user. Their character will loose access to ${channel}`,
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
                  let keydb = new KeyPlaceAPI(chara._id);
                  await keydb.remove(channel.id);

                  interaction.editReply({
                    content: `${chara.name} (${user}) lose access ${channel}.`,
                    components: [],
                  });

                  channel.send({
                    content: `${chara.name} (${user}) lose access to ${channel}.`,
                  });

                  console.log(await KeyPlaceAPI.all());

                  break;
                }
              }
            }
          });
        }
      } else {
        interaction.editReply({
          content: langdata["no-chara"],
          ephemeral: true,
        });
      }
    }

    async function give() {
      let user = interaction.options.getUser("user");
      let db = new CharactersAPI(user.id);
      let charas = await db.getCharas();
      let channel = interaction.options.getChannel("channel");

      let selectmenu = new StringSelectMenuBuilder().setCustomId(
        "keygive-select"
      );

      for (let chara of charas) {
        selectmenu.addOptions({
          label: chara.name,
          value: chara._id.toString(),
        });
      }

      if (selectmenu.options.length !== 0) {
        if (channel instanceof BaseGuildTextChannel) {
          let message = await interaction.editReply({
            content: `Choose the character of the user. Their character will have access to ${channel}`,
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
                  let keydb = new KeyPlaceAPI(chara._id);
                  await keydb.give(channel.id);

                  interaction.editReply({
                    content: `${chara.name} (${user}) got the key for ${channel}.`,
                    components: [],
                  });

                  channel.send({
                    content: `${chara.name} (${user}) got the key for ${channel}.`,
                  });

                  break;
                }
              }
            }
          });
        }
      } else {
        interaction.editReply({
          content: langdata["no-chara"],
          ephemeral: true,
        });
      }
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
