const FundDistribution = artifacts.require("FundDistribution");

contract("FundDistribution", (accounts) => {
  const admin = accounts[0];
  const beneficiary = accounts[1];

  it("adds scheme with correct fields", async () => {
    const instance = await FundDistribution.new({ from: admin });
    const name = "Healthcare Aid";
    const budget = web3.utils.toWei("1", "ether");
    const deadline = Math.floor(Date.now() / 1000) + 3600;
    const tx = await instance.addScheme(name, budget, deadline, { from: admin });
    assert.ok(tx.receipt.status, "Transaction should succeed");
    const count = await instance.schemeCount();
    assert.equal(Number(count), 1, "schemeCount should be 1");
    const s = await instance.schemes(1);
    assert.equal(s.name, name, "Scheme name mismatch");
    assert.equal(s.budget.toString(), budget, "Scheme budget mismatch");
    assert.equal(Number(s.deadline), deadline, "Scheme deadline mismatch");
    assert.equal(s.isActive, true, "Scheme should be active");
  });

  it("beneficiary applies to scheme", async () => {
    const instance = await FundDistribution.new({ from: admin });
    const deadline = Math.floor(Date.now() / 1000) + 3600;
    await instance.addScheme("Education Support", web3.utils.toWei("0.5", "ether"), deadline, { from: admin });
    const ipfsHash = "ipfs://TESTCID";
    const tx = await instance.applyToScheme(1, ipfsHash, { from: beneficiary });
    assert.ok(tx.receipt.status, "Application tx should succeed");
    const count = await instance.getApplicationsCount(1);
    assert.equal(Number(count), 1, "Applications count should be 1");
    const a = await instance.getApplication(1, 0);
    assert.equal(a.applicant, beneficiary, "Applicant address mismatch");
    assert.equal(a.ipfsHash, ipfsHash, "IPFS hash mismatch");
  });

  it("rejects applying after deadline", async () => {
    const instance = await FundDistribution.new({ from: admin });
    const soon = Math.floor(Date.now() / 1000) + 1; // 1s in future
    await instance.addScheme("Soon Expire", web3.utils.toWei("0.1", "ether"), soon, { from: admin });
    // Increase EVM time and mine a block to pass the deadline
    const sendAsync = (method, params = []) =>
      new Promise((resolve, reject) =>
        // @ts-ignore
        web3.currentProvider.send({ jsonrpc: "2.0", id: Date.now(), method, params }, (err, result) => {
          if (err) reject(err); else resolve(result);
        })
      );
    await sendAsync("evm_increaseTime", [5]);
    await sendAsync("evm_mine");
    try {
      await instance.applyToScheme(1, "ipfs://X", { from: beneficiary });
      assert.fail("Expected revert for closed application");
    } catch (e) {
      assert(
        e.message.includes("Application closed"),
        `Expected 'Application closed' revert, got: ${e.message}`
      );
    }
  });

  it("only owner can add scheme", async () => {
    const instance = await FundDistribution.new({ from: admin });
    const deadline = Math.floor(Date.now() / 1000) + 3600;
    try {
      await instance.addScheme("Invalid", web3.utils.toWei("0.1", "ether"), deadline, { from: beneficiary });
      assert.fail("Expected revert for non-owner");
    } catch (e) {
      assert(
        e.message.includes("Only owner"),
        `Expected 'Only owner' revert, got: ${e.message}`
      );
    }
  });
});
