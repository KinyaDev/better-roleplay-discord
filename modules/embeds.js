const {
  EmbedBuilder,
  Client,
  ActionRowBuilder,
  ButtonBuilder,
  ChatInputCommandInteraction,
  ButtonStyle,
  Message,
  StringSelectMenuBuilder,
} = require("discord.js");
const { CharactersAPI, EconomyAPI } = require("./db");

async function CharaEmbed(chara, member, client) {
  if (chara) {
    let db = new CharactersAPI(member.id);
    let economy = new EconomyAPI(chara._id);

    let statsToAppend = "";

    let stats = await db.getStats(chara._id);

    stats.forEach((s, i) => {
      if (i === 0) {
        statsToAppend += "__Stats__:\n";
      }
      statsToAppend += ` **${s.name}**: ${s.value}\n`;
    });

    let emb = new EmbedBuilder()
      .setAuthor({
        name: member.username,
        iconURL: member.displayAvatarURL(),
      })
      .setTitle(chara.name)
      .setDescription(`${chara.bio || ""}\n\n${statsToAppend}`)
      .setThumbnail(chara.avatar || member.displayAvatarURL());

    if (chara.species) {
      emb.addFields({ name: "🐱 Species", value: chara.species, inline: true });
    } else emb.addFields({ name: "🐱 Species", value: "Human", inline: true });

    if (chara.location) {
      let ch = client.channels.cache.get(chara.location);
      if (ch)
        emb.addFields({ name: "🗺️ Location", value: ch.name, inline: true });
    } else
      emb.addFields({ name: "🗺️ Location", value: "Nowhere", inline: true });

    if (await economy.getPersonalBalance()) {
      emb.addFields({
        name: "💰 Personal Balance",
        value: (await economy.getPersonalBalance()).toString(),
      });
    }

    if (await economy.getBankBalance()) {
      emb.addFields({
        name: "💰 Bank Balance",
        value: (await economy.getBankBalance()).toString(),
        inline: true,
      });
    }

    return emb.toJSON();
  }
}

/**
 *
 * @param {ChatInputCommandInteraction} interaction
 */
async function helpCommand(interaction) {
  let categories = [
    {
      name: "👤 Character Management",
      commands: [
        {
          name: "`characters`",
          description: "View all your characters and their details.",
        },
        {
          name: "`register`",
          description: "Create a new character and start shaping their story.",
        },
        {
          name: "`unregister`",
          description: "Remove a character from your roster.",
        },
      ],
    },
    {
      name: "🎨 Character Customization",
      commands: [
        {
          name: "`avatar`",
          description: "Set your character's avatar.",
        },
        {
          name: "`species`",
          description: "Define your character's species and identity.",
        },
        {
          name: "`bio`",
          description:
            "Craft a captivating backstory or description for your character.",
        },
        {
          name: "`species`",
          description: "Define your character's species and identity.",
        },
        {
          name: "`stats-set`",
          description: "Define custom stats for your character.",
        },
        {
          name: "`stats-del`",
          description:
            "Remove unwanted or outdated stats from your character's profile.",
        },
      ],
    },
    {
      name: "🗺️ Place System",
      commands: [
        {
          name: "`place-system channels`",
          description: "Set up specific channels for roleplaying locations.",
        },
        {
          name: "`place-system linking`",
          description:
            "Connect or disconnect a roleplaying channel to others in your place system.",
        },
        {
          name: "`place-system reset`",
          description: "Reset the place system and clear all location data.",
        },
        {
          name: "`travel`",
          description:
            "Traverse between different places within your roleplaying world.",
        },
      ],
    },
    {
      name: "💰 Economy",
      commands: [
        {
          name: "`pay`",
          description: "Pay other characters.",
        },
        {
          name: "`economy set-balance`",
          description: "Set the bank or personal balance of a member.",
        },
        {
          name: "`economy add-balance`",
          description: "Add to the bank or personal balance of a member.",
        },
        {
          name: "`economy remove-balance`",
          description: "Remove from the bank or personal balance of a member.",
        },
      ],
    },
    {
      name: "💬 Character Proxying",
      commands: [
        {
          name: "`auto-proxy`",
          description: "Enable or disable auto-proxy in any channel.",
        },
        {
          name: "`say`",
          description: "Make your character say a message.",
        },
      ],
    },
    {
      name: "🔑 Exclusive RP Access",
      commands: [
        {
          name: "`key give`",
          description:
            "Give access to a specific RP channel for a user/character.",
        },
        {
          name: "`key remove`",
          description:
            "Remove access to a specific RP channel for a user/character.",
        },
      ],
    },
  ];

  const mainEmbed = new EmbedBuilder()
    .setThumbnail(interaction.client.user.displayAvatarURL())
    .setColor("#0099ff")
    .setTitle("Better Roleplay Help")
    .setDescription(
      "Better Roleplay works with slash commands, the most of command needs to have a character registered. Use the select menu to see the description of specific commands"
    );

  const categoryOptions = categories.map((category, index) => {
    const commandsText = category.commands
      .map((command) => `\`${command.name}\``)
      .join(" ");
    return {
      label: category.name,
      value: `category_${index}`,
      description: commandsText,
    };
  });

  for (let cat of categoryOptions) {
    mainEmbed.addFields({
      name: cat.label,
      value: cat.description,
      inline: true,
    });
  }

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setStyle(ButtonStyle.Link)
      .setLabel("Invite Me")
      .setURL(
        "https://discord.com/oauth2/authorize?client_id=1110594506220388352&permissions=536898640&scope=bot"
      ),
    new ButtonBuilder()
      .setStyle(ButtonStyle.Link)
      .setLabel("Support Server (W.I.P)")
      .setURL("https://discord.gg/"),
    new ButtonBuilder()
      .setStyle(ButtonStyle.Link)
      .setLabel("Vote for Us")
      .setURL("https://top.gg/bot/1110594506220388352/vote"),
    new ButtonBuilder()
      .setStyle(ButtonStyle.Link)
      .setLabel("Website (W.I.P)")
      .setURL("https://better-roleplay.swameta.fr"),
    new ButtonBuilder()
      .setStyle(ButtonStyle.Primary)
      .setCustomId("ask")
      .setLabel("Ask")
      .setStyle(ButtonStyle.Primary)
  );

  const categorySelectMenu = new StringSelectMenuBuilder()
    .setCustomId("help_command")
    .setPlaceholder("Select a command")
    .addOptions({ label: "Main page", value: "main" });

  for (let cat of categories) {
    for (let cmd of cat.commands) {
      if (
        !categorySelectMenu.options.find(
          (v) => v.data.value === `${cat.name}.${cmd.name.replace(/\`/g, "")}`
        )
      ) {
        categorySelectMenu.addOptions({
          label: `${cat.name} - ${cmd.name.replace(/\`/g, "")}`,
          value: `${cat.name}.${cmd.name.replace(/\`/g, "")}`,
          description: `${cmd.description}`,
        });
      }
    }
  }

  let params = {
    embeds: [
      mainEmbed,
      {
        title: "F.A.Q",
        description: "There are no frequently asked questions. Ask now!",
        footer: { text: "Created by KinyaDev" },
      },
    ],
    components: [
      buttons,
      new ActionRowBuilder().addComponents(categorySelectMenu),
    ],
  };

  function createCommandEmbed(v) {
    let a = v.split(".");

    let cat = categories.find((c) => c.name === a[0]);
    let cmd = cat.commands.find((c) => c.name.replace(/\`/g, "") === a[1]);

    let emb = new EmbedBuilder()
      .setThumbnail(interaction.client.user.displayAvatarURL())
      .setTitle(`Command Info`)
      .setDescription(cmd.description)
      .setFields({
        name: "Category Name",
        value: cat.name,
      })
      .setFields({
        name: "Command",
        value: `/${cmd.name}`,
      });

    let usageEmb = new EmbedBuilder()
      .setTitle(`Command Usage`)
      .setDescription(`No Usage Example for the moment`);

    if (cmd.usage) {
      usageEmb.setDescription(cmd.usage);
    }

    return { emb, usageEmb };
  }

  /**
   *
   * @param {Message} msg
   * @param {(value:string)=>void} callback
   */
  let createCollector = (msg) => {
    let collector = msg.createMessageComponentCollector({
      filter: (i) => i.user.id === interaction.user.id,
    });

    collector.on("collect", async (i) => {
      if (i.customId === "help_command") {
        let value = i.values[0];
        if (value === "main") {
          if (interaction instanceof ChatInputCommandInteraction)
            await interaction.editReply(params);
          else await interaction.reply(params);
        } else {
          let cmdEmb = createCommandEmbed(value);

          msg.edit({
            embeds: [cmdEmb.emb, cmdEmb.usageEmb],
            components: [
              new ActionRowBuilder().addComponents(categorySelectMenu),
            ],
          });
        }
      }
    });
  };
  if (interaction instanceof ChatInputCommandInteraction)
    createCollector(await interaction.editReply(params));
  else createCollector(await interaction.reply(params));
}

module.exports = {
  helpCommand,
  CharaEmbed,
};
