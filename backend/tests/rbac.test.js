const request = require("supertest");
jest.mock("ethers", () => {
  return {
    ethers: {
      verifyMessage: (msg, sig) => {
        return "0xCA24cE91E18f5A4646e25DB91c01b7d5F21cf775";
      },
    },
  };
});

describe("RBAC and admin wallet login", () => {
  let app, computeRoleForUser, User;
  const ADMIN = "0xCA24cE91E18f5A4646e25DB91c01b7d5F21cf775";

  beforeAll(() => {
    process.env.ADMIN_EMAILS = "";
    process.env.ADMIN_WALLETS = "";
    const server = require("../server");
    app = server.app;
    computeRoleForUser = server.computeRoleForUser;
    User = server.User;
  });

  test("computeRoleForUser returns admin for hardcoded admin wallet", () => {
    const user = { email: ADMIN.toLowerCase(), walletAddress: ADMIN };
    expect(computeRoleForUser(user)).toBe("admin");
  });

  test("wallet-login returns role=admin for hardcoded admin wallet", async () => {
    jest.spyOn(User, "findOne").mockResolvedValue(null);
    jest.spyOn(User.prototype, "save").mockResolvedValue();

    const res = await request(app)
      .post("/api/auth/wallet-login")
      .set("X-Requested-With", "XMLHttpRequest")
      .send({ address: ADMIN, signature: "0xdeadbeef" })
      .expect(200);

    expect(res.body).toHaveProperty("role", "admin");
    expect(res.body).toHaveProperty("token");
    expect(res.body).toHaveProperty("email", ADMIN.toLowerCase());
  });

  test("wallet-login fails if signature doesn't match", async () => {
    // Override mock temporarily
    const ethers = require("ethers");
    const orig = ethers.ethers.verifyMessage;
    ethers.ethers.verifyMessage = () => "0x1111111111111111111111111111111111111111";

    const res = await request(app)
      .post("/api/auth/wallet-login")
      .set("X-Requested-With", "XMLHttpRequest")
      .send({ address: ADMIN, signature: "0xdeadbeef" })
      .expect(401);

    ethers.ethers.verifyMessage = orig;
    expect(res.body).toHaveProperty("message");
  });
});
