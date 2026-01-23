import { expect } from "chai";
import { network } from "hardhat";
import { RegisterMusicWork } from "../types/ethers-contracts";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

const { ethers } = await network.connect();

describe("RegisterMusicWork - Invariant Tests", function () {
  let registry: RegisterMusicWork;
  let owner: HardhatEthersSigner;
  let actors: HardhatEthersSigner[];

  before(async function () {
    // Deploy apenas uma vez
    [owner, ...actors] = await ethers.getSigners();
  });

  beforeEach(async function () {
    // Redeploy rápido para cada teste ter estado limpo
    registry = await ethers.deployContract("RegisterMusicWork") as unknown as RegisterMusicWork;
  });

  /**
   * INVARIANT 1: totalSplits nunca deve exceder 100
   */
  describe("Invariant: totalSplits <= 100", function () {
    it("should never exceed 100 after adding authors", async function () {
      const workId = await registry.workIdCounter();
      await registry.connect(actors[0]).createWork("Song", "Hash");
      
      await registry.connect(actors[0]).updateAuthorSplit(workId, actors[0].address, 50);
      let total = await registry.totalSplits(workId);
      expect(total).to.be.lte(100);
      
      await registry.connect(actors[0]).addAuthor(workId, actors[1].address, 30);
      total = await registry.totalSplits(workId);
      expect(total).to.be.lte(100);
      
      await registry.connect(actors[0]).addAuthor(workId, actors[2].address, 20);
      total = await registry.totalSplits(workId);
      expect(total).to.be.lte(100);
    });

    it("should never exceed 100 after updating splits", async function () {
      const workId = await registry.workIdCounter();
      await registry.connect(actors[0]).createWork("Song", "Hash");
      
      for (let percent = 100; percent > 0; percent -= 10) {
        await registry.connect(actors[0]).updateAuthorSplit(workId, actors[0].address, percent);
        const total = await registry.totalSplits(workId);
        expect(total).to.be.lte(100);
      }
    });

    it("should prevent exceeding 100 when adding author", async function () {
      const workId = await registry.workIdCounter();
      await registry.connect(actors[0]).createWork("Song", "Hash");
      
      // Creator has 100%, trying to add 1% should fail
      await expect(
        registry.connect(actors[0]).addAuthor(workId, actors[1].address, 1)
      ).to.be.revertedWith("splits exceed 100");
    });
  });

  /**
   * INVARIANT 2: Soma dos splits individuais = totalSplits
   */
  describe("Invariant: sum(authorSplits) == totalSplits", function () {
    it("should always match with single author", async function () {
      const workId = await registry.workIdCounter();
      await registry.connect(actors[0]).createWork("Song", "Hash");
      
      const authors = await registry.getAuthors(workId);
      let sum = 0n;
      for (const author of authors) {
        sum += await registry.authorSplits(workId, author);
      }
      
      const totalSplits = await registry.totalSplits(workId);
      expect(sum).to.equal(totalSplits);
    });

    it("should always match with multiple authors", async function () {
      const workId = await registry.workIdCounter();
      await registry.connect(actors[0]).createWork("Song", "Hash");
      
      await registry.connect(actors[0]).updateAuthorSplit(workId, actors[0].address, 40);
      await registry.connect(actors[0]).addAuthor(workId, actors[1].address, 30);
      await registry.connect(actors[0]).addAuthor(workId, actors[2].address, 30);
      
      const authors = await registry.getAuthors(workId);
      let sum = 0n;
      for (const author of authors) {
        sum += await registry.authorSplits(workId, author);
      }
      
      const totalSplits = await registry.totalSplits(workId);
      expect(sum).to.equal(totalSplits);
      expect(sum).to.equal(100);
    });

    it("should remain consistent after updates", async function () {
      const workId = await registry.workIdCounter();
      await registry.connect(actors[0]).createWork("Song", "Hash");
      
      await registry.connect(actors[0]).updateAuthorSplit(workId, actors[0].address, 60);
      await registry.connect(actors[0]).addAuthor(workId, actors[1].address, 40);
      
      // Update - primeiro reduz, depois aumenta
      await registry.connect(actors[0]).updateAuthorSplit(workId, actors[1].address, 30);
      await registry.connect(actors[0]).updateAuthorSplit(workId, actors[0].address, 70);
      
      const authors = await registry.getAuthors(workId);
      let sum = 0n;
      for (const author of authors) {
        sum += await registry.authorSplits(workId, author);
      }
      
      expect(sum).to.equal(await registry.totalSplits(workId));
    });
  });

  /**
   * INVARIANT 3: Obra com splits locked deve ter totalSplits == 100
   */
  describe("Invariant: locked splits => totalSplits == 100", function () {
    it("should require 100% to lock", async function () {
      const workId = await registry.workIdCounter();
      await registry.connect(actors[0]).createWork("Song", "Hash");
      
      await registry.connect(actors[0]).updateAuthorSplit(workId, actors[0].address, 90);
      
      await expect(
        registry.connect(actors[0]).lockSplits(workId)
      ).to.be.revertedWith("splits must equal 100");
    });

    it("should be 100% when locked", async function () {
      const workId = await registry.workIdCounter();
      await registry.connect(actors[0]).createWork("Song", "Hash");
      
      await registry.connect(actors[0]).lockSplits(workId);
      
      const work = await registry.works(workId);
      expect(work.splitsLocked).to.be.true;
      expect(await registry.totalSplits(workId)).to.equal(100);
    });
  });

  /**
   * INVARIANT 4: Toda obra tem pelo menos um autor
   */
  describe("Invariant: every work has >= 1 author", function () {
    it("should have creator as initial author", async function () {
      const workId = await registry.workIdCounter();
      await registry.connect(actors[0]).createWork("Song", "Hash");
      
      const authors = await registry.getAuthors(workId);
      expect(authors.length).to.be.gte(1);
      expect(authors[0]).to.equal(actors[0].address);
    });
  });

  /**
   * INVARIANT 5: Criador é sempre autor
   */
  describe("Invariant: creator is always an author", function () {
    it("should include creator after adding other authors", async function () {
      const workId = await registry.workIdCounter();
      await registry.connect(actors[0]).createWork("Song", "Hash");
      
      await registry.connect(actors[0]).updateAuthorSplit(workId, actors[0].address, 50);
      await registry.connect(actors[0]).addAuthor(workId, actors[1].address, 50);
      
      const work = await registry.works(workId);
      const isCreatorAuthor = await registry.isAuthor(workId, work.creator);
      expect(isCreatorAuthor).to.be.true;
    });
  });

  /**
   * INVARIANT 6: Nenhum autor tem split == 0
   */
  describe("Invariant: no author has 0% split", function () {
    it("should reject adding author with 0%", async function () {
      const workId = await registry.workIdCounter();
      await registry.connect(actors[0]).createWork("Song", "Hash");
      
      await expect(
        registry.connect(actors[0]).addAuthor(workId, actors[1].address, 0)
      ).to.be.revertedWith("percent must be > 0");
    });

    it("should reject updating to 0%", async function () {
      const workId = await registry.workIdCounter();
      await registry.connect(actors[0]).createWork("Song", "Hash");
      
      await expect(
        registry.connect(actors[0]).updateAuthorSplit(workId, actors[0].address, 0)
      ).to.be.revertedWith("percent must be > 0");
    });

    it("should maintain minimum 1% for all authors", async function () {
      const workId = await registry.workIdCounter();
      await registry.connect(actors[0]).createWork("Song", "Hash");
      
      await registry.connect(actors[0]).updateAuthorSplit(workId, actors[0].address, 99);
      await registry.connect(actors[0]).addAuthor(workId, actors[1].address, 1);
      
      const authors = await registry.getAuthors(workId);
      for (const author of authors) {
        const split = await registry.authorSplits(workId, author);
        expect(split).to.be.gt(0);
      }
    });
  });

  /**
   * INVARIANT 7: Obra registrada deve ter splits locked e totalSplits == 100
   */
  describe("Invariant: registered work => locked && totalSplits == 100", function () {
    it("should have locked splits and 100% when registered", async function () {
      const workId = await registry.workIdCounter();
      await registry.connect(actors[0]).createWork("Song", "Hash");
      
      await registry.connect(actors[0]).lockSplits(workId);
      await registry.connect(actors[0]).registerWork(workId);
      
      const work = await registry.works(workId);
      expect(work.state).to.equal(1n); // Registered
      expect(work.splitsLocked).to.be.true;
      expect(await registry.totalSplits(workId)).to.equal(100);
    });

    it("should maintain invariant after finalization", async function () {
      const workId = await registry.workIdCounter();
      await registry.connect(actors[0]).createWork("Song", "Hash");
      
      await registry.connect(actors[0]).lockSplits(workId);
      await registry.connect(actors[0]).registerWork(workId);
      await registry.connect(actors[0]).finalizeWork(workId);
      
      const work = await registry.works(workId);
      expect(work.splitsLocked).to.be.true;
      expect(await registry.totalSplits(workId)).to.equal(100);
    });
  });

  /**
   * TESTE COMBINADO: Múltiplos cenários
   */
  describe("Combined Scenarios", function () {
    it("should maintain all invariants through complete workflow", async function () {
      const workId = await registry.workIdCounter();
      await registry.connect(actors[0]).createWork("Song", "Hash");
      
      // Check initial state
      let total = await registry.totalSplits(workId);
      expect(total).to.equal(100);
      
      // Add authors
      await registry.connect(actors[0]).updateAuthorSplit(workId, actors[0].address, 40);
      await registry.connect(actors[0]).addAuthor(workId, actors[1].address, 30);
      await registry.connect(actors[0]).addAuthor(workId, actors[2].address, 30);
      
      // Verify sum matches total
      const authors = await registry.getAuthors(workId);
      let sum = 0n;
      for (const author of authors) {
        const split = await registry.authorSplits(workId, author);
        expect(split).to.be.gt(0);
        sum += split;
      }
      expect(sum).to.equal(100);
      expect(sum).to.equal(await registry.totalSplits(workId));
      
      // Lock and register
      await registry.connect(actors[0]).lockSplits(workId);
      await registry.connect(actors[0]).registerWork(workId);
      
      // Final checks
      const work = await registry.works(workId);
      expect(work.splitsLocked).to.be.true;
      expect(await registry.totalSplits(workId)).to.equal(100);
    });
  });
});
