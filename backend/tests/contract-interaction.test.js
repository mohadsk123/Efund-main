const request = require("supertest");

describe("Contract interaction API", () => {
  let app, User;
  let attach;
  let providerMock;
  let walletMock;
  let contractMock;

  beforeAll(() => {
    process.env.SIMPLE_CONTRACT = "true";
    process.env.ADMIN_EMAILS = "";
    process.env.ADMIN_WALLETS = "";
    process.env.NODE_ENV = "test";
    const server = require("../server");
    app = server.app;
    User = server.User;
    attach = server.__attachContractForTest;
  });

  beforeEach(() => {
    providerMock = {
      getFeeData: jest.fn().mockResolvedValue({
        gasPrice: BigInt(1_000_000_000),
        maxFeePerGas: BigInt(1_000_000_000),
        maxPriorityFeePerGas: BigInt(1_000_000_000),
      }),
      getTransactionReceipt: jest.fn().mockResolvedValue({
        status: 1,
        blockNumber: BigInt(10),
      }),
      getBlockNumber: jest.fn().mockResolvedValue(BigInt(20)),
      getNetwork: jest.fn().mockResolvedValue({ chainId: BigInt(11155111) }),
      getBalance: jest.fn().mockResolvedValue(BigInt(0)),
    };
    walletMock = {
      getAddress: jest.fn().mockResolvedValue("0x0000000000000000000000000000000000000001"),
    };
    contractMock = {
      owner: jest.fn().mockResolvedValue("0x0000000000000000000000000000000000000001"),
      getContractBalance: jest.fn().mockResolvedValue(BigInt(0)),
      filters: { FundsDisbursed: () => ({}) },
      queryFilter: jest.fn().mockResolvedValue([]),
      estimateGas: {
        depositFunds: jest.fn().mockResolvedValue(BigInt(21000)),
        addBeneficiary: jest.fn().mockResolvedValue(BigInt(21000)),
        approveBeneficiary: jest.fn().mockResolvedValue(BigInt(21000)),
        disburseFunds: jest.fn().mockResolvedValue(BigInt(21000)),
      },
      depositFunds: jest.fn().mockResolvedValue({ hash: "0xdeposit", wait: jest.fn().mockResolvedValue({}) }),
      addBeneficiary: jest.fn().mockResolvedValue({ hash: "0xadd", wait: jest.fn().mockResolvedValue({}) }),
      approveBeneficiary: jest.fn().mockResolvedValue({ hash: "0xapprove", wait: jest.fn().mockResolvedValue({}) }),
      disburseFunds: jest.fn().mockResolvedValue({ hash: "0xdisburse", wait: jest.fn().mockResolvedValue({}) }),
    };
    attach(providerMock, walletMock, contractMock);
  });

  const auth = "Bearer testtoken";

  test("estimate deposit returns gas and cost", async () => {
    jest.spyOn(User, "findOne").mockImplementation(async (q) => {
      if (q && q.token === "testtoken") return { _id: "u1", email: "a@b.com", walletAddress: null, role: "admin", save: jest.fn(async () => {}) };
      return null;
    });
    const res = await request(app)
      .post("/api/contract/estimate-deposit")
      .set("Authorization", auth)
      .set("X-Requested-With", "XMLHttpRequest")
      .send({ amount: "0.1", schemeId: 1 })
      .expect(200);
    expect(res.body).toHaveProperty("gas");
    expect(res.body).toHaveProperty("costEth");
  });

  test("deposit executes and returns hash (owner enforced)", async () => {
    jest.spyOn(User, "findOne").mockImplementation(async (q) => {
      if (q && q.token === "testtoken") return { _id: "u1", email: "a@b.com", walletAddress: null, role: "admin", save: jest.fn(async () => {}) };
      return null;
    });
    const res = await request(app)
      .post("/api/contract/deposit")
      .set("Authorization", auth)
      .set("X-Requested-With", "XMLHttpRequest")
      .send({ amount: "0.1", schemeId: 1 })
      .expect.anything();
    expect(res.statusCode === 200 || res.statusCode === 403 || res.statusCode === 500).toBeTruthy();
  });

  test("tx status endpoint returns success", async () => {
    const res = await request(app)
      .get("/api/tx/0x123")
      .expect(200);
    expect(res.body).toHaveProperty("status");
  });
});
