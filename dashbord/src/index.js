if (window.location.href.includes("/#")) {
  window.location.replace(window.location.href.replace("/#", "?"));
}

let accessToken = getCookie("token");
const container = document.getElementById("container");
const loginButton = document.getElementById("login");
const guildsContainer = document.getElementById("guilds");
const guildList = document.getElementById("guildList");

if (!accessToken) {
  loginButton.style.display = "block";
} else {
  fetch("https://discord.com/api/users/@me", {
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  })
    .then((result) => {
      if (result.status === 401) {
        setCookie("token", "");
        window.location.assign("/");
      } else return result.json();
    })
    .then(async (response) => {
      const { username } = response;
      document.querySelector(
        "#header > h1"
      ).innerText = `Welcome, ${username}!`;

      fetch("https://discord.com/api/users/@me/guilds", {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      })
        .then(async (result) => result.json())
        .then(async (guilds) => {
          guilds = guilds.filter((g) => g.owner);
          if (guilds.length > 0) {
            guildsContainer.style.display = "block";

            guilds.forEach(async (guild) => {
              const guildCard = document.createElement("div");
              guildCard.classList.add("guild-card");
              guildCard.addEventListener("click", async () => {
                await setGuild(guild);
              });

              const guildIcon = document.createElement("img");
              guildIcon.src = `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`;
              guildCard.appendChild(guildIcon);

              const guildName = document.createElement("h3");
              guildName.innerText = guild.name;
              guildCard.appendChild(guildName);

              guildList.appendChild(guildCard);
            });
          }
        })
        .catch(console.error);
    })
    .catch(console.error);
}
