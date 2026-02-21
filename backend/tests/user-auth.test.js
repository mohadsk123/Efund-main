jest.mock("bcryptjs", () => ({
  hash: jest.fn(async () => "hashedpw"),
  compare: jest.fn(async (p, h) => p === "validpassword"),
}));

const request = require("supertest");

describe("User email/password auth flow", () => {
  let app, User;

  beforeAll(() => {
    process.env.ADMIN_EMAILS = "";
    process.env.ADMIN_WALLETS = "";
    const server = require("../server");
    app = server.app;
    User = server.User;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("register success", async () => {
    jest.spyOn(User, "findOne").mockResolvedValue(null);
    jest.spyOn(User.prototype, "save").mockResolvedValue();

    const res = await request(app)
      .post("/api/auth/register")
      .set("X-Requested-With", "XMLHttpRequest")
      .send({ email: "user@example.com", password: "validpassword" })
      .expect(201);

    expect(res.body).toHaveProperty("message", "Registered");
  });

  test("register duplicate email", async () => {
    jest.spyOn(User, "findOne").mockResolvedValue({ _id: "1" });

    const res = await request(app)
      .post("/api/auth/register")
      .set("X-Requested-With", "XMLHttpRequest")
      .send({ email: "user@example.com", password: "validpassword" })
      .expect(409);

    expect(res.body).toHaveProperty("message", "Email already registered");
  });

  test("register short password", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .set("X-Requested-With", "XMLHttpRequest")
      .send({ email: "user@example.com", password: "123" })
      .expect(400);
    expect(res.body).toHaveProperty("message");
  });

  test("login success", async () => {
    const mockUser = {
      _id: "u1",
      email: "user@example.com",
      passwordHash: "hashedpw",
      token: "",
      role: "user",
      save: jest.fn(async () => {}),
    };
    jest.spyOn(User, "findOne").mockResolvedValue(mockUser);

    const res = await request(app)
      .post("/api/auth/login")
      .set("X-Requested-With", "XMLHttpRequest")
      .send({ email: "user@example.com", password: "validpassword" })
      .expect(200);

    expect(res.body).toHaveProperty("token");
    expect(res.body).toHaveProperty("role", "user");
  });

  test("login wrong password", async () => {
    const mockUser = {
      _id: "u1",
      email: "user@example.com",
      passwordHash: "hashedpw",
    };
    jest.spyOn(User, "findOne").mockResolvedValue(mockUser);
    const bcrypt = require("bcryptjs");
    bcrypt.compare = jest.fn(async () => false);

    const res = await request(app)
      .post("/api/auth/login")
      .set("X-Requested-With", "XMLHttpRequest")
      .send({ email: "user@example.com", password: "wrong" })
      .expect(401);

    expect(res.body).toHaveProperty("message", "Invalid credentials");
  });

  test("validate requires token", async () => {
    await request(app).get("/api/auth/validate").expect(401);
  });

  test("admin endpoint forbidden for user token", async () => {
    const mockUser = {
      _id: "u1",
      email: "user@example.com",
      token: "t1",
      walletAddress: null,
      role: "user",
      save: jest.fn(async () => {}),
    };
    jest.spyOn(User, "findOne").mockImplementation(async (q) => {
      if (q && q.token === "t1") return mockUser;
      return null;
    });

    await request(app)
      .get("/api/admin/users")
      .set("Authorization", "Bearer t1")
      .expect(403);
  });
});
