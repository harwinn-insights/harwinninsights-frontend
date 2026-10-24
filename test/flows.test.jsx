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
const trackingConfig = { paramMap: { uid: "uid", transactionId: "transactionId", username: "username", inTime: "inTime" } };
const withTrackingConfig = fetch => vi.fn((path, options) => path === "/api/tracking/config" ? Promise.resolve(json(trackingConfig)) : fetch(path, options));
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

  function managementApi(initial=[project]) {
    let projects=initial.map(p=>({...p}));
    const company={id:'550e8400-e29b-41d4-a716-446655440001',code:'CLIENT',name:'Client company'};
    projects=projects.map(p=>({...p,companyId:company.id,company}));
    const api=vi.fn(async(path,opts)=>{
      if(path==='/api/companies')return {companies:[company]};
      if(path==='/api/users')return {users:[{id:'user',email:'user@example.test',role:'USER',active:true}]};
      if(path.endsWith('/links'))return {links:Object.fromEntries(['COMPLETE','TERMINATE','QUOTAFUL','DISQUALIFY'].map(s=>[s,'/redirect/company/'+company.id+'/'+s])),paramMap:{uid:'uid',transactionId:'transactionId'}};
      if(opts?.method==='POST')return projects.push({...project,...opts.body});
      if(opts?.method==='PATCH'){projects=projects.map(p=>({...p,...opts.body}));return projects[0];}
      return {projects};
    });return {api,company};
  }
  it('creates projects under the selected company with distinct contract fields',async()=>{
    const {api,company}=managementApi([]);render(<Projects api={api} companyId={company.id}/>);const user=userEvent.setup();
    await user.click(await screen.findByRole('button',{name:'Add Project'}));
    await user.type(screen.getByLabelText('Project ID'),'NEW');await user.type(screen.getByLabelText('Project Name'),'Study');
    await user.click(screen.getByRole('button',{name:'Add project'}));await screen.findByText('Project created.');
    expect(api).toHaveBeenCalledWith('/api/projects',expect.objectContaining({method:'POST',body:{companyId:company.id,pid:'NEW',name:'Study'}}));
  });
  it('edits optional external IDs and retains the internal UUID',async()=>{
    const {api,company}=managementApi();render(<Projects api={api} companyId={company.id}/>);const user=userEvent.setup();await screen.findByText('Consumer study');
    await user.click(screen.getByRole('button',{name:'Edit'}));await user.clear(screen.getAllByLabelText('Project ID').at(-1));
    await user.click(screen.getByRole('button',{name:'Save changes'}));await screen.findByText('Project updated.');
    expect(api).toHaveBeenCalledWith('/api/projects/'+project.id,expect.objectContaining({body:{name:project.name,pid:null,active:true}}));
    expect(screen.getByText(project.id)).toBeTruthy();
  });
  it('shows company links once with an explicit per-request project parameter',async()=>{
    const {api,company}=managementApi();render(<Projects api={api} companyId={company.id}/>);
    await screen.findByText(new URL('/redirect/company/'+company.id+'/COMPLETE',window.location.origin).href);
    expect(screen.getByText(new URL('/redirect/company/'+company.id+'/DISQUALIFY',window.location.origin).href)).toBeTruthy();
  });
  it('shows assigned users projects without company or assignment management',async()=>{
    const {api}=managementApi();render(<Projects api={api} user={{id:'user',role:'USER'}}/>);await screen.findByText('Consumer study');
    expect(screen.queryByRole('button',{name:'Add project'})).toBeNull();expect(screen.queryByText('Manage existing users')).toBeNull();
    expect(api.mock.calls.some(([p])=>p==='/api/users'||p==='/api/companies')).toBe(false);
  });
  it('keeps edit values on conflicts and prevents repeated pending saves',async()=>{
    const {api,company}=managementApi();let finish;const pending=new Promise(resolve=>{finish=resolve;});const wrapped=vi.fn((path,opts)=>opts?.method==='PATCH'?pending:api(path,opts));
    render(<Projects api={wrapped} companyId={company.id}/>);await screen.findByText('Consumer study');fireEvent.click(screen.getByRole('button',{name:'Edit'}));
    const form=screen.getByRole('button',{name:'Save changes'}).closest('form');fireEvent.submit(form);fireEvent.submit(form);
    expect(wrapped.mock.calls.filter(([,o])=>o?.method==='PATCH')).toHaveLength(1);finish(project);await screen.findByText('Project updated.');
  });
  it('retains deletion confirmation and reports backend history conflicts',async()=>{
    const {api,company}=managementApi();const wrapped=(path,opts)=>opts?.method==='DELETE'?Promise.reject(new Error('Project has tracking history')):api(path,opts);
    render(<Projects api={wrapped} companyId={company.id}/>);await screen.findByText('Consumer study');fireEvent.click(screen.getByRole('button',{name:'Delete'}));fireEvent.click(screen.getByRole('button',{name:'Confirm deletion'}));
    await screen.findByText('Project has tracking history');expect(screen.getByText('Consumer study')).toBeTruthy();
  });
  for (const status of ["COMPLETE", "TERMINATE", "QUOTAFUL", "DISQUALIFY"])
    it(`records ${status} once across StrictMode replay`, async () => {
      const fetch = vi
        .fn()
        .mockResolvedValue(
          json({ success: true, duplicate: false }),
        );
      vi.stubGlobal("fetch", withTrackingConfig(fetch));
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
        json({ success: true, duplicate: true }),
      );
    vi.stubGlobal("fetch", withTrackingConfig(fetch));
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
      withTrackingConfig(vi
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
        )),
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
