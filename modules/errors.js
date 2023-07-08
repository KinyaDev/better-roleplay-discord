module.exports = {
  noChara(interaction) {
    interaction
      .editReply({
        content:
          "Cannot find character. Make sure you created one with `/register`",
        ephemeral: true,
        components: [],
      })
      .then(() => setTimeout(() => interaction.deleteReply(), 5000));
  },
  autoProxy(interaction, verb) {
    interaction
      .editReply({
        content: `Auto-proxy has been ${verb} in this channel.`,
        ephemeral: true,
        components: [],
      })
      .then(() => setTimeout(() => interaction.deleteReply(), 5000));
  },

  set(interaction, thing) {
    interaction
      .editReply({
        content: `The ${thing} of your character has been set!`,
        ephemeral: true,
        files:
          thing === "avatar"
            ? [interaction.options.getAttachment("avatar").url]
            : undefined,
        components: [],
      })
      .then(() => setTimeout(() => interaction.deleteReply(), 5000));
  },
  invalidImg(interaction) {
    interaction
      .editReply("Invalid image url")
      .then(() => setTimeout(() => interaction.deleteReply(), 5000));
  },
  noPerm(interaction) {
    interaction
      .editReply("You don't have the permissions to do this command.")
      .then(() => setTimeout(() => interaction.deleteReply(), 5000));
  },
};
