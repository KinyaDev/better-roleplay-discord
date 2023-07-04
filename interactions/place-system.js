const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  CategoryChannel,
  Client,
  StringSelectMenuBuilder,
  ActionRowBuilder,
  ComponentType,
} = require("discord.js");

const { guild, GuildAPI, CharactersAPI } = require("../modules/db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("place-system")
    .setDescription("Place system of the bot")
    .addSubcommand((sc) =>
      sc
        .setName("enable")
        .setDescription(
          "Customize place system with the /place-system enable/disable command."
        )
    )
    .addSubcommand((sc) =>
      sc
        .setName("channels")
        .setDescription(
          " Set roleplaying location channels with the /place-system channels [add/delete] command."
        )
        .addStringOption((opt) =>
          opt
            .setName("type")
            .setDescription("Add or Delete a channel")
            .setChoices(
              { name: "add", value: "add" },
              { name: "delete", value: "delete" }
            )
            .setRequired(true)
        )
        .addStringOption((opt) =>
          opt
            .setName("channels")
            .setDescription(
              "Category IDs to be marked as roleplay places, seperated by comma."
            )
            .setRequired(true)
        )
    )
    .addSubcommand((sc) =>
      sc
        .setName("reset")
        .setDescription(
          "Reset place system with the /place-system reset command."
        )
    )
    .addSubcommand((sc) =>
      sc
        .setName("link")
        .setDescription(
          "Connect roleplaying channels with the /place-system link command."
        )
        .addStringOption((opt) =>
          opt
            .setName("id")
            .setDescription("Category ID to link to others")
            .setRequired(true)
        )
        .addStringOption((opt) =>
          opt
            .setName("ids")
            .setDescription(
              "Category IDs seperated by comma to link with the later."
            )
            .setRequired(true)
        )
    )
    .addSubcommand((sc) =>
      sc
        .setName("unlink")
        .setDescription(
          "Disconnect roleplaying channels with the /place-system unlink command."
        )
        .addStringOption((opt) =>
          opt.setName("id").setDescription("Category ID").setRequired(true)
        )
    ),
  /**
   *
   * @param {Client} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction, db, langdata) => {
    if (interaction.isChatInputCommand()) {
      let rp = new GuildAPI(interaction.guildId);
      let enabled = await rp.isEnabled();
      let db = new CharactersAPI(interaction.member.id);

      if (interaction.options.getSubcommand() === "link") {
        if (interaction.memberPermissions.has("Administrator")) {
          if (enabled) {
            let id1 = interaction.options.getString("id");
            let ids1 = interaction.options.getString("ids");

            if (ids1) {
              interaction.editReply({
                content: langdata.link.replace("$", `<#${id1}>`).replace(
                  "$1",
                  ids1
                    .split(",")
                    .map((m) => `<#${m}>`)
                    .join(", ")
                ),
                ephemeral: true,
              });
            } else {
              interaction.editReply({
                content: langdata.unlink.replace("$", "<#" + id1 + ">!"),
                ephemeral: true,
              });
            }

            rp.link(id1, ids1);
          } else {
            interaction.editReply({
              content: langdata["no-rp"],
              ephemeral: true,
            });
          }
        } else {
          interaction.editReply({
            content: langdata["no-perm"],
            ephemeral: true,
          });
        }
      } else if (interaction.options.getSubcommand() === "unlink") {
        if (interaction.memberPermissions.has("Administrator")) {
          if (enabled) {
            let id = interaction.options.getString("id");

            interaction.editReply({
              content: "Unlinked <#" + id + ">",
              ephemeral: true,
            });

            rp.unlink(id);
          } else {
            interaction.editReply({
              content: langdata["no-rp"],
              ephemeral: true,
            });
          }
        } else {
          interaction.editReply({
            content: langdata["no-perm"],
            ephemeral: true,
          });
        }
      } else if (interaction.options.getSubcommand() === "reset") {
        if (interaction.memberPermissions.has("Administrator")) {
          rp.reset();

          interaction.editReply({
            content: "The place system has reset!",
            ephemeral: true,
          });
        } else {
          interaction.editReply({
            content: langdata["no-perm"],
            ephemeral: true,
          });
        }
      } else if (interaction.options.getSubcommand() === "channels") {
        if (enabled) {
          if (interaction.memberPermissions.has("Administrator")) {
            let ids = interaction.options.getString("channels");
            let type = interaction.options.getString("type");

            if (type === "add") {
              let toAdd = await rp.addChannels(ids);
              interaction.editReply({
                content: `Roleplay categories added! ${toAdd.map(
                  (id) => `<#${id}>`
                )}`,
                ephemeral: true,
              });
            } else {
              let toDel = await rp.deleteChannels(ids);
              interaction.editReply({
                content: `Roleplay categories removed! ${toDel.map(
                  (id) => `<#${id}>`
                )}`,
                ephemeral: true,
              });
            }
          } else {
            interaction.editReply({
              content: langdata["no-perm"],
              ephemeral: true,
            });
          }
        }
      } else {
        if (interaction.memberPermissions.has("Administrator")) {
          rp.enable(!enabled);

          interaction.editReply({
            content: !enabled ? langdata.rpena : langdata.rpdisa,
            ephemeral: true,
          });
        } else {
          interaction.editReply({
            content: langdata["no-perm"],
            ephemeral: true,
          });
        }
      }
    }
  },
};
