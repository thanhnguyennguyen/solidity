const ERC721MockToken =  artifacts.require("./ERC721Mock.sol");
const TOKEN1 = 111111;
const TOKEN2 = 222222;

contract("ERC721MockToken", function(accounts) {
  let firstAccount = accounts[0];
  let secondAccount = accounts[1];
  let thirdAccount  = accounts[2];
  let instance1;
  let instance2;

  beforeEach(async() => {
    instance1 = await ERC721MockToken.new();
    await instance1.mint(firstAccount, TOKEN1, {from: firstAccount});
  });

  describe("mint a new token", async() => {
    it("check owner", async() => {
        let owner = await instance1.ownerOf(TOKEN1);
        assert.equal(firstAccount, owner);
    }); 

    it("check balance", async() => {
        let balance = await instance1.balanceOf(firstAccount);
        assert.equal(1, balance);
    });
  });

  describe("burn new token", async() => {
    it("not owner", async() => {
        try {
            await instance1.burn(TOKEN1, {from: secondAccount});
            fail("Should throw an error");
        } catch (error) {
            assert(error);
        }
    });
    
    it("owner burn his token", async() => {
        try {
            await instance1.burn(TOKEN1, {from: firstAccount});
            let balance = await instance1.balanceOf(firstAccount);
            assert.equal(0, balance);
        } catch (error) {
            fail("Should not throw any error");
        }
    });

    describe("test approval", async() => {
        it("firstAccount approves for secondAccount spend TOKEN 1", async() => {
            // firstAccount approves for secondAccount spend TOKEN 1
            await instance1.approve(secondAccount, TOKEN1, {from: firstAccount});
            let addr = await instance1.getApproved(TOKEN1);
            assert.equal(secondAccount, addr);
        }); 
    
        it("set approval for all", async() => {
            // firstAccount set approval to secondAccont for all his tokens
            await instance1.setApprovalForAll(secondAccount, true, {from: firstAccount});
            let isApprovedForAll = await instance1.isApprovedForAll(firstAccount, secondAccount);
            assert.equal(true, isApprovedForAll);

            isApprovedForAll = await instance1.isApprovedForAll(firstAccount, thirdAccount);
            assert.equal(false, isApprovedForAll);
        });
      });
  });

  describe("transfer tokens", async() => {
    it("test transferFrom: firstAccount transfers TOKEN1 to secondAccount", async() => {
        await instance1.transferFrom(firstAccount, secondAccount, TOKEN1, {from: firstAccount});
        let owner = await instance1.ownerOf(TOKEN1);
        assert.equal(secondAccount, owner);
    }); 

    it("test transferFrom: firstAccount approves for thirdAccount to transfer TOKEN1, then thirdAccount transfers TOKEN1 to secondAccount", async() => {
        await instance1.approve(thirdAccount, TOKEN1, {from: firstAccount});
        await instance1.transferFrom(firstAccount, secondAccount, TOKEN1, {from: thirdAccount});
        let owner = await instance1.ownerOf(TOKEN1);
        assert.equal(secondAccount, owner);
    });

    it("test transferFrom FAIL: thirdAccount transfers TOKEN1 to secondAccount", async() => {
        /**
         * thirdAccount transfers TOKEN1 to secondAccount
         * it will fail since thirdAccount is not owner of TOKEN1, also don't have approval to transfer it
         */
        try {
            await instance1.transferFrom(firstAccount, secondAccount, TOKEN1, {from: thirdAccount});
            fail("Should throw an error"); 
        } catch (error) {
            assert(error);
        }
    });

    it("test safeTransferFrom", async() => {
        /**
         * instance2 is a contract
         * firstAccount transfers TOKEN1 to this contract
         */
        instance2 = await ERC721MockToken.new();
        await instance1.transferFrom(firstAccount, instance2.address, TOKEN1, {from: firstAccount});
        let owner = await instance1.ownerOf(TOKEN1);
        assert.equal( instance2.address, owner);
    });
  });

});
