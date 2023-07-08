const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Client,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("place-system")
    .setDescription("Place system of the bot")
    .addSubcommand((sc) =>
      sc
        .setName("channel_ids")
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
            .setName("channel_ids")
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
        .setName("linking")
        .setDescription(
          "Connect roleplaying channels each others with the /place-system linking command."
        )
        .addStringOption((opt) =>
          opt
            .setName("type")
            .setDescription("Type set/add/remove")
            .setChoices(
              { name: "set", value: "set" },
              { name: "add", value: "add" },
              { name: "remove", value: "remove" }
            )
            .setRequired(true)
        )
        .addStringOption((opt) =>
          opt
            .setName("main_id")
            .setDescription(
              "When you are in a channel with that id, you can travel to what you set in the third parameter"
            )
            .setRequired(true)
        )
        .addStringOption((opt) =>
          opt
            .setName("channel_ids")
            .setDescription(
              "Where you can travel to. Channel IDs seperated by comma."
            )
        )
    ),
  /**
   *
   * @param {Client} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    const { GuildAPI } = require("../modules/db");
    const { noPerm } = require("../modules/errors");
    let rp = new GuildAPI(interaction.guildId);
    function parse(str) {
      return str
        .replace(/ +/gi, "")
        .replace(/(\<\#)/gi, "")
        .replace(/\>/gi, "");
    }
    let channel_ids = parse(interaction.options.getString("channel_ids"));
    let type = interaction.options.getString("type");

    if (interaction.options.getSubcommand() === "linking") {
      if (interaction.memberPermissions.has("Administrator")) {
        let main_id = parse(interaction.options.getString("main_id"));
        function noChannelIds() {
          interaction.editReply(
            "Sorry, please provide the ids of the channels to link to the main channel id"
          );
        }

        function success(verb) {
          if (channel_ids) {
            let chs = channel_ids.split(",");
            interaction.editReply(
              `:white_check_mark: Success! The channels ${chs.map(
                (ch) => `<#${ch}>`
              )}  have been ${verb} with the <#${main_id}> channel`
            );
          } else {
            interaction.editReply(
              `:white_check_mark: Success! Everything linked to <#${main_id}> has been deleted`
            );
          }
        }

        if (type === "add") {
          if (channel_ids) {
            rp.linking(type, main_id, channel_ids.split(","));
            success("added");
          } else noChannelIds();
        }

        if (type === "set") {
          if (channel_ids) {
            rp.linking(type, main_id, channel_ids.split(","));
            success("set");
          } else noChannelIds();
        }

        if (type === "remove") {
          rp.linking(
            type,
            main_id,
            channel_ids ? channel_ids.split(",") : undefined
          );
          success("removed");
        }
      } else noPerm(interaction);
    } else if (interaction.options.getSubcommand() === "reset") {
      if (interaction.memberPermissions.has("Administrator")) {
        rp.reset();

        interaction
          .editReply({
            content: "The place system has reset!",
            ephemeral: true,
          })
          .then(() => setTimeout(() => interaction.deleteReply(), 5000));
      } else noPerm(interaction);
    } else if (interaction.options.getSubcommand() === "channels") {
      if (interaction.memberPermissions.has("Administrator")) {
        let ids = interaction.options.getString("channels");
        let type = interaction.options.getString("type");

        if (type === "add") {
          let toAdd = await rp.addChannels(ids);
          interaction
            .editReply({
              content: `Roleplay categories added! ${toAdd.map(
                (id) => `<#${id}>`
              )}`,
              ephemeral: true,
            })
            .then(() => setTimeout(() => interaction.deleteReply(), 5000));
        } else {
          let toDel = await rp.deleteChannels(ids);
          interaction.editReply({
            content: `Roleplay categories removed! ${toDel.map(
              (id) => `<#${id}>`
            )}`,
            ephemeral: true,
          });
        }
      } else noPerm(interaction);
    }
  },
};
