import { createRequire } from "node:module";
import { join } from "node:path";
import { request as apiRequest } from "../src/lib/api.js";
import { StrictMode } from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Router from "../src/Router.jsx";
import Outcome from "../src/admin/Outcome.jsx";
import Projects from "../src/admin/Projects.jsx";
import Records from "../src/admin/Records.jsx";
import Dashboard from "../src/admin/Dashboard.jsx";
const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
const project = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  pid: "DEMO",
  name: "Consumer study",
  active: true,
  createdAt: "2026-01-01T12:00:00Z",
};
const record = {
  serial: "9007199254740993",
  project: { pid: "DEMO" },
  uid: "respondent",
  status: "COMPLETE",
  transactionId: "tx",
  loiSeconds: 0,
  outTime: "2026-01-01T12:00:00Z",
  createdAt: "2026-01-01T12:00:00Z",
};
describe("Frontend flows", () => {
  it("preserves public sections and contact form at root without API calls", () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    const { container } = render(<Router />);
    for (const id of ["home", "about", "services", "industries", "contact"])
      expect(container.querySelector(`#${id}`)).toBeTruthy();
    expect(screen.getByRole("button", { name: /SEND INQUIRY/ })).toBeTruthy();
    expect(fetch).not.toHaveBeenCalled();
  });
  it("protects admin records and reports invalid login", async () => {
    window.history.replaceState({}, "", "/admin/records");
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          json({ error: { message: "Invalid email or password" } }, 401),
        ),
    );
    render(<Router />);
    const user = userEvent.setup();
    await user.type(
      screen.getByLabelText("Email address"),
      "admin@example.test",
    );
    await user.type(screen.getByLabelText("Password"), "wrong-password");
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(screen.getByText("Invalid email or password")).toBeTruthy();
    expect(sessionStorage.getItem("harwinn-session")).toBeNull();
  });
  it("logs in, loads overview and revokes session on logout", async () => {
    window.history.replaceState({}, "", "/admin/login");
    const fetch = vi.fn(async (path) => {
      if (path === "/api/auth/login")
        return json({
          token: "a".repeat(43),
          expiresAt: new Date(Date.now() + 60000).toISOString(),
          admin: { email: "admin@example.test" },
        });
      if (path === "/api/auth/me") return json({ email: "admin@example.test" });
      if (path === "/api/auth/logout")
        return new Response(null, { status: 204 });
      return json({ records: [], total: 0 });
    });
    vi.stubGlobal("fetch", fetch);
    render(<Router />);
    const user = userEvent.setup();
    await user.type(
      screen.getByLabelText("Email address"),
      "admin@example.test",
    );
    await user.type(screen.getByLabelText("Password"), "test-password");
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(
      await screen.findByRole("heading", { name: "Overview" }),
    ).toBeTruthy();
    expect(
      await screen.findByText("Ready for your first response"),
    ).toBeTruthy();
    expect(sessionStorage.getItem("harwinn-session")).toContain("token");
    await user.click(screen.getByRole("button", { name: "Sign out" }));
    expect(await screen.findByRole("button", { name: "Sign in" })).toBeTruthy();
    expect(sessionStorage.getItem("harwinn-session")).toBeNull();
  });
  it("clears expired server sessions", async () => {
    sessionStorage.setItem(
      "harwinn-session",
      JSON.stringify({
        token: "a".repeat(43),
        expiresAt: new Date(Date.now() + 60000).toISOString(),
        admin: { email: "admin@example.test" },
      }),
    );
    window.history.replaceState({}, "", "/admin/projects");
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          json({ error: { message: "Session invalid or expired" } }, 401),
        ),
    );
    render(<Router />);
    expect(await screen.findByRole("button", { name: "Sign in" })).toBeTruthy();
    expect(sessionStorage.getItem("harwinn-session")).toBeNull();
  });
  it("loads overview counts from backend totals", async () => {
    const api = vi.fn(async (path) => ({
      records: path.includes("pageSize=5") ? [record] : [],
      total: path.includes("status=") ? 7 : 28,
    }));
    render(<Dashboard api={api} />);
    expect(await screen.findByText("28 total records")).toBeTruthy();
    expect(screen.getAllByText("7")).toHaveLength(4);
    expect(api).toHaveBeenCalledTimes(5);
  });
  it("applies exact filters, resets page on filter changes and paginates server-side", async () => {
    const api = vi.fn().mockResolvedValue({ records: [record], total: 60 });
    render(<Records api={api} />);
    await screen.findByText(record.serial);
    expect(screen.getByText("0")).toBeTruthy();
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Next" }));
    await waitFor(() => expect(api.mock.calls.at(-1)[0]).toContain("page=2"));
    await screen.findByText(record.serial);
    await user.type(screen.getByLabelText("Project PID"), "DEMO");
    await user.selectOptions(screen.getByLabelText("Status"), "COMPLETE");
    await user.click(screen.getByRole("button", { name: "Apply filters" }));
    await waitFor(() =>
      expect(api.mock.calls.at(-1)[0]).toContain("pid=DEMO&status=COMPLETE"),
    );
    expect(api.mock.calls.at(-1)[0]).toContain("page=1");
    await screen.findByText(record.serial);
    await user.click(screen.getByRole("button", { name: "Reset" }));
    await waitFor(() => expect(api.mock.calls.at(-1)[0]).not.toContain("pid="));
  });
  it("rejects inverted date filters before requesting the backend", async () => {
    const api = vi.fn().mockResolvedValue({ records: [], total: 0 });
    render(<Records api={api} />);
    await screen.findByText("No records found");
    fireEvent.change(screen.getByLabelText("Created from (local time)"), {
      target: { value: "2026-02-01T00:00" },
    });
    fireEvent.change(screen.getByLabelText("Created to (local time)"), {
      target: { value: "2026-01-01T00:00" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Apply filters" }));
    expect(screen.getByRole("alert").textContent).toContain("Start time");
    expect(api).toHaveBeenCalledTimes(1);
  });
  it("creates a project with contract fields", async () => {
    const api = vi.fn(async (path, opts) =>
      opts?.method === "POST" ? project : { projects: [] },
    );
    render(<Projects api={api} />);
    await screen.findByText("No projects yet");
    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Project ID"), "DEMO");
    await user.type(screen.getByRole("textbox", { name: /^Project Name\b/ }), "Consumer study");
    await user.click(screen.getByRole("button", { name: "Add project" }));
    await screen.findByText("Project created.");
    expect(api).toHaveBeenCalledWith(
      "/api/projects",
      expect.objectContaining({
        method: "POST",
        body: { pid: "DEMO", name: "Consumer study" },
      }),
    );
  });
  it("edits client Project ID/name/active, and shows deletion conflicts", async () => {
    const api = vi.fn(async (path, opts) => {
      if (opts?.method === "DELETE")
        throw new Error("Resource has dependent records");
      if (opts?.method === "PATCH") return { ...project, ...opts.body };
      return { projects: [project] };
    });
    render(<Projects api={api} />);
    await screen.findByText("Consumer study");
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Edit" }));
    const pid = screen.getAllByLabelText("Project ID").at(-1);
    await user.clear(pid);
    await user.type(pid, "CLIENT-UPDATED");
    const name = screen.getAllByLabelText("Project Name").at(-1);
    await user.clear(name);
    await user.type(name, "Updated study");
    await user.click(screen.getByLabelText("Accept callbacks"));
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    await screen.findByText("Project updated.");
    expect(api).toHaveBeenCalledWith(
      `/api/projects/${project.id}`,
      expect.objectContaining({
        method: "PATCH",
        body: { pid: "CLIENT-UPDATED", name: "Updated study", active: false },
      }),
    );
    await screen.findByText("Consumer study");
    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(
      api.mock.calls.some(([, options]) => options?.method === "DELETE"),
    ).toBe(false);
    await user.click(screen.getByRole("button", { name: "Confirm deletion" }));
    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(screen.getByText("Consumer study")).toBeTruthy();
  });
  it.each(["POST", "PATCH"])("keeps form values and reports duplicate Project IDs on %s", async (method) => {
    const api = vi.fn(async (path, opts) => {
      if (opts?.method === method) throw Object.assign(new Error("Resource already exists"), { status: 409 });
      return { projects: [project] };
    });
    render(<Projects api={api} />);
    await screen.findByText("Consumer study");
    const user = userEvent.setup();
    if (method === "PATCH") await user.click(screen.getByRole("button", { name: "Edit" }));
    const pid = screen.getAllByLabelText("Project ID").at(-1);
    const name = screen.getAllByRole("textbox", { name: /^Project Name\b/ }).at(-1);
    await user.clear(pid);
    await user.type(pid, "EXISTING-ID");
    await user.clear(name);
    await user.type(name, "Client project");
    await user.click(screen.getByRole("button", { name: method === "POST" ? "Add project" : "Save changes" }));
    expect((await screen.findByRole("alert")).textContent).toContain("Project ID is already in use");
    expect(pid.value).toBe("EXISTING-ID");
    expect(name.value).toBe("Client project");
    expect(screen.queryByText("Project updated.")).toBeNull();
    expect(screen.queryByText("Project created.")).toBeNull();
  });
  it("keeps multiple same-name projects and refreshes selected links after a Project ID edit", async () => {
    const projects = [{ ...project }, { ...project, id: "550e8400-e29b-41d4-a716-446655440001", pid: "SECOND" }];
    const api = vi.fn(async (path, opts) => {
      if (opts?.method === "PATCH") {
        Object.assign(projects[0], opts.body);
        return { ...projects[0] };
      }
      return { projects: projects.map(value => ({ ...value })) };
    });
    render(<Projects api={api} />);
    await screen.findByText("SECOND");
    expect(screen.getAllByText("Consumer study")).toHaveLength(2);
    const user = userEvent.setup();
    await user.click(screen.getAllByRole("button", { name: "Outcome links" })[0]);
    await user.click(screen.getAllByRole("button", { name: "Edit" })[0]);
    const pid = screen.getAllByLabelText("Project ID").at(-1);
    await user.clear(pid);
    await user.type(pid, "CLIENT-UPDATED");
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    await screen.findByText("Project updated.");
    expect(screen.getByText(/\/tracking\/CLIENT-UPDATED\/COMPLETE\?uid=/)).toBeTruthy();
    expect(screen.queryByText(/\/tracking\/DEMO\/COMPLETE\?uid=/)).toBeNull();
    expect(await screen.findByText("SECOND")).toBeTruthy();
    expect(screen.getAllByText("Consumer study")).toHaveLength(2);
  });
  it("creates and edits a visible project with a blank ID, without tracking links", async () => {
    let saved = null;
    const api = vi.fn(async (path, opts) => {
      if (opts?.method === "POST") return saved = { ...project, ...opts.body };
      if (opts?.method === "PATCH") return saved = { ...saved, ...opts.body };
      return { projects: saved ? [{ ...saved }] : [] };
    });
    render(<Projects api={api} />);
    await screen.findByText("No projects yet");
    const user = userEvent.setup();
    expect(screen.getByLabelText("Project ID").required).toBe(false);
    await user.type(screen.getByRole("textbox", { name: /^Project Name\b/ }), "No ID study");
    await user.click(screen.getByRole("button", { name: "Add project" }));
    await screen.findByText("Project created.");
    await screen.findByText("No ID study");
    expect(saved.pid).toBeNull();
    expect(screen.getByText("Not assigned")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Outcome links" }));
    expect(screen.getByText(/Add a Project ID before sharing/)).toBeTruthy();
    expect(screen.queryByText(/\/tracking\/null\//)).toBeNull();
    await user.click(screen.getByRole("button", { name: "Edit" }));
    const name = screen.getAllByLabelText("Project Name").at(-1);
    const pid = screen.getAllByLabelText("Project ID").at(-1);
    expect(pid.value).toBe("");
    expect(pid.required).toBe(false);
    expect(name.value).toBe("No ID study");
    await user.clear(name);
    await user.type(name, "Persisted new name");
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    await screen.findByText("Project updated.");
    await screen.findByText("Persisted new name");
    expect(api).toHaveBeenCalledWith(`/api/projects/${project.id}`, expect.objectContaining({ method: "PATCH", body: { pid: null, name: "Persisted new name", active: true } }));
    expect(saved.name).toBe("Persisted new name");
  });
  it("prevents duplicate edit submissions while the backend save is pending", async () => {
    let finish;
    let stored = { ...project };
    const pending = new Promise(resolve => { finish = resolve; });
    const api = vi.fn(async (path, opts) => {
      if (opts?.method === "PATCH") { await pending; stored = { ...stored, ...opts.body }; return stored; }
      return { projects: [{ ...stored }] };
    });
    render(<Projects api={api} />);
    await screen.findByText("Consumer study");
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    const pid = screen.getAllByLabelText("Project ID").at(-1);
    fireEvent.change(pid, { target: { value: "" } });
    const save = screen.getByRole("button", { name: "Save changes" });
    fireEvent.submit(save.closest("form"));
    fireEvent.submit(save.closest("form"));
    expect(save.disabled).toBe(true);
    expect(api.mock.calls.filter(([, opts]) => opts?.method === "PATCH")).toHaveLength(1);
    expect(screen.queryByText("Project updated.")).toBeNull();
    finish();
    await screen.findByText("Project updated.");
    await screen.findByText("Not assigned");
    expect(stored.pid).toBeNull();
  });
  it.skipIf(!process.env.HARWINN_BACKEND_PATH)("persists an Edit submission through the real API client and Express backend", async () => {
    const { fakeDb, appFor, adminToken } = createRequire(import.meta.url)(join(process.env.HARWINN_BACKEND_PATH, "test/helpers.js"));
    const db = fakeDb();
    const token = await adminToken(db);
    const server = appFor(db).listen(0, "127.0.0.1");
    await new Promise(resolve => server.once("listening", resolve));
    const realFetch = globalThis.fetch;
    const base = `http://127.0.0.1:${server.address().port}`;
    vi.stubGlobal("fetch", (path, options) => realFetch(base + path, options));
    const api = (path, options = {}) => apiRequest(path, { ...options, token });
    try {
      const original = await api("/api/projects", { method: "POST", body: { pid: "CLIENT-ORIGINAL", name: "Existing saved project" } });
      const mounted = render(<Projects api={api} />);
      await screen.findByText("Existing saved project");
      const user = userEvent.setup();
      const edit = screen.getByText("Existing saved project").closest("tr").querySelector("button");
      await user.click(edit);
      const name = screen.getAllByLabelText("Project Name").at(-1);
      const pid = screen.getAllByLabelText("Project ID").at(-1);
      expect(name.value).toBe("Existing saved project");
      expect(pid.value).toBe("CLIENT-ORIGINAL");
      await user.clear(name);
      await user.type(name, "Saved through HTTP");
      await user.clear(pid);
      await user.click(screen.getByRole("button", { name: "Save changes" }));
      await screen.findByText("Project updated.");
      await screen.findByText("Saved through HTTP");
      expect(await api(`/api/projects/${original.id}`)).toMatchObject({ name: "Saved through HTTP", pid: null });
      expect(db.projects.find(value => value.id === original.id)).toMatchObject({ name: "Saved through HTTP", pid: null });
      mounted.unmount();
      render(<Projects api={api} />);
      await screen.findByText("Saved through HTTP");
      expect(screen.getByText("Not assigned")).toBeTruthy();
    } finally {
      vi.unstubAllGlobals();
      await new Promise(resolve => server.close(resolve));
    }
  }, 15000);
  it("generates four canonical callback links and safe previews", async () => {
    const api = vi.fn().mockResolvedValue({ projects: [project] });
    render(<Projects api={api} />);
    await screen.findByText("Consumer study");
    fireEvent.click(screen.getByRole("button", { name: "Outcome links" }));
    expect(screen.getAllByRole("link", { name: "Preview ↗" })).toHaveLength(4);
    expect(screen.getByText(/\/tracking\/DEMO\/COMPLETE\?uid=/)).toBeTruthy();
  });
  for (const status of ["COMPLETE", "TERMINATE", "QUOTAFUL", "DISQUALIFY"])
    it(`records ${status} once across StrictMode replay`, async () => {
      const fetch = vi
        .fn()
        .mockResolvedValue(
          json({ record: { serial: "123" }, duplicate: false }),
        );
      vi.stubGlobal("fetch", fetch);
      render(
        <StrictMode>
          <Outcome
            pid="DEMO"
            status={status}
            search="?uid=u&transactionId=stable"
          />
        </StrictMode>,
      );
      await screen.findByText(/Your response has been recorded/);
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch.mock.calls[0][0]).toBe(
        `/redirect/DEMO/${status}?uid=u&transactionId=stable`,
      );
    });
  it("previews outcomes without recording", () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    window.history.replaceState({}, "", "/tracking/quotaful");
    render(<Router />);
    expect(
      screen.getByRole("heading", { name: "This survey is now full" }),
    ).toBeTruthy();
    expect(fetch).not.toHaveBeenCalled();
  });
  it("retries network errors with exactly the same transaction query", async () => {
    const fetch = vi
      .fn()
      .mockRejectedValueOnce(new TypeError("offline"))
      .mockResolvedValueOnce(
        json({ record: { serial: "123" }, duplicate: true }),
      );
    vi.stubGlobal("fetch", fetch);
    render(
      <Outcome
        pid="DEMO"
        status="COMPLETE"
        search="?uid=u&transactionId=stable"
      />,
    );
    await screen.findByRole("button", { name: "Try again" });
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    await screen.findByText(/already recorded/);
    expect(fetch.mock.calls[0][0]).toBe(fetch.mock.calls[1][0]);
  });
  it("reports validation/conflict errors without claiming successful recording", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          json(
            {
              error: {
                message:
                  "Transaction identifier already used with different data",
                requestId: "ref",
              },
            },
            409,
          ),
        ),
    );
    render(
      <Outcome
        pid="DEMO"
        status="COMPLETE"
        search="?uid=u&transactionId=stable"
      />,
    );
    expect(
      await screen.findByRole("heading", {
        name: "We could not record your outcome",
      }),
    ).toBeTruthy();
    expect(screen.queryByText(/Your response has been recorded/)).toBeNull();
    expect(screen.queryByRole("button", { name: "Try again" })).toBeNull();
  });
  it("handles unknown and malformed routes", () => {
    window.history.replaceState({}, "", "/tracking/%E0%A4%A/COMPLETE");
    render(<Router />);
    expect(
      screen.getByRole("heading", { name: "Page not found" }),
    ).toBeTruthy();
  });
});
