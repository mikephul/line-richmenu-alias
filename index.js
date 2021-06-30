const axios = require("axios");
const fs = require("fs/promises");
const line = require("@line/bot-sdk");

const channelAccessToken = process.env.TOKEN;

const config = { channelAccessToken };

const lineClient = new line.Client(config);

/**
 * Rich Menu Templates
 */
const getRichMenuAction = (aliasId) => ({
  type: "richmenuswitch",
  richMenuAliasId: `richmenu-alias-${aliasId}`,
  data: `richmenu=${aliasId}`,
});

const mainTemplate = (text) => ({
  size: {
    width: 2500,
    height: 1686,
  },
  selected: true,
  name: "Main",
  chatBarText: text,
  areas: [
    {
      bounds: {
        x: 0,
        y: 0,
        width: 2500,
        height: 1686,
      },
      action: getRichMenuAction("default"),
    },
  ],
});

const colorTemplate = (text) => ({
  size: {
    width: 2500,
    height: 1686,
  },
  selected: true,
  name: "Color",
  chatBarText: text,
  areas: [
    {
      bounds: {
        x: 87,
        y: 29,
        width: 416,
        height: 259,
      },
      action: getRichMenuAction("main"),
    },
    {
      bounds: {
        x: 169,
        y: 400,
        width: 268,
        height: 264,
      },
      action: getRichMenuAction("blue"),
    },
    {
      bounds: {
        x: 454,
        y: 396,
        width: 276,
        height: 272,
      },
      action: getRichMenuAction("yellow"),
    },
    {
      bounds: {
        x: 169,
        y: 734,
        width: 264,
        height: 264,
      },
      action: getRichMenuAction("green"),
    },
    {
      bounds: {
        x: 458,
        y: 734,
        width: 268,
        height: 260,
      },
      action: getRichMenuAction("orange"),
    },
    {
      bounds: {
        x: 161,
        y: 1048,
        width: 272,
        height: 280,
      },
      action: getRichMenuAction("pink"),
    },
    {
      bounds: {
        x: 462,
        y: 1044,
        width: 272,
        height: 284,
      },
      action: getRichMenuAction("purple"),
    },
    {
      bounds: {
        x: 276,
        y: 1349,
        width: 347,
        height: 260,
      },
      action: getRichMenuAction("default"),
    },
  ],
});

/**
 * Rich Menu Alias Functions
 */
const createRichMenuAlias = async (richMenuId, richMenuAliasId) => {
  const { data } = await axios({
    method: "post",
    url: "https://api.line.me/v2/bot/richmenu/alias",
    headers: {
      Authorization: `Bearer ${config.channelAccessToken}`,
      "Content-Type": "application/json",
    },
    data: { richMenuId, richMenuAliasId },
  });
  return data;
};

const getAllRichMenuAlias = async () => {
  const { data } = await axios({
    method: "get",
    url: "https://api.line.me/v2/bot/richmenu/alias/list",
    headers: {
      Authorization: `Bearer ${config.channelAccessToken}`,
    },
  });
  return data.aliases;
};

const deleteRichMenuAlias = async (richMenuAliasId) => {
  const { data } = await axios({
    method: "delete",
    url: `https://api.line.me/v2/bot/richmenu/alias/${richMenuAliasId}`,
    headers: {
      Authorization: `Bearer ${config.channelAccessToken}`,
    },
  });
  return data;
};

const deleteAllRichMenuAlias = async () => {
  const aliases = await getAllRichMenuAlias();
  await Promise.all(
    aliases.map(
      async (alias) => await deleteRichMenuAlias(alias.richMenuAliasId)
    )
  );
};

/**
 * Main
 */
const run = async () => {
  // Clear all exisint alias
  await deleteAllRichMenuAlias();

  // Set up main rich menu
  const richMenuId = await lineClient.createRichMenu(mainTemplate("iMac"));
  const image = await fs.readFile(`./images/main.png`);
  await lineClient.setRichMenuImage(richMenuId, image);
  await createRichMenuAlias(richMenuId, `richmenu-alias-main`);
  await lineClient.setDefaultRichMenu(richMenuId);
  console.log("main at", richMenuId);

  // Set up color selector rich menu
  const colors = [
    "default",
    "blue",
    "green",
    "pink",
    "yellow",
    "orange",
    "purple",
  ];
  const richMenuIds = await Promise.all(
    colors.map(async (color) => {
      const richMenuId = await lineClient.createRichMenu(colorTemplate(color));
      const image = await fs.readFile(`./images/${color}.png`);
      await lineClient.setRichMenuImage(richMenuId, image);
      await createRichMenuAlias(richMenuId, `richmenu-alias-${color}`);
      return { color, richMenuId };
    })
  );
  console.log("colors at ");
  console.log(richMenuIds);
};

run();
