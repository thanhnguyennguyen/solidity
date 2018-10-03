const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const ERC20Mock =  artifacts.require("./ERC20Mock.sol");

contract("ERC20Mock", function(accounts) {
  let firstAccount = accounts[0];
  let secondAccount = accounts[1];
  let thirdAccount  = accounts[2];
  let ERC20MockInstance;

  beforeEach(async() => {
    ERC20MockInstance = await ERC20Mock.new(firstAccount, "ERC20 Token", "ERC20", 1000);
  });

  describe("test ERC20 constructor", () => {

    it("test token", async() => {
      let name = await ERC20MockInstance.name.call();
      // test token name
      assert.equal("ERC20 Token", name);
    });

    it("test symbol", async() => {
      let symbol = await ERC20MockInstance.symbol.call();
      // test token symbol
      assert.equal("ERC20", symbol);
    });

    it("test totalsupply", async() => {
      let totalSupply = await ERC20MockInstance.totalSupply.call();
      // test initial total supply 
      assert.equal(1000, totalSupply);
    });

    it("test balance", async() => {
      let balance = await ERC20MockInstance.balanceOf.call(firstAccount);
      // test balance of owner
      assert.equal(1000, balance);
    });
    
  });
  
  describe("test ERC20 transactions", () => {
    it("test transfer from the firstAccount to the second account", async() => {
      // firstAccount: 1000 ERC20
      // secondAccount = thirdAccount : 0 ERC20
      await ERC20MockInstance.transfer(secondAccount, 5, {from: firstAccount});
      let balance1 = await ERC20MockInstance.balanceOf.call(firstAccount);
      let balance2 = await ERC20MockInstance.balanceOf.call(secondAccount);
      assert.equal(995, balance1);
      assert.equal(5, balance2);
    });

    it("test approve, allowance, transferFrom", async() => {
      // firstAccount: 1000 ERC20
      // secondAccount = thirdAccount : 0 ERC20

      // approve secondAccount 20 tokens from FirstAccount
      await ERC20MockInstance.approve(secondAccount, 20, {from: firstAccount});
      // check remaining allowance
      let allowance = await ERC20MockInstance.allowance.call(firstAccount, secondAccount);
      assert.equal(20, allowance);

      // secondAccount send to thirdAccount 8 ERC20 tokens from firstAccount
      await ERC20MockInstance.transferFrom(firstAccount, thirdAccount, 8, {from: secondAccount});

      // check remaining allowance
      allowance = await ERC20MockInstance.allowance.call(firstAccount, secondAccount);
      assert.equal(12, allowance);

      // check balance of firstAccount
      let balance1 = await ERC20MockInstance.balanceOf.call(firstAccount);

      assert.equal(992, balance1);

      // check balance of thirdAccount
      let balance3 = await ERC20MockInstance.balanceOf.call(thirdAccount);
      assert.equal(8, balance3);
    });
  });


  describe("test ERC20: change allownce", () => {

    it("test ERC20: increase allowance", async() => {
      // firstAccount: 1000 ERC20
      // secondAccount = thirdAccount : 0 ERC20

      // approve secondAccount 20 tokens from FirstAccount
      await ERC20MockInstance.approve(secondAccount, 20, {from: firstAccount});
      // check remaining allowance
      let allowance = await ERC20MockInstance.allowance.call(firstAccount, secondAccount);
      assert.equal(20, allowance);

      // increase allowance up to 30
      await ERC20MockInstance.increaseAllowance(secondAccount, 10, {from: firstAccount});
      // check remaining allowance
      let newAllowance = await ERC20MockInstance.allowance.call(firstAccount, secondAccount);
      assert.equal(30, newAllowance);
    });


    
    it("test ERC20: decrease allowance", async() => {
      // firstAccount: 1000 ERC20
      // secondAccount = thirdAccount : 0 ERC20

      // approve secondAccount 20 tokens from FirstAccount
      await ERC20MockInstance.approve(secondAccount, 20, {from: firstAccount});
      // check remaining allowance
      let allowance = await ERC20MockInstance.allowance.call(firstAccount, secondAccount);
      assert.equal(20, allowance);

      // decrease allowance by 5
      await ERC20MockInstance.decreaseAllowance(secondAccount, 5, {from: firstAccount});
      // check remaining allowance
      let newAllowance = await ERC20MockInstance.allowance.call(firstAccount, secondAccount);
      assert.equal(15, newAllowance);
    });
    
  });

  describe("test ERC20: token burn", () => {

    it("reject null address", async() => {
      try {
        await ERC20MockInstance.burn(ZERO_ADDRESS, 0);
        fail('Exception not thrown');
      } catch (error) {
        assert(error);
      }
    });

    it("burn zero token", async() => {
      try {
        await ERC20MockInstance.burn(firstAccount, 0);
        fail('Exception not thrown');
      } catch (error) {
        assert(error);
      }
    });

    it("burn amount of tokens which is more than total supply", async() => {
        try {
          await ERC20MockInstance.burn(firstAccount, 1100);
          fail('Exception not thrown');
        } catch (error) {
          assert(error);
        }
    });

    it("burn amount of tokens which is more than balance", async() => {
      try {
        await ERC20MockInstance.burn(secondAccount, 1);
        fail('Exception not thrown');
      } catch (error) {
        assert(error);
      }
  });

    it("burn some tokens", async() => {
      await ERC20MockInstance.burn(firstAccount, 5);
      let totalSupply = await ERC20MockInstance.totalSupply.call();
      // test  total supply 
      assert.equal(995, totalSupply);

      let balance = await ERC20MockInstance.balanceOf.call(firstAccount);
      // test balance 
      assert.equal(995, balance);
    });
  });

  describe("test ERC20: token burnFrom", () => {
    it("firstAccount approve secondAccount to spend 20 tokens, then secondAccount burnFrom  firstAccount 5 tokens", async() => {
      // firstAccount: 1000 ERC20
      // secondAccount = thirdAccount : 0 ERC20

      // approve secondAccount 20 tokens from FirstAccount
      await ERC20MockInstance.approve(secondAccount, 20, {from: firstAccount});
      // check remaining allowance
      let allowance = await ERC20MockInstance.allowance.call(firstAccount, secondAccount);
      assert.equal(20, allowance);

      await ERC20MockInstance.burnFrom(firstAccount, 5, {from: secondAccount});
      let totalSupply = await ERC20MockInstance.totalSupply.call();
      // test  total supply 
      assert.equal(995, totalSupply);

      let balance = await ERC20MockInstance.balanceOf.call(firstAccount);
      // test balance 
      assert.equal(995, balance);

      // check remaining allowance
      let newAllowance = await ERC20MockInstance.allowance.call(firstAccount, secondAccount);
      assert.equal(15, newAllowance);
    });
  });
});
