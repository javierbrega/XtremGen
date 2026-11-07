#!/usr/bin/env node
/**
 * XtremGen (XG) - Native Zero-Dependency Discord MCP Server (Stdio)
 * Connects Antigravity directly to Discord API v10 (Bot: Argon XG / Server: XtremeGen HQ)
 */

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const DEFAULT_GUILD_ID = "1568588113188495370";   // XtremeGen HQ
const DEFAULT_CHANNEL_ID = "1568588114396712982"; // #general

async function discordRequest(endpoint, options = {}) {
  const res = await fetch(`https://discord.com/api/v10${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bot ${TOKEN}`,
      "Content-Type": "application/json",
      "User-Agent": "XtremGenMCP (https://github.com/javierbrega/XtremGen, 1.0)",
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Discord API ${res.status}: ${errText}`);
  }
  return res.json();
}

const TOOLS = [
  {
    name: "discord_send_message",
    description: "Envía un mensaje o embed de estado al servidor de Discord XtremeGen HQ (por defecto a #general).",
    inputSchema: {
      type: "object",
      properties: {
        channel_id: {
          type: "string",
          description: "ID del canal de Discord (por defecto #general: 1568588114396712982)",
        },
        content: {
          type: "string",
          description: "Texto principal del mensaje a enviar",
        },
        embed_title: {
          type: "string",
          description: "Título opcional para tarjeta Embed estilo XtremGen",
        },
        embed_description: {
          type: "string",
          description: "Descripción opcional para tarjeta Embed",
        },
      },
      required: ["content"],
    },
  },
  {
    name: "discord_list_channels",
    description: "Lista todos los canales de texto del servidor XtremeGen HQ.",
    inputSchema: {
      type: "object",
      properties: {
        guild_id: {
          type: "string",
          description: "ID del servidor (por defecto XtremeGen HQ: 1568588113188495370)",
        },
      },
    },
  },
  {
    name: "discord_read_messages",
    description: "Lee los últimos mensajes de un canal de XtremeGen HQ.",
    inputSchema: {
      type: "object",
      properties: {
        channel_id: {
          type: "string",
          description: "ID del canal (por defecto #general: 1568588114396712982)",
        },
        limit: {
          type: "number",
          description: "Cantidad de mensajes a recuperar (1-50, por defecto 10)",
        },
      },
    },
  },
];

async function handleRequest(msg) {
  const { id, method, params } = msg;

  try {
    if (method === "initialize") {
      return {
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: "2024-11-05",
          capabilities: { tools: {} },
          serverInfo: { name: "xtremgen-discord-mcp", version: "1.0.0" },
        },
      };
    }

    if (method === "notifications/initialized") {
      return null;
    }

    if (method === "tools/list") {
      return { jsonrpc: "2.0", id, result: { tools: TOOLS } };
    }

    if (method === "tools/call") {
      const { name, arguments: args = {} } = params;

      if (name === "discord_send_message") {
        const channelId = args.channel_id || DEFAULT_CHANNEL_ID;
        const body = { content: args.content };
        if (args.embed_title || args.embed_description) {
          body.embeds = [
            {
              title: args.embed_title || "⚡ XTREMGEN // XG",
              description: args.embed_description || "",
              color: 16765440, // #FFD200
            },
          ];
        }
        const data = await discordRequest(`/channels/${channelId}/messages`, {
          method: "POST",
          body: JSON.stringify(body),
        });
        return {
          jsonrpc: "2.0",
          id,
          result: {
            content: [{ type: "text", text: JSON.stringify({ id: data.id, channel_id: data.channel_id, timestamp: data.timestamp }, null, 2) }],
          },
        };
      }

      if (name === "discord_list_channels") {
        const guildId = args.guild_id || DEFAULT_GUILD_ID;
        const channels = await discordRequest(`/guilds/${guildId}/channels`);
        const summary = channels.map((c) => ({ id: c.id, name: c.name, type: c.type }));
        return {
          jsonrpc: "2.0",
          id,
          result: { content: [{ type: "text", text: JSON.stringify(summary, null, 2) }] },
        };
      }

      if (name === "discord_read_messages") {
        const channelId = args.channel_id || DEFAULT_CHANNEL_ID;
        const limit = Math.min(Math.max(args.limit || 10, 1), 50);
        const messages = await discordRequest(`/channels/${channelId}/messages?limit=${limit}`);
        const summary = messages.map((m) => ({
          id: m.id,
          author: m.author?.username,
          content: m.content,
          timestamp: m.timestamp,
        }));
        return {
          jsonrpc: "2.0",
          id,
          result: { content: [{ type: "text", text: JSON.stringify(summary, null, 2) }] },
        };
      }

      throw new Error(`Herramienta desconocida: ${name}`);
    }

    if (id !== undefined) {
      return { jsonrpc: "2.0", id, result: {} };
    }
    return null;
  } catch (err) {
    if (id !== undefined) {
      return {
        jsonrpc: "2.0",
        id,
        error: { code: -32000, message: err.message || String(err) },
      };
    }
    return null;
  }
}

let buffer = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", async (chunk) => {
  buffer += chunk;
  const lines = buffer.split("\n");
  buffer = lines.pop() || "";
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const msg = JSON.parse(trimmed);
      const res = await handleRequest(msg);
      if (res) {
        process.stdout.write(JSON.stringify(res) + "\n");
      }
    } catch {
      // Ignore malformed lines
    }
  }
});
