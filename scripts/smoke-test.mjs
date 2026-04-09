import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(__dirname, "..");
const server = spawn(process.execPath, ["server.js"], {
  cwd: projectDir,
  stdio: ["ignore", "pipe", "pipe"]
});

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

try {
  await wait(2000);

  const health = await fetchJson("http://127.0.0.1:4173/api/health");
  assert.equal(health.ok, true, "health 接口应返回 ok");

  const initial = await fetchJson("http://127.0.0.1:4173/api/bootstrap");
  assert.ok(initial.users.length >= 4, "应包含初始成员");
  assert.ok(initial.items.length >= 4, "应包含初始事项");

  const member = await fetchJson("http://127.0.0.1:4173/api/users", {
    method: "POST",
    body: JSON.stringify({
      name: "测试成员",
      role: "冒烟测试 / 成员管理"
    })
  });
  assert.equal(member.name, "测试成员");

  const item = await fetchJson("http://127.0.0.1:4173/api/items", {
    method: "POST",
    body: JSON.stringify({
      title: "冒烟测试事项",
      ownerId: member.id,
      collaborators: [],
      dueText: "今天 21:00",
      objective: "验证事项创建和状态流转。",
      acceptance: "可被创建、更新为完成，并在归档中可回查。",
      githubLinks: ["https://github.com/example/repo/issues/99"]
    })
  });
  assert.equal(item.title, "冒烟测试事项");
  assert.equal(item.githubLinks[0], "https://github.com/example/repo/issues/99");

  const updated = await fetchJson(`http://127.0.0.1:4173/api/items/${item.id}/quick-update`, {
    method: "PATCH",
    body: JSON.stringify({
      actorId: member.id,
      status: "done",
      note: "冒烟测试已完成并归档。"
    })
  });
  assert.equal(updated.status, "done");
  assert.equal(updated.summary, "冒烟测试已完成并归档。");
  assert.ok(updated.archivedAt, "完成事项后应写入归档时间");

  const finalState = await fetchJson("http://127.0.0.1:4173/api/bootstrap");
  const finalItem = finalState.items.find((entry) => entry.id === item.id);
  assert.ok(finalItem, "创建后的事项应可在 bootstrap 中看到");
  assert.equal(finalItem.status, "done");
  assert.ok(finalItem.events.some((entry) => entry.text.includes("冒烟测试已完成并归档")), "时间线应记录更新事件");

  const homeHtml = await fetchText("http://127.0.0.1:4173/");
  assert.ok(homeHtml.includes("Team Workboard"), "首页应正常返回前端页面");
  assert.ok(homeHtml.includes("快速更新"), "首页应包含关键操作入口");

  console.log("smoke test passed");
} finally {
  server.kill();
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || `request failed: ${response.status}`);
  }
  return data;
}

async function fetchText(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`request failed: ${response.status}`);
  }
  return response.text();
}
