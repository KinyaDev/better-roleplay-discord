const actionsContainer = document.getElementById("actions");
const setupPlaceBtn = document.getElementById("setupPlaceBtn");
const manageCharactersBtn = document.getElementById("manageCharactersBtn");

async function getGuild(guildid) {
  let response = await fetch(`/api/guilds/${guildid}`);
  return await response.json();
}

function setCookie(name, value, days) {
  var expires = "";
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}
function getCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

function eraseCookie(name) {
  document.cookie = name + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
}
async function setGuild(g) {
  const guildsContainer = document.getElementById("guilds");

  guildsContainer.style.display = "none";
  let guild = await getGuild(g.id);
  if (Object.keys(guild).length === 0 && guild.constructor === Object)
    inviteBot(g.id);
  else {
    actionsContainer.style.display = "block";

    setupPlaceBtn.addEventListener("click", () => {
      const redirectUrl = `/setup-place?guildId=${guild.id}`;
      window.location.assign(redirectUrl);
    });

    manageCharactersBtn.addEventListener("click", () => {
      const redirectUrl = `/characters?guildId=${guild.id}`;
      window.location.assign(redirectUrl);
    });
  }
}

function inviteBot(guildId) {
  window.location.replace(
    `https://discord.com/api/oauth2/authorize?client_id=1110594506220388352&permissions=536881168&redirect_uri=https%3A%2F%2Fbetter-roleplay.swameta.fr&response_type=token&scope=guilds.join%20bot&guild_id=${guildId}`
  );
}

const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
});

async function getCharas(userId) {
  try {
    let response = await fetch(`/api/charas/${userId}`);
    let json = await response.json();

    return json.charas;
  } catch (e) {
    console.error(error);
    return [];
  }
}
