#!/usr/bin/env node
// Headless Chrome driver over CDP. No npm dependencies: Node's global WebSocket
// talks to a Chrome this script launches, and every command reconnects.
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
const statePath = path.join(root, ".verify", "browser.json");
const command = process.argv[2];

function fail(message) {
  console.error(JSON.stringify({ error: message }, null, 2));
  process.exit(1);
}

function readState() {
  try {
    return JSON.parse(fs.readFileSync(statePath, "utf8"));
  } catch {
    return null;
  }
}

function writeState(state) {
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  fs.writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`);
}

function pidAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function chromeExecutable() {
  const candidates = [
    process.env.CHROME_PATH,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ].filter(Boolean);

  const found = candidates.find((candidate) => fs.existsSync(candidate));
  if (!found) {
    fail("Chrome not found. Set CHROME_PATH to a Chrome or Chromium binary.");
  }
  return found;
}

async function waitForDevToolsUrl(logPath) {
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    let log = "";
    try {
      log = fs.readFileSync(logPath, "utf8");
    } catch {
      log = "";
    }
    const match = log.match(/DevTools listening on (ws:\/\/\S+)/);
    if (match) return match[1];
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  fail(`Chrome did not expose DevTools within 20s. See ${logPath}`);
}

async function connect(target) {
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = () => reject(new Error("WebSocket connection failed"));
  });

  let nextId = 0;
  const pending = new Map();

  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (!message.id) return;
    const entry = pending.get(message.id);
    if (!entry) return;
    pending.delete(message.id);
    if (message.error) {
      entry.reject(new Error(`${entry.method}: ${message.error.message} (${message.error.code})`));
    } else {
      entry.resolve(message.result);
    }
  };

  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = ++nextId;
      if (process.env.VERIFY_DEBUG) console.error("CDP", id, method, JSON.stringify(params));
      pending.set(id, { resolve, reject, method });
      ws.send(JSON.stringify({ id, method, params }));
    });

  return { ws, send, close: () => ws.close() };
}

async function pageTarget(port) {
  const response = await fetch(`http://127.0.0.1:${port}/json/list`);
  if (!response.ok) fail(`Cannot list Chrome targets: HTTP ${response.status}`);
  const targets = await response.json();
  const page = targets.find((target) => target.type === "page");
  if (!page) fail("Chrome has no page target. Run launch, then open.");
  return page;
}

async function attach() {
  const state = readState();
  if (!state || !pidAlive(state.pid)) {
    fail("No live harness session. Run: node .claude/skills/verify/scripts/browser.mjs launch");
  }
  const target = await pageTarget(state.port);
  const session = await connect(target);
  await session.send("Page.enable");
  await session.send("Runtime.enable");
  await session.send("DOM.enable");
  await session.send("Accessibility.enable");
  return { state, session };
}

async function evaluate(session, expression) {
  const result = await session.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (result.exceptionDetails) {
    const description =
      result.exceptionDetails.exception?.description ?? result.exceptionDetails.text;
    throw new Error(description);
  }
  return result.result.value;
}

async function waitReady(session, timeout = 15_000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    try {
      const readyState = await evaluate(session, "document.readyState");
      if (readyState === "complete") return;
    } catch {
      // A navigation in progress replaces the execution context.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  fail(`Document did not reach readyState complete within ${timeout}ms`);
}

async function waitLoaded(session, url, timeout = 15_000) {
  const expected = new URL(url).href;
  const deadline = Date.now() + timeout;
  let seen = null;
  while (Date.now() < deadline) {
    try {
      seen = await evaluate(session, "({ href: location.href, readyState: document.readyState })");
      if (seen.readyState === "complete" && new URL(seen.href).href === expected) return;
    } catch {
      // A navigation in progress replaces the execution context.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  fail(`Expected ${expected}, last saw ${JSON.stringify(seen)}`);
}

async function waitText(session, text, timeout = 15_000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    try {
      if (await evaluate(session, `document.body.innerText.includes(${JSON.stringify(text)})`)) {
        return;
      }
    } catch {
      // A navigation in progress replaces the execution context.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  fail(`Text not found within ${timeout}ms: ${text}`);
}

async function axTree(session) {
  const { nodes } = await session.send("Accessibility.getFullAXTree");
  const byId = new Map(nodes.map((node) => [node.nodeId, node]));
  const childIds = new Set(nodes.flatMap((node) => node.childIds ?? []));
  const rootNode = nodes.find((node) => !node.parentId || !byId.has(node.parentId)) ??
    nodes.find((node) => !childIds.has(node.nodeId));
  if (!rootNode) fail("Accessibility tree is empty");

  const lines = [];
  const properties = (node) => {
    const interesting = ["level", "checked", "disabled", "expanded", "pressed", "selected"];
    return (node.properties ?? [])
      .filter((property) => interesting.includes(property.name))
      .map((property) => `${property.name}=${property.value?.value}`)
      .join(" ");
  };
  const label = (node) => {
    const role = node.role?.value ?? "unknown";
    const name = node.name?.value ?? "";
    const props = properties(node);
    if (role === "StaticText") return name;
    const suffix = [name && JSON.stringify(name), props].filter(Boolean).join(" ");
    return suffix ? `${role} ${suffix}` : role;
  };

  const walk = (node, depth) => {
    if (lines.length >= 600) return;
    if (!node.ignored && node.role?.value !== "none" && node.role?.value !== "generic") {
      lines.push(`${"  ".repeat(depth)}- ${label(node)}`);
      depth += 1;
    }
    for (const childId of node.childIds ?? []) {
      const child = byId.get(childId);
      if (child) walk(child, depth);
    }
  };

  walk(rootNode, 0);
  return lines.join("\n");
}

async function findAxNode(session, role, name) {
  const { nodes } = await session.send("Accessibility.getFullAXTree");
  return nodes.find((node) => {
    if (node.ignored || !node.backendDOMNodeId) return false;
    if (role && node.role?.value !== role) return false;
    return (node.name?.value ?? "") === name;
  });
}

async function resolveNode(session, node) {
  const { object } = await session.send("DOM.resolveNode", {
    backendNodeId: node.backendDOMNodeId,
  });
  return object.objectId;
}

async function callOnNode(session, objectId, functionDeclaration, args = []) {
  const { result, exceptionDetails } = await session.send("Runtime.callFunctionOn", {
    objectId,
    functionDeclaration,
    arguments: args,
    returnByValue: true,
    awaitPromise: true,
  });
  if (exceptionDetails) {
    throw new Error(exceptionDetails.exception?.description ?? exceptionDetails.text);
  }
  return result.value;
}

async function launch() {
  const existing = readState();
  if (existing && pidAlive(existing.pid)) {
    try {
      const response = await fetch(`http://127.0.0.1:${existing.port}/json/version`);
      if (response.ok) {
        console.log(JSON.stringify({ ...existing, reused: true }, null, 2));
        return;
      }
    } catch {
      // Fall through to the stale-state error.
    }
    fail("Harness state points at a live pid with no DevTools endpoint. Run stop, then launch.");
  }

  const executable = chromeExecutable();
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "verify-chrome-"));
  const logPath = path.join(profile, "chrome.log");
  const log = fs.openSync(logPath, "a");
  const child = spawn(
    executable,
    [
      "--headless=new",
      "--remote-debugging-port=0",
      `--user-data-dir=${profile}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-extensions",
      "--disable-background-networking",
      "--disable-sync",
      "--hide-scrollbars",
      "--window-size=1280,900",
      "--force-device-scale-factor=1",
      "about:blank",
    ],
    { detached: true, stdio: ["ignore", "ignore", log] },
  );
  fs.closeSync(log);
  child.unref();

  const devtoolsUrl = await waitForDevToolsUrl(logPath);
  const port = Number(new URL(devtoolsUrl).port);
  const state = { pid: child.pid, port, profile, log: logPath };
  writeState(state);

  const response = await fetch(`http://127.0.0.1:${port}/json/version`);
  if (!response.ok) fail(`Chrome DevTools did not answer: HTTP ${response.status}`);
  console.log(JSON.stringify({ ...state, reused: false }, null, 2));
}

async function open() {
  const url = process.argv[3];
  if (!url) fail("open needs a URL");
  const { session } = await attach();
  await session.send("Page.addScriptToEvaluateOnNewDocument", {
    source: `
      if (!window.__verify) {
        window.__verify = { console: [], errors: [] };
        const originalError = console.error;
        console.error = (...args) => {
          window.__verify.console.push(args.map(String).join(" "));
          originalError(...args);
        };
        window.addEventListener("error", (event) => window.__verify.errors.push(String(event.message)));
        window.addEventListener("unhandledrejection", (event) => window.__verify.errors.push(String(event.reason)));
      }
    `,
  });
  await session.send("Page.navigate", { url });
  await waitLoaded(session, url);
  const result = await evaluate(
    session,
    "({ url: location.href, title: document.title, readyState: document.readyState })",
  );
  session.close();
  console.log(JSON.stringify(result, null, 2));
}

async function wait() {
  const textIndex = process.argv.indexOf("--text");
  const timeoutIndex = process.argv.indexOf("--timeout");
  const text = textIndex === -1 ? null : process.argv[textIndex + 1];
  const timeout = timeoutIndex === -1 ? 15_000 : Number(process.argv[timeoutIndex + 1]);
  if (!text) fail("wait needs --text <value>");

  const { session } = await attach();
  await waitText(session, text, timeout);
  session.close();
  console.log(JSON.stringify({ found: text, timeout }, null, 2));
}

async function snapshot() {
  const pathIndex = process.argv.indexOf("--path");
  const { session } = await attach();
  const content = await axTree(session);
  session.close();

  if (pathIndex === -1) {
    console.log(content);
    return;
  }
  const file = path.resolve(root, process.argv[pathIndex + 1]);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${content}\n`);
  console.log(file);
}

async function click() {
  const roleIndex = process.argv.indexOf("--role");
  const nameIndex = process.argv.indexOf("--name");
  const role = roleIndex === -1 ? null : process.argv[roleIndex + 1];
  const name = nameIndex === -1 ? null : process.argv[nameIndex + 1];
  if (!name) fail("click needs --name <accessible name> (and optionally --role)");

  const { session } = await attach();
  const node = await findAxNode(session, role, name);
  if (!node) fail(`No accessibility node matches role=${role ?? "any"} name=${JSON.stringify(name)}`);
  const objectId = await resolveNode(session, node);
  const html = await callOnNode(
    session,
    objectId,
    "function () { this.scrollIntoView({ block: 'center' }); this.click(); return this.outerHTML.slice(0, 300); }",
  );
  await new Promise((resolve) => setTimeout(resolve, 150));
  await waitReady(session);
  session.close();
  console.log(JSON.stringify({ clicked: { role: node.role?.value, name: node.name?.value }, html }, null, 2));
}

async function fill() {
  const roleIndex = process.argv.indexOf("--role");
  const nameIndex = process.argv.indexOf("--name");
  const valueIndex = process.argv.indexOf("--value");
  const role = roleIndex === -1 ? null : process.argv[roleIndex + 1];
  const name = nameIndex === -1 ? null : process.argv[nameIndex + 1];
  const value = valueIndex === -1 ? null : process.argv[valueIndex + 1];
  if (!name || value === null) fail("fill needs --name <accessible name> and --value <value>");

  const { session } = await attach();
  const node = await findAxNode(session, role, name);
  if (!node) fail(`No accessibility node matches role=${role ?? "any"} name=${JSON.stringify(name)}`);
  const objectId = await resolveNode(session, node);
  const result = await callOnNode(
    session,
    objectId,
    `function (value) {
      const element = this;
      const prototype =
        element instanceof HTMLTextAreaElement
          ? HTMLTextAreaElement.prototype
          : HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(prototype, "value").set;
      setter.call(element, value);
      element.dispatchEvent(new Event("input", { bubbles: true }));
      element.dispatchEvent(new Event("change", { bubbles: true }));
      return element.value;
    }`,
    [{ value }],
  );
  session.close();
  console.log(JSON.stringify({ filled: { role: node.role?.value, name: node.name?.value }, value: result }, null, 2));
}

async function evaluateCommand() {
  const expression = process.argv[3];
  if (!expression) fail("eval needs a JavaScript expression");
  const { session } = await attach();
  const result = await evaluate(session, expression);
  session.close();
  console.log(JSON.stringify({ result }, null, 2));
}

async function screenshot() {
  const pathIndex = process.argv.indexOf("--path");
  if (pathIndex === -1) fail("screenshot needs --path <file.png>");
  const file = path.resolve(root, process.argv[pathIndex + 1]);

  const { session } = await attach();
  const metrics = await session.send("Page.getLayoutMetrics");
  const size = metrics.cssContentSize ?? metrics.contentSize;
  const width = Math.min(Math.ceil(size.width), 2000);
  const height = Math.min(Math.ceil(size.height), 4000);
  const { data } = await session.send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: true,
    clip: { x: 0, y: 0, width, height, scale: 1 },
  });
  session.close();

  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, Buffer.from(data, "base64"));
  console.log(JSON.stringify({ path: file, width, height }, null, 2));
}

async function consoleCommand() {
  const { session } = await attach();
  const collected = await evaluate(
    session,
    "window.__verify ?? { console: [], errors: [], note: 'collector missing; run open first' }",
  );
  session.close();
  console.log(JSON.stringify(collected, null, 2));
}

async function status() {
  const state = readState();
  if (!state) {
    console.log(JSON.stringify({ running: false }, null, 2));
    return;
  }
  const alive = pidAlive(state.pid);
  let browser = null;
  if (alive) {
    try {
      const response = await fetch(`http://127.0.0.1:${state.port}/json/version`);
      browser = response.ok ? (await response.json()).Browser : null;
    } catch {
      browser = null;
    }
  }
  console.log(JSON.stringify({ running: alive, ...state, browser }, null, 2));
}

async function stop() {
  const state = readState();
  if (!state) {
    console.log(JSON.stringify({ stopped: false, reason: "no state file" }, null, 2));
    return;
  }
  if (pidAlive(state.pid)) {
    const commandLine = await new Promise((resolve) => {
      const ps = spawn("ps", ["-p", String(state.pid), "-o", "command="]);
      let output = "";
      ps.stdout.on("data", (chunk) => (output += chunk));
      ps.on("close", () => resolve(output));
    });
    if (!commandLine.includes(state.profile)) {
      fail(`Refusing to kill pid ${state.pid}: it does not own ${state.profile}`);
    }
    process.kill(state.pid, "SIGTERM");
    const deadline = Date.now() + 10_000;
    while (pidAlive(state.pid) && Date.now() < deadline) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    if (pidAlive(state.pid)) process.kill(state.pid, "SIGKILL");
  }
  if (state.profile.startsWith(os.tmpdir())) {
    fs.rmSync(state.profile, { recursive: true, force: true });
  }
  fs.rmSync(statePath, { force: true });
  console.log(JSON.stringify({ stopped: true, pid: state.pid, profile: state.profile }, null, 2));
}

const commands = {
  launch,
  open,
  wait,
  snapshot,
  click,
  fill,
  eval: evaluateCommand,
  screenshot,
  console: consoleCommand,
  status,
  stop,
};

if (!command || !commands[command]) {
  fail(`Usage: browser.mjs <${Object.keys(commands).join("|")}>`);
}

try {
  await commands[command]();
} catch (error) {
  fail(error.message);
}
