require("dotenv").config();

const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3003}`;
const root = `${baseUrl}/routes`;
const apiRoot = `${baseUrl}/api/routes`;

function buildOptions(method, body) {
  const headers = { "Content-Type": "application/json" };
  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);
  return options;
}

async function request(path, method = "GET", body) {
  const url = `${baseUrl}${path}`;
  const response = await fetch(url, buildOptions(method, body));
  const text = await response.text();
  let data;

  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  return { status: response.status, data, url, ok: response.ok };
}

async function verify() {
  console.log("Using base URL:", baseUrl);
  const steps = [];

  steps.push({ name: "Health check", action: () => request("/health") });
  steps.push({ name: "GET /routes", action: () => request("/routes") });
  steps.push({ name: "GET /api/routes", action: () => request("/api/routes") });

  const createBody = {
    date: new Date().toISOString(),
    agent_id: null,
    status: "planned",
    total_distance: 42.5,
    estimated_time: 90,
  };

  let createdRoute = null;

  steps.push({ name: "POST /routes", action: async () => {
    const result = await request("/routes", "POST", createBody);
    if (result.ok && result.data && result.data.id) {
      createdRoute = result.data;
    }
    return result;
  }});

  steps.push({ name: "GET /routes/:id", action: async () => {
    if (!createdRoute) return { status: 0, data: "No route created" };
    return request(`/routes/${createdRoute.id}`);
  }});

  steps.push({ name: "PUT /routes/:id", action: async () => {
    if (!createdRoute) return { status: 0, data: "No route created" };
    return request(`/routes/${createdRoute.id}`, "PUT", { status: "in_progress" });
  }});

  steps.push({ name: "PUT /routes/:id/assign", action: async () => {
    if (!createdRoute) return { status: 0, data: "No route created" };
    return request(`/routes/${createdRoute.id}/assign`, "PUT", { agent_id: null });
  }});

  steps.push({ name: "GET /routes/agent/:agentId", action: () => request("/routes/agent/nonexistent-agent") });

  steps.push({ name: "DELETE /routes/:id", action: async () => {
    if (!createdRoute) return { status: 0, data: "No route created" };
    return request(`/routes/${createdRoute.id}`, "DELETE");
  }});

  for (const step of steps) {
    try {
      const result = await step.action();
      console.log(`\n${step.name}`);
      console.log(`URL: ${result.url || "-"}`);
      console.log(`Status: ${result.status}`);
      console.log("Response:", result.data);
    } catch (error) {
      console.error(`\n${step.name} failed:`, error.message);
    }
  }
}

verify().catch((error) => {
  console.error("Verification failed:", error);
  process.exit(1);
});