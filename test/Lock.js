const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("SupplyChainVerification - Project Contract", function () {
  let Project;
  let supplyChain;
  let admin;
  let manufacturer;
  let distributor;
  let retailer;
  let consumer;

  beforeEach(async function () {
    // Get signers
    [admin, manufacturer, distributor, retailer, consumer] = await ethers.getSigners();

    // Deploy contract
    Project = await ethers.getContractFactory("Project");
    supplyChain = await Project.deploy();
    await supplyChain.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right admin", async function () {
      expect(await supplyChain.admin()).to.equal(admin.address);
    });

    it("Should authorize admin by default", async function () {
      expect(await supplyChain.isAuthorized(admin.address)).to.be.true;
    });

    it("Should start with zero total products", async function () {
      expect(await supplyChain.totalProducts()).to.equal(0);
    });
  });

  describe("Participant Authorization", function () {
    it("Should allow admin to authorize participants", async function () {
      await supplyChain.authorizeParticipant(manufacturer.address);
      expect(await supplyChain.isAuthorized(manufacturer.address)).to.be.true;
    });

    it("Should emit ParticipantAuthorized event", async function () {
      await expect(supplyChain.authorizeParticipant(manufacturer.address))
        .to.emit(supplyChain, "ParticipantAuthorized")
        .withArgs(manufacturer.address);
    });

    it("Should not allow non-admin to authorize participants", async function () {
      await expect(
        supplyChain.connect(manufacturer).authorizeParticipant(distributor.address)
      ).to.be.revertedWith("Only admin can perform this action");
    });

    it("Should allow admin to revoke authorization", async function () {
      await supplyChain.authorizeParticipant(manufacturer.address);
      await supplyChain.revokeParticipant(manufacturer.address);
      expect(await supplyChain.isAuthorized(manufacturer.address)).to.be.false;
    });

    it("Should not allow revoking admin authorization", async function () {
      await expect(
        supplyChain.revokeParticipant(admin.address)
      ).to.be.revertedWith("Cannot revoke admin");
    });
  });

  describe("Product Registration", function () {
    beforeEach(async function () {
      await supplyChain.authorizeParticipant(manufacturer.address);
    });

    it("Should register a new product", async function () {
      await supplyChain.connect(manufacturer).registerProduct(
        1001,
        "Organic Coffee",
        "Ethiopian Farms"
      );

      const product = await supplyChain.getProduct(1001);
      expect(product.productId).to.equal(1001);
      expect(product.productName).to.equal("Organic Coffee");
      expect(product.manufacturer).to.equal("Ethiopian Farms");
      expect(product.currentStatus).to.equal(0); // Manufactured
      expect(product.exists).to.be.true;
    });

    it("Should emit ProductRegistered event", async function () {
      const tx = await supplyChain.connect(manufacturer).registerProduct(
        1001,
        "Organic Coffee",
        "Ethiopian Farms"
      );

      await expect(tx)
        .to.emit(supplyChain, "ProductRegistered")
        .withArgs(1001, "Organic Coffee", manufacturer.address, await time.latest());
    });

    it("Should increment total products", async function () {
      await supplyChain.connect(manufacturer).registerProduct(
        1001,
        "Product 1",
        "Manufacturer 1"
      );
      expect(await supplyChain.totalProducts()).to.equal(1);

      await supplyChain.connect(manufacturer).registerProduct(
        1002,
        "Product 2",
        "Manufacturer 2"
      );
      expect(await supplyChain.totalProducts()).to.equal(2);
    });

    it("Should not allow duplicate product IDs", async function () {
      await supplyChain.connect(manufacturer).registerProduct(
        1001,
        "Product 1",
        "Manufacturer"
      );

      await expect(
        supplyChain.connect(manufacturer).registerProduct(
          1001,
          "Product 2",
          "Manufacturer"
        )
      ).to.be.revertedWith("Product already registered");
    });

    it("Should not allow unauthorized addresses to register", async function () {
      await expect(
        supplyChain.connect(consumer).registerProduct(
          1001,
          "Product",
          "Manufacturer"
        )
      ).to.be.revertedWith("Not authorized");
    });

    it("Should not allow empty product name", async function () {
      await expect(
        supplyChain.connect(manufacturer).registerProduct(1001, "", "Manufacturer")
      ).to.be.revertedWith("Product name cannot be empty");
    });

    it("Should not allow zero product ID", async function () {
      await expect(
        supplyChain.connect(manufacturer).registerProduct(0, "Product", "Manufacturer")
      ).to.be.revertedWith("Invalid product ID");
    });
  });

  describe("Status Updates", function () {
    beforeEach(async function () {
      await supplyChain.authorizeParticipant(manufacturer.address);
      await supplyChain.authorizeParticipant(distributor.address);
      
      await supplyChain.connect(manufacturer).registerProduct(
        1001,
        "Organic Coffee",
        "Ethiopian Farms"
      );
    });

    it("Should update product status", async function () {
      await supplyChain.connect(manufacturer).updateStatus(
        1001,
        1, // InTransit
        "Warehouse A"
      );

      const product = await supplyChain.getProduct(1001);
      expect(product.currentStatus).to.equal(1);
    });

    it("Should emit StatusUpdated event", async function () {
      const tx = await supplyChain.connect(manufacturer).updateStatus(
        1001,
        1,
        "Warehouse A"
      );

      await expect(tx)
        .to.emit(supplyChain, "StatusUpdated")
        .withArgs(1001, 1, "Warehouse A", await time.latest(), manufacturer.address);
    });

    it("Should add status to product history", async function () {
      await supplyChain.connect(manufacturer).updateStatus(1001, 1, "Location 1");
      await supplyChain.connect(distributor).updateStatus(1001, 2, "Location 2");

      const historyCount = await supplyChain.getHistoryCount(1001);
      expect(historyCount).to.equal(3); // Initial + 2 updates
    });

    it("Should not allow backward status progression", async function () {
      await supplyChain.connect(manufacturer).updateStatus(1001, 2, "Location");

      await expect(
        supplyChain.connect(manufacturer).updateStatus(1001, 1, "Location")
      ).to.be.revertedWith("Invalid status progression");
    });

    it("Should not allow empty location", async function () {
      await expect(
        supplyChain.connect(manufacturer).updateStatus(1001, 1, "")
      ).to.be.revertedWith("Location cannot be empty");
    });

    it("Should not allow updates for non-existent products", async function () {
      await expect(
        supplyChain.connect(manufacturer).updateStatus(9999, 1, "Location")
      ).to.be.revertedWith("Product does not exist");
    });
  });

  describe("Ownership Transfer", function () {
    beforeEach(async function () {
      await supplyChain.authorizeParticipant(manufacturer.address);
      await supplyChain.authorizeParticipant(distributor.address);
      
      await supplyChain.connect(manufacturer).registerProduct(
        1001,
        "Product",
        "Manufacturer"
      );
    });

    it("Should transfer ownership", async function () {
      await supplyChain.connect(manufacturer).transferOwnership(
        1001,
        distributor.address
      );

      const currentOwner = await supplyChain.getCurrentOwner(1001);
      expect(currentOwner).to.equal(distributor.address);
    });

    it("Should emit OwnershipTransferred event", async function () {
      const tx = await supplyChain.connect(manufacturer).transferOwnership(
        1001,
        distributor.address
      );

      await expect(tx)
        .to.emit(supplyChain, "OwnershipTransferred")
        .withArgs(1001, manufacturer.address, distributor.address, await time.latest());
    });

    it("Should not allow non-owner to transfer", async function () {
      await expect(
        supplyChain.connect(distributor).transferOwnership(1001, retailer.address)
      ).to.be.revertedWith("You are not the current owner");
    });

    it("Should not allow transfer to unauthorized address", async function () {
      await expect(
        supplyChain.connect(manufacturer).transferOwnership(1001, consumer.address)
      ).to.be.revertedWith("New owner must be authorized");
    });

    it("Should not allow transfer to self", async function () {
      await expect(
        supplyChain.connect(manufacturer).transferOwnership(1001, manufacturer.address)
      ).to.be.revertedWith("Cannot transfer to yourself");
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      await supplyChain.authorizeParticipant(manufacturer.address);
      await supplyChain.connect(manufacturer).registerProduct(
        1001,
        "Test Product",
        "Test Manufacturer"
      );
    });

    it("Should get product details", async function () {
      const product = await supplyChain.getProduct(1001);
      expect(product.productName).to.equal("Test Product");
      expect(product.manufacturer).to.equal("Test Manufacturer");
    });

    it("Should get product status", async function () {
      const status = await supplyChain.getProductStatus(1001);
      expect(status).to.equal(0); // Manufactured
    });

    it("Should get current owner", async function () {
      const owner = await supplyChain.getCurrentOwner(1001);
      expect(owner).to.equal(manufacturer.address);
    });

    it("Should verify product", async function () {
      const [exists, name, status] = await supplyChain.verifyProduct(1001);
      expect(exists).to.be.true;
      expect(name).to.equal("Test Product");
      expect(status).to.equal(0);
    });

    it("Should return false for non-existent product", async function () {
      const [exists] = await supplyChain.verifyProduct(9999);
      expect(exists).to.be.false;
    });

    it("Should get product history", async function () {
      await supplyChain.connect(manufacturer).updateStatus(1001, 1, "Location 1");
      const history = await supplyChain.getProductHistory(1001);
      expect(history.length).to.equal(2); // Initial + 1 update
    });
  });

  describe("Edge Cases", function () {
    it("Should handle multiple products", async function () {
      await supplyChain.authorizeParticipant(manufacturer.address);

      for (let i = 1; i <= 5; i++) {
        await supplyChain.connect(manufacturer).registerProduct(
          i,
          `Product ${i}`,
          "Manufacturer"
        );
      }

      expect(await supplyChain.totalProducts()).to.equal(5);
    });

    it("



