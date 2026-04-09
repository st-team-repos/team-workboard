import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import url from "node:url";
import os from "node:os";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "src");
const dataDir = path.join(__dirname, "data");
const dataFile = path.join(dataDir, "store.json");
const port = Number(process.env.PORT || 4173);
const host = "0.0.0.0";

const seedState = {
  users: [
    { id: "u-chen", name: "陈阳", role: "产品推进 / 模板与流程", avatar: "陈" },
    { id: "u-lin", name: "林青", role: "前端实现 / 界面原型", avatar: "林" },
    { id: "u-zhou", name: "周岚", role: "后端与部署", avatar: "周" },
    { id: "u-zhao", name: "赵可", role: "测试与归档", avatar: "赵" }
  ],
  items: [
    {
      id: "item-timeline",
      code: "TW-001",
      kind: "collab",
      title: "完善事项详情页的事件时间线展示",
      status: "in_progress",
      ownerId: "u-lin",
      collaborators: ["u-zhou"],
      progress: 70,
      dueAt: "2026-04-09T17:30:00+08:00",
      dueText: "今天 17:30",
      objective: "让团队能看清一个事项是怎么一步步推进到现在的。",
      acceptance: "时间线覆盖创建、状态变更、负责人变更、进度更新、完成、归档，并在移动端可读。",
      githubLinks: ["https://github.com/example/team-workboard/issues/12"],
      current: "时间线主体样式和事件分层已完成，剩余边界状态和空列表引导。",
      nextStep: "补“刚刚被其他人更新”的并发提示，以及“无事件时”的空状态文案。",
      summary: "",
      updatedAt: "2026-04-09T10:42:00+08:00",
      archivedAt: "",
      events: [
        { id: "e1", type: "created", actorId: "u-chen", time: "2026-04-09T10:15:00+08:00", text: "创建事项，目标时间设为今天 17:30。" },
        { id: "e2", type: "owner_changed", actorId: "u-chen", time: "2026-04-09T10:18:00+08:00", text: "主负责人改为林青，周岚加入协作成员。" },
        { id: "e3", type: "progress", actorId: "u-lin", time: "2026-04-09T10:42:00+08:00", text: "更新进展到 70%，补充“剩余边界态”说明。" }
      ]
    },
    {
      id: "item-backup",
      code: "TW-002",
      kind: "personal",
      title: "完成 SQLite 数据备份脚本接入",
      status: "blocked",
      ownerId: "u-zhou",
      collaborators: [],
      progress: 42,
      dueAt: "2026-04-09T18:00:00+08:00",
      dueText: "今天 18:00",
      objective: "让局域网部署版在异常情况下也能快速回滚和恢复。",
      acceptance: "备份脚本可手动执行、自动执行一次，并能验证恢复链路。",
      githubLinks: [],
      current: "脚本主体已写完，卡在部署机目录权限确认。",
      nextStep: "确认容器卷挂载路径和读写权限。",
      summary: "",
      updatedAt: "2026-04-09T09:35:00+08:00",
      archivedAt: "",
      events: [
        { id: "e4", type: "created", actorId: "u-zhou", time: "2026-04-09T08:30:00+08:00", text: "创建备份接入事项。" },
        { id: "e5", type: "blocked", actorId: "u-zhou", time: "2026-04-09T09:35:00+08:00", text: "阻塞原因：局域网部署机目录权限还没确认。" }
      ]
    },
    {
      id: "item-template",
      code: "TW-003",
      kind: "collab",
      title: "整理 v1 事项模板",
      status: "done",
      ownerId: "u-chen",
      collaborators: ["u-zhao"],
      progress: 100,
      dueAt: "2026-04-08T16:00:00+08:00",
      dueText: "4月8日 16:00",
      objective: "统一事项描述口径，减少不同成员写法不一致的问题。",
      acceptance: "模板包含目标、完成标准、负责人、协作成员、目标时间、当前进展、下一步。",
      githubLinks: ["https://github.com/example/team-workboard/pull/8"],
      current: "已沉淀成基础模板。",
      nextStep: "后续补多人事项示例。",
      summary: "已完成模板收口，团队后续新建事项可以直接套用。",
      updatedAt: "2026-04-08T18:40:00+08:00",
      archivedAt: "2026-04-08T18:40:00+08:00",
      events: [
        { id: "e6", type: "created", actorId: "u-chen", time: "2026-04-08T16:20:00+08:00", text: "创建模板整理事项。" },
        { id: "e7", type: "done", actorId: "u-chen", time: "2026-04-08T18:40:00+08:00", text: "已完成模板收口，并进入归档。" }
      ]
    },
    {
      id: "item-archive",
      code: "TW-004",
      kind: "collab",
      title: "归档检索规则梳理",
      status: "done",
      ownerId: "u-zhao",
      collaborators: ["u-chen"],
      progress: 100,
      dueAt: "2026-04-09T10:00:00+08:00",
      dueText: "今天 10:00",
      objective: "让完成后的事项可以快速搜索和回看。",
      acceptance: "支持按时间范围和关键词快速筛出归档项。",
      githubLinks: [],
      current: "规则和默认筛选已经确定。",
      nextStep: "暂不需要额外动作。",
      summary: "归档页默认只保留轻量筛选，先满足回溯再谈复杂报表。",
      updatedAt: "2026-04-09T09:58:00+08:00",
      archivedAt: "2026-04-09T09:58:00+08:00",
      events: [
        { id: "e8", type: "created", actorId: "u-zhao", time: "2026-04-09T09:10:00+08:00", text: "创建归档检索规则事项。" },
        { id: "e9", type: "done", actorId: "u-zhao", time: "2026-04-09T09:58:00+08:00", text: "完成归档规则梳理，写入完成总结。" }
      ]
    }
  ]
};

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg"
};

ensureStore();

const server = http.createServer(async (request, response) => {
  const requestUrl = new URL(request.url, `http://${request.headers.host}`);

  try {
    if (requestUrl.pathname === "/api/health") {
      return sendJson(response, 200, { ok: true });
    }

    if (requestUrl.pathname === "/api/bootstrap" && request.method === "GET") {
      return sendJson(response, 200, readStore());
    }

    if (requestUrl.pathname === "/api/users" && request.method === "POST") {
      const payload = await readJsonBody(request);
      const store = readStore();
      const user = {
        id: `u-${Date.now()}`,
        name: requireText(payload.name, "成员姓名"),
        role: requireText(payload.role, "成员角色"),
        avatar: firstChar(payload.name)
      };
      store.users.push(user);
      writeStore(store);
      return sendJson(response, 201, user);
    }

    if (requestUrl.pathname.match(/^\/api\/users\/[^/]+\/delete$/) && request.method === "POST") {
      const userId = requestUrl.pathname.split("/")[3];
      const store = readStore();
      const user = store.users.find((entry) => entry.id === userId);

      if (!user) {
        return sendJson(response, 404, { error: "成员不存在" });
      }

      const relatedItems = store.items.filter((item) => item.ownerId === userId || item.collaborators.includes(userId));
      if (relatedItems.length) {
        const titles = relatedItems.slice(0, 3).map((item) => item.title).join("、");
        return sendJson(response, 409, { error: `该成员仍关联事项：${titles}` });
      }

      store.users = store.users.filter((entry) => entry.id !== userId);
      writeStore(store);
      return sendJson(response, 200, { ok: true, deletedUserId: userId });
    }

    const userDetailMatch = requestUrl.pathname.match(/^\/api\/users\/([^/]+)$/);
    if (userDetailMatch) {
      const userId = userDetailMatch[1];
      const store = readStore();
      const user = store.users.find((entry) => entry.id === userId);

      if (!user) {
        return sendJson(response, 404, { error: "成员不存在" });
      }

      if (request.method === "PATCH") {
        const payload = await readJsonBody(request);
        user.name = requireText(payload.name, "成员姓名");
        user.role = requireText(payload.role, "成员角色");
        user.avatar = firstChar(user.name);
        writeStore(store);
        return sendJson(response, 200, user);
      }

      if (request.method === "DELETE") {
        return sendJson(response, 405, { error: "请改用 POST /delete 删除成员" });
      }
    }

    if (requestUrl.pathname === "/api/items" && request.method === "POST") {
      const payload = await readJsonBody(request);
      const store = readStore();
      const ownerId = requireText(payload.ownerId, "负责人");
      const requestedCollaborators = Array.isArray(payload.collaborators)
        ? payload.collaborators.filter(Boolean).filter((id) => id !== ownerId)
        : [];
      const kind = payload.kind === "collab" || requestedCollaborators.length ? "collab" : "personal";
      const now = new Date().toISOString();
      const dueAt = normalizeIncomingDueAt(payload.dueAt) || defaultDueAt();
      const dueText = formatDueText(dueAt);
      const objective = requireText(payload.objective || "等待补充目标。", "目标");
      const item = {
        id: `item-${Date.now()}`,
        code: nextItemCode(store),
        kind,
        title: requireText(payload.title, "事项标题"),
        status: "in_progress",
        ownerId,
        collaborators: kind === "collab" ? requestedCollaborators : [],
        progress: 10,
        dueAt,
        dueText,
        objective,
        acceptance: requireText(payload.acceptance || "待补充完成标准。", "完成标准"),
        githubLinks: Array.isArray(payload.githubLinks) ? payload.githubLinks.filter(Boolean) : [],
        current: objective,
        nextStep: "补充完成标准并推进第一步。",
        summary: "",
        updatedAt: now,
        archivedAt: "",
        events: [
          {
            id: `e-${Date.now()}`,
            type: "created",
            actorId: ownerId,
            time: now,
            text: `创建事项，目标时间设为 ${dueText}。`
          }
        ]
      };
      store.items.push(item);
      writeStore(store);
      return sendJson(response, 201, item);
    }

    if (requestUrl.pathname.match(/^\/api\/items\/[^/]+\/quick-update$/) && request.method === "PATCH") {
      const itemId = requestUrl.pathname.split("/")[3];
      const payload = await readJsonBody(request);
      const store = readStore();
      const item = store.items.find((entry) => entry.id === itemId);

      if (!item) {
        return sendJson(response, 404, { error: "事项不存在" });
      }

      const actorId = requireText(payload.actorId, "更新人");
      const status = requireText(payload.status, "状态");
      const note = requireText(payload.note, "进展说明");
      const now = new Date().toISOString();

      item.status = status;
      item.current = note;
      item.updatedAt = now;
      item.progress = nextProgress(item.progress, status);
      item.nextStep = defaultNextStep(status);
      item.summary = status === "done" ? note : item.summary;
      item.archivedAt = status === "done" ? now : "";
      item.events.push({
        id: `e-${Date.now()}`,
        type: status === "in_progress" ? "progress" : status,
        actorId,
        time: now,
        text: note
      });

      writeStore(store);
      return sendJson(response, 200, item);
    }

    return serveStatic(requestUrl.pathname, response);
  } catch (error) {
    return sendJson(response, 400, { error: error.message || "请求失败" });
  }
});

server.listen(port, host, () => {
  console.log(`Team todo app running at http://localhost:${port}`);
  console.log(`LAN hint: http://${getLocalAddress()}:${port}`);
});

function ensureStore() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify(seedState, null, 2));
  }
}

function readStore() {
  const store = JSON.parse(fs.readFileSync(dataFile, "utf8"));
  return normalizeStore(store);
}

function writeStore(value) {
  const normalized = normalizeStore(value);
  fs.writeFileSync(dataFile, JSON.stringify(normalized, null, 2));
}

function normalizeStore(store) {
  return {
    users: Array.isArray(store.users) ? store.users : [],
    items: (store.items || []).map((item, index) => normalizeItem(item, index))
  };
}

function normalizeItem(item, index) {
  const dueAt = normalizeIncomingDueAt(item.dueAt) || inferDueAt(item.dueText, item.updatedAt);
  return {
    ...item,
    code: item.code || fallbackItemCode(index),
    kind: item.kind || (item.collaborators && item.collaborators.length ? "collab" : "personal"),
    githubLinks: Array.isArray(item.githubLinks) ? item.githubLinks : [],
    dueAt,
    dueText: dueAt ? formatDueText(dueAt) : String(item.dueText || "待安排")
  };
}

function nextItemCode(store) {
  const maxIndex = (store.items || []).reduce((max, item, index) => {
    const match = String(item.code || fallbackItemCode(index)).match(/TW-(\d+)/);
    return Math.max(max, match ? Number(match[1]) : 0);
  }, 0);

  return `TW-${String(maxIndex + 1).padStart(3, "0")}`;
}

function fallbackItemCode(index) {
  return `TW-${String(index + 1).padStart(3, "0")}`;
}

function defaultDueAt() {
  const now = new Date();
  const next = new Date(now);
  next.setHours(18, 0, 0, 0);
  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }
  return next.toISOString();
}

function normalizeIncomingDueAt(value) {
  if (!value) {
    return "";
  }

  const due = new Date(value);
  return Number.isNaN(due.getTime()) ? "" : due.toISOString();
}

function inferDueAt(dueText, referenceAt) {
  const label = String(dueText || "").trim();
  if (!label) {
    return "";
  }

  const reference = isValidDate(referenceAt) ? new Date(referenceAt) : new Date();
  const timeMatch = label.match(/(\d{1,2}):(\d{2})/);
  const hours = timeMatch ? Number(timeMatch[1]) : 18;
  const minutes = timeMatch ? Number(timeMatch[2]) : 0;

  if (/^今天/.test(label)) {
    return createLocalDate(reference, 0, hours, minutes).toISOString();
  }

  if (/^明天/.test(label)) {
    return createLocalDate(reference, 1, hours, minutes).toISOString();
  }

  const weekMatch = label.match(/^本周([一二三四五六日天])/);
  if (weekMatch) {
    const targetDay = weekDayIndex(weekMatch[1]);
    const currentDay = reference.getDay();
    let offset = targetDay - currentDay;
    if (offset < 0) {
      offset += 7;
    }
    return createLocalDate(reference, offset, hours, minutes).toISOString();
  }

  const monthDayMatch = label.match(/^(\d{1,2})月(\d{1,2})日/);
  if (monthDayMatch) {
    const due = new Date(reference.getFullYear(), Number(monthDayMatch[1]) - 1, Number(monthDayMatch[2]), hours, minutes, 0, 0);
    return due.toISOString();
  }

  return "";
}

function createLocalDate(reference, dayOffset, hours, minutes) {
  return new Date(
    reference.getFullYear(),
    reference.getMonth(),
    reference.getDate() + dayOffset,
    hours,
    minutes,
    0,
    0
  );
}

function weekDayIndex(dayLabel) {
  return {
    日: 0,
    天: 0,
    一: 1,
    二: 2,
    三: 3,
    四: 4,
    五: 5,
    六: 6
  }[dayLabel] ?? 5;
}

function formatDueText(value) {
  const due = new Date(value);
  if (Number.isNaN(due.getTime())) {
    return "待安排";
  }

  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const startDayAfterTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2);
  const timeText = `${pad2(due.getHours())}:${pad2(due.getMinutes())}`;

  if (due >= startToday && due < startTomorrow) {
    return `今天 ${timeText}`;
  }

  if (due >= startTomorrow && due < startDayAfterTomorrow) {
    return `明天 ${timeText}`;
  }

  if (due.getFullYear() === now.getFullYear()) {
    return `${due.getMonth() + 1}月${due.getDate()}日 ${timeText}`;
  }

  return `${due.getFullYear()}-${pad2(due.getMonth() + 1)}-${pad2(due.getDate())} ${timeText}`;
}

function pad2(value) {
  return String(value).padStart(2, "0");
}

function isValidDate(value) {
  if (!value) {
    return false;
  }
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

function serveStatic(requestPath, response) {
  const safePath = path.normalize(requestPath === "/" ? "/index.html" : requestPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(rootDir, safePath);

  fs.readFile(filePath, (fileError, fileBuffer) => {
    if (!fileError) {
      response.writeHead(200, {
        "Content-Type": contentTypes[path.extname(filePath)] || "application/octet-stream",
        "Cache-Control": "no-store"
      });
      response.end(fileBuffer);
      return;
    }

    const fallbackPath = path.join(rootDir, "index.html");
    fs.readFile(fallbackPath, (fallbackError, fallbackBuffer) => {
      if (fallbackError) {
        response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
        response.end("Unable to load application.");
        return;
      }

      response.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store"
      });
      response.end(fallbackBuffer);
    });
  });
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(JSON.stringify(payload));
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
    });
    request.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("请求体不是合法 JSON"));
      }
    });
    request.on("error", reject);
  });
}

function requireText(value, fieldName) {
  const text = String(value || "").trim();
  if (!text) {
    throw new Error(`${fieldName}不能为空`);
  }
  return text;
}

function firstChar(text) {
  return String(text || "").trim().slice(0, 1) || "成";
}

function nextProgress(progress, status) {
  if (status === "done") return 100;
  if (status === "review") return Math.max(progress, 90);
  if (status === "blocked") return progress;
  return Math.min(progress + 10, 95);
}

function defaultNextStep(status) {
  return {
    in_progress: "继续推进下一步。",
    blocked: "先解除阻塞，再继续推进。",
    review: "等待评审反馈。",
    done: "等待进入归档回溯。"
  }[status] || "继续推进下一步。";
}

function getLocalAddress() {
  const interfaces = os.networkInterfaces();
  for (const addresses of Object.values(interfaces)) {
    for (const address of addresses || []) {
      if (address.family === "IPv4" && !address.internal) {
        return address.address;
      }
    }
  }
  return "localhost";
}
