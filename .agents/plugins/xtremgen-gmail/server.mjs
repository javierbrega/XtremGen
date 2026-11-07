#!/usr/bin/env node
/**
 * XtremGen (XG) - Native Zero-Dependency Gmail MCP Server (IMAP + SMTP over TLS)
 */
import tls from "node:tls";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function getCredentials() {
  try {
    const cfgPath = path.join(__dirname, "mcp_config.json");
    const cfg = JSON.parse(fs.readFileSync(cfgPath, "utf8"));
    const env = cfg?.mcpServers?.gmail?.env || {};
    return {
      user: env.GMAIL_USER || process.env.GMAIL_USER || "javierbrega@gmail.com",
      pass: (env.GMAIL_APP_PASSWORD || process.env.GMAIL_APP_PASSWORD || "").replace(/\s+/g, ""),
    };
  } catch {
    return {
      user: process.env.GMAIL_USER || "javierbrega@gmail.com",
      pass: (process.env.GMAIL_APP_PASSWORD || "").replace(/\s+/g, ""),
    };
  }
}

function sendSmtpEmail({ to, subject, body }) {
  const { user: GMAIL_USER, pass: GMAIL_PASS } = getCredentials();
  return new Promise((resolve, reject) => {
    const socket = tls.connect(465, "smtp.gmail.com", { servername: "smtp.gmail.com" });
    let step = 0;
    let buffer = "";

    const commands = [
      `EHLO xtremgen.local`,
      `AUTH PLAIN ${Buffer.from(`\0${GMAIL_USER}\0${GMAIL_PASS}`).toString("base64")}`,
      `MAIL FROM:<${GMAIL_USER}>`,
      `RCPT TO:<${to}>`,
      `DATA`,
      [
        `From: "Orlando Javier Brega (XtremGen)" <${GMAIL_USER}>`,
        `To: <${to}>`,
        `Subject: =?UTF-8?B?${Buffer.from(subject).toString("base64")}?=`,
        `MIME-Version: 1.0`,
        `Content-Type: text/plain; charset=UTF-8`,
        ``,
        body,
        `.`,
      ].join("\r\n"),
      `QUIT`,
    ];

    socket.setEncoding("utf8");
    socket.on("data", (chunk) => {
      buffer += chunk;
      const lines = buffer.split("\r\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        if (!/^\d{3} /.test(line)) continue;
        const code = parseInt(line.slice(0, 3), 10);
        if (code >= 400) {
          socket.destroy();
          return reject(new Error(`SMTP Error: ${line}`));
        }
        if (step < commands.length) {
          const cmd = commands[step++];
          socket.write(cmd + "\r\n");
        } else {
          socket.end();
          resolve({ status: "sent", to, subject });
        }
      }
    });
    socket.on("error", reject);
  });
}

function readImapRecent(limit = 5) {
  const { user: GMAIL_USER, pass: GMAIL_PASS } = getCredentials();
  return new Promise((resolve, reject) => {
    const socket = tls.connect(993, "imap.gmail.com", { servername: "imap.gmail.com" });
    let output = "";
    let stage = 0;

    socket.setEncoding("utf8");
    socket.on("data", (chunk) => {
      output += chunk;
      if (stage === 0 && output.includes("* OK")) {
        stage = 1;
        output = "";
        socket.write(`A1 LOGIN "${GMAIL_USER}" "${GMAIL_PASS}"\r\n`);
      } else if (stage === 1 && (output.includes("A1 OK") || output.includes("A1 NO") || output.includes("A1 BAD"))) {
        if (!output.includes("A1 OK")) {
          socket.destroy();
          return reject(new Error(`IMAP Auth Failed [v2 user=${GMAIL_USER} len=${GMAIL_PASS.length}]: ${output.trim()}`));
        }
        stage = 2;
        output = "";
        socket.write(`A2 SELECT INBOX\r\n`);
      } else if (stage === 2 && output.includes("A2 OK")) {
        const existsMatch = output.match(/\*\s+(\d+)\s+EXISTS/);
        const total = existsMatch ? parseInt(existsMatch[1], 10) : 0;
        if (total === 0) {
          socket.write(`A4 LOGOUT\r\n`);
          socket.end();
          return resolve([]);
        }
        const start = Math.max(1, total - limit + 1);
        stage = 3;
        output = "";
        socket.write(`A3 FETCH ${start}:${total} (BODY.PEEK[HEADER.FIELDS (FROM SUBJECT DATE)])\r\n`);
      } else if (stage === 3 && output.includes("A3 OK")) {
        stage = 4;
        const raw = output;
        socket.write(`A4 LOGOUT\r\n`);
        socket.end();
        const blocks = raw.split(/\*\s+\d+\s+FETCH/).slice(1);
        const emails = blocks.map((b) => {
          const from = (b.match(/From:\s*(.+)/i)?.[1] || "").trim();
          const subject = (b.match(/Subject:\s*(.+)/i)?.[1] || "").trim();
          const date = (b.match(/Date:\s*(.+)/i)?.[1] || "").trim();
          return { from, subject, date };
        }).reverse();
        resolve(emails);
      }
    });
    socket.on("error", reject);
  });
}

const TOOLS = [
  {
    name: "gmail_list_recent",
    description: "Lista los últimos correos recibidos en la bandeja de entrada (INBOX) de Gmail.",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "number", description: "Cantidad de correos recientes a listar (1-15, por defecto 5)" },
      },
    },
  },
  {
    name: "gmail_send_email",
    description: "Envía un correo electrónico desde javierbrega@gmail.com vía SMTP TLS.",
    inputSchema: {
      type: "object",
      properties: {
        to: { type: "string", description: "Dirección de correo del destinatario" },
        subject: { type: "string", description: "Asunto del correo" },
        body: { type: "string", description: "Contenido del correo en texto plano" },
      },
      required: ["to", "subject", "body"],
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
          serverInfo: { name: "xtremgen-gmail-mcp", version: "1.0.0" },
        },
      };
    }
    if (method === "notifications/initialized") return null;
    if (method === "tools/list") return { jsonrpc: "2.0", id, result: { tools: TOOLS } };
    if (method === "tools/call") {
      const { name, arguments: args = {} } = params;
      if (name === "gmail_list_recent") {
        const emails = await readImapRecent(Math.min(Math.max(args.limit || 5, 1), 15));
        return { jsonrpc: "2.0", id, result: { content: [{ type: "text", text: JSON.stringify(emails, null, 2) }] } };
      }
      if (name === "gmail_send_email") {
        const res = await sendSmtpEmail(args);
        return { jsonrpc: "2.0", id, result: { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] } };
      }
      throw new Error(`Herramienta desconocida: ${name}`);
    }
    if (id !== undefined) return { jsonrpc: "2.0", id, result: {} };
    return null;
  } catch (err) {
    if (id !== undefined) {
      return { jsonrpc: "2.0", id, error: { code: -32000, message: err.message || String(err) } };
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
      if (res) process.stdout.write(JSON.stringify(res) + "\n");
    } catch {}
  }
});
