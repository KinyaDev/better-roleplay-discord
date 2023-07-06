const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  CategoryChannel,
  Client,
  StringSelectMenuBuilder,
  ActionRowBuilder,
  ComponentType,
  GuildChannel,
} = require("discord.js");

const { GuildAPI, CharactersAPI, KeyPlaceAPI } = require("../modules/db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("travel")
    .setDescription(
      "Traverse between places with the /place-system travel command."
    ),

  /**
   *
   * @param {Client} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction, db2, langdata) => {
    let rp = new GuildAPI(interaction.guildId);
    let enabled = await rp.isEnabled();
    let db = new CharactersAPI(interaction.member.id);

    if (enabled) {
      /**
       * @type {string[]}
       */
      let channels = await rp.channels();

      function getChildren(id) {
        return interaction.guild.channels.cache.filter(
          (c) => c.parentId === id
        );
      }

      if (channels.includes(interaction.channel.parentId)) {
        let accessibleChannels = await rp.linkeds(interaction.channel.id);
        let accessibleChannels2 = await rp.linkeds(
          interaction.channel.parentId
        );

        let keydb = new KeyPlaceAPI((await db.getSelected())._id);

        let selectmenu = new StringSelectMenuBuilder().setCustomId(
          "place-select"
        );

        async function doTheThing(channel_id) {
          let ch = client.channels.cache.get(channel_id);
          if (ch instanceof GuildChannel) {
            selectmenu.addOptions({ value: ch.name, label: ch.name });
          } else rp.unlink(channel_id);
        }
        for (let a of accessibleChannels) doTheThing(a);
        for (let a of accessibleChannels2) doTheThing(a);

        for (let key of await keydb.all()) doTheThing(key.channel_id);

        if (selectmenu.options.length === 0) {
          interaction.editReply("You can't go anywhere!");
        } else {
          console.log(selectmenu.options.length);
          let res = await interaction.editReply({
            content: "Choose a place to go",
            components: [new ActionRowBuilder().addComponents(selectmenu)],
          });

          const collector = res.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            max: 1,
          });

          collector.on("collect", async (i) => {
            if (i.user.id === interaction.user.id) {
              let name = i.values[0];
              let aim = interaction.guild.channels.cache.find(
                (ch) => ch.name === name
              );
              for (let id of channels) {
                let ch = await interaction.guild.channels.fetch(id);
                if (ch) {
                  if (!ch.parentId)
                    getChildren(ch.id).forEach((c) => {
                      c.permissionOverwrites.edit(interaction.member.id, {
                        ViewChannel: false,
                      });
                    });

                  ch.permissionOverwrites.edit(interaction.member.id, {
                    ViewChannel: false,
                  });
                }
              }

              setTimeout(() => {
                if (!aim.parentId)
                  getChildren(aim.id).forEach((c) => {
                    c.permissionOverwrites.edit(interaction.member.id, {
                      ViewChannel: true,
                    });
                  });

                aim.permissionOverwrites.edit(interaction.member.id, {
                  ViewChannel: true,
                });
              }, 1000);

              interaction.deleteReply();

              db.setLocation(aim.id);
            } else {
              i.reply({
                content: `The select menu isn't for you!`,
                ephemeral: true,
              });
            }
          });
        }
      } else {
        interaction.editReply({
          content: langdata.nochrp,
          ephemeral: true,
        });
      }
    } else {
      interaction.editReply({
        content: langdata["no-rp"],
        ephemeral: true,
      });
    }
  },
};
