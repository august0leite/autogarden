import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("MusicWorkRegistry", function () {
  it("Should deploy the contract successfully", async function () {
    const registry = await ethers.deployContract("RegisterMusicWork");
    
    // Verifica se o contrato foi deployado
    expect(await registry.getAddress()).to.be.properAddress;
  });

  it("Should initialize workIdCounter to 0", async function () {
    const registry = await ethers.deployContract("RegisterMusicWork");

    // Verifica se o workIdCounter foi inicializado em 0
    expect(await registry.workIdCounter()).to.equal(0n);
  });

  describe("createWork", function () {
    it("Should create a work and return workId 0", async function () {
      const registry = await ethers.deployContract("RegisterMusicWork");
      const [user1] = await ethers.getSigners();

      // Cria a primeira obra
      await registry.connect(user1).createWork("My First Song", "QmHash123");

      // Verifica que o contador incrementou
      expect(await registry.workIdCounter()).to.equal(1n);
    });

    it("Should create work in Draft state (0)", async function () {
      const registry = await ethers.deployContract("RegisterMusicWork");
      const [user1] = await ethers.getSigners();

      await registry.connect(user1).createWork("My Song", "QmHash");

      // Pega a obra e verifica o estado
      const work = await registry.works(0);
      expect(work.state).to.equal(0); // Draft = 0
    });

    it("Should emit WorkCreated event", async function () {
      const registry = await ethers.deployContract("RegisterMusicWork");
      const [user1] = await ethers.getSigners();

      // Verifica se o evento foi emitido com os parâmetros corretos
      await expect(registry.connect(user1).createWork("My Song", "QmHash"))
        .to.emit(registry, "WorkCreated")
        .withArgs(0n, user1.address, "My Song");
    });

    it("Should set creator as the work owner", async function () {
      const registry = await ethers.deployContract("RegisterMusicWork");
      const [user1] = await ethers.getSigners();

      await registry.connect(user1).createWork("My Song", "QmHash");

      const work = await registry.works(0);
      expect(work.creator).to.equal(user1.address);
    });

    it("Should store metadata correctly", async function () {
      const registry = await ethers.deployContract("RegisterMusicWork");
      const [user1] = await ethers.getSigners();

      await registry.connect(user1).createWork("My Song Title", "QmMetadataHash");

      const work = await registry.works(0);
      expect(work.title).to.equal("My Song Title");
      expect(work.metadataHash).to.equal("QmMetadataHash");
    });

    it("Should create multiple works with sequential IDs", async function () {
      const registry = await ethers.deployContract("RegisterMusicWork");
      const [user1, user2] = await ethers.getSigners();

      await registry.connect(user1).createWork("Song 1", "Hash1");
      await registry.connect(user2).createWork("Song 2", "Hash2");

      expect(await registry.workIdCounter()).to.equal(2n);

      const work1 = await registry.works(0);
      const work2 = await registry.works(1);

      expect(work1.creator).to.equal(user1.address);
      expect(work2.creator).to.equal(user2.address);
    });
  });

  describe("registerWork", function () {
    it("Should register when splits are locked and sum is 100", async function () {
      const registry = await ethers.deployContract("RegisterMusicWork");
      const [user1] = await ethers.getSigners();

      await registry.connect(user1).createWork("Song", "Hash");
      await registry.connect(user1).lockSplits(0);

      await expect(registry.connect(user1).registerWork(0))
        .to.emit(registry, "WorkRegistered")
        .withArgs(0n, user1.address);

      const work = await registry.works(0);
      expect(work.state).to.equal(1); // Registered = 1
    });

    it("Should revert if splits are not locked", async function () {
      const registry = await ethers.deployContract("RegisterMusicWork");
      const [user1] = await ethers.getSigners();

      await registry.connect(user1).createWork("Song", "Hash");

      await expect(registry.connect(user1).registerWork(0)).to.be.revertedWith("splits not locked");
    });

    it("Should revert if caller is not an author", async function () {
      const registry = await ethers.deployContract("RegisterMusicWork");
      const [user1, user2] = await ethers.getSigners();

      await registry.connect(user1).createWork("Song", "Hash");
      await registry.connect(user1).lockSplits(0);

      await expect(registry.connect(user2).registerWork(0)).to.be.revertedWith("only author");
    });

    it("Should revert locking if sum is not 100", async function () {
      const registry = await ethers.deployContract("RegisterMusicWork");
      const [user1] = await ethers.getSigners();

      await registry.connect(user1).createWork("Song", "Hash");

      // Ajusta split do criador para 50, total passa a 50
      await registry.connect(user1).updateAuthorSplit(0, user1.address, 50);

      await expect(registry.connect(user1).lockSplits(0)).to.be.revertedWith("splits must equal 100");
    });
  });

  describe("authors & splits", function () {
    it("Should add a new author when creator rebalances to fit 100", async function () {
      const registry = await ethers.deployContract("RegisterMusicWork");
      const [user1, user2] = await ethers.getSigners();

      await registry.connect(user1).createWork("Song", "Hash");

      // Rebalance criador para 60
      await expect(registry.connect(user1).updateAuthorSplit(0, user1.address, 60)).to.emit(
        registry,
        "AuthorSplitUpdated",
      );

      await expect(registry.connect(user1).addAuthor(0, user2.address, 40))
        .to.emit(registry, "AuthorAdded")
        .withArgs(0n, user2.address, 40);

      expect(await registry.totalSplits(0)).to.equal(100n);
      expect(await registry.authorSplits(0, user2.address)).to.equal(40);

      const authors = await registry.getAuthors(0);
      expect(authors.length).to.equal(2);
      expect(authors[1]).to.equal(user2.address);

      describe("lockSplits", function () {
        it("Should emit SplitsLocked and set flag", async function () {
          const registry = await ethers.deployContract("RegisterMusicWork");
          const [user1] = await ethers.getSigners();

          await registry.connect(user1).createWork("Song", "Hash");

          await expect(registry.connect(user1).lockSplits(0))
            .to.emit(registry, "SplitsLocked")
            .withArgs(0n);

          const work = await registry.works(0);
          expect(work.splitsLocked).to.equal(true);
        });

        it("Should revert if caller is not an author", async function () {
          const registry = await ethers.deployContract("RegisterMusicWork");
          const [user1, user2] = await ethers.getSigners();

          await registry.connect(user1).createWork("Song", "Hash");

          await expect(registry.connect(user2).lockSplits(0)).to.be.revertedWith("only author");
        });
      });
    });

    it("Should revert addAuthor if caller is not creator", async function () {
      const registry = await ethers.deployContract("RegisterMusicWork");
      const [user1, user2] = await ethers.getSigners();

      await registry.connect(user1).createWork("Song", "Hash");

      await expect(registry.connect(user2).addAuthor(0, user2.address, 10)).to.be.revertedWith(
        "only creator can add author",
      );
    });

    it("Should revert addAuthor when duplicate", async function () {
      const registry = await ethers.deployContract("RegisterMusicWork");
      const [user1] = await ethers.getSigners();

      await registry.connect(user1).createWork("Song", "Hash");

      await expect(registry.connect(user1).addAuthor(0, user1.address, 10)).to.be.revertedWith(
        "author exists",
      );
    });

    it("Should revert addAuthor if total would exceed 100", async function () {
      const registry = await ethers.deployContract("RegisterMusicWork");
      const [user1, user2] = await ethers.getSigners();

      await registry.connect(user1).createWork("Song", "Hash");

      await expect(registry.connect(user1).addAuthor(0, user2.address, 1)).to.be.revertedWith(
        "splits exceed 100",
      );
    });

    it("Should update author split and emit event", async function () {
      const registry = await ethers.deployContract("RegisterMusicWork");
      const [user1] = await ethers.getSigners();

      await registry.connect(user1).createWork("Song", "Hash");

      await expect(registry.connect(user1).updateAuthorSplit(0, user1.address, 70))
        .to.emit(registry, "AuthorSplitUpdated")
        .withArgs(0n, user1.address, 70);

      expect(await registry.authorSplits(0, user1.address)).to.equal(70);
      expect(await registry.totalSplits(0)).to.equal(70n);
    });

    it("Should revert updateAuthorSplit if caller is not creator", async function () {
      const registry = await ethers.deployContract("RegisterMusicWork");
      const [user1, user2] = await ethers.getSigners();

      await registry.connect(user1).createWork("Song", "Hash");

      await expect(registry.connect(user2).updateAuthorSplit(0, user1.address, 90)).to.be.revertedWith(
        "only creator can update",
      );
    });

    it("Should revert updateAuthorSplit if author not found", async function () {
      const registry = await ethers.deployContract("RegisterMusicWork");
      const [user1, user2] = await ethers.getSigners();

      await registry.connect(user1).createWork("Song", "Hash");

      await expect(registry.connect(user1).updateAuthorSplit(0, user2.address, 10)).to.be.revertedWith(
        "author not found",
      );
    });

    it("Should block add/update after splits locked", async function () {
      const registry = await ethers.deployContract("RegisterMusicWork");
      const [user1, user2] = await ethers.getSigners();

      await registry.connect(user1).createWork("Song", "Hash");
      await registry.connect(user1).lockSplits(0);

      await expect(registry.connect(user1).addAuthor(0, user2.address, 1)).to.be.revertedWith(
        "splits locked",
      );

      await expect(registry.connect(user1).updateAuthorSplit(0, user1.address, 90)).to.be.revertedWith(
        "splits locked",
      );
    });
  });

  describe("disputeWork", function () {
    it("Should dispute a registered work and emit event", async function () {
      const registry = await ethers.deployContract("RegisterMusicWork");
      const [user1, user2] = await ethers.getSigners();

      await registry.connect(user1).createWork("Song", "Hash");
      await registry.connect(user1).lockSplits(0);
      await registry.connect(user1).registerWork(0);

      await expect(registry.connect(user2).disputeWork(0, "bad metadata"))
        .to.emit(registry, "WorkDisputed")
        .withArgs(0n, user2.address, "bad metadata");

      const work = await registry.works(0);
      expect(work.state).to.equal(2); // Disputed = 2
      expect(await registry.disputeReasons(0)).to.equal("bad metadata");
    });

    it("Should revert if work is not registered", async function () {
      const registry = await ethers.deployContract("RegisterMusicWork");
      const [user1, user2] = await ethers.getSigners();

      await registry.connect(user1).createWork("Song", "Hash");

      await expect(registry.connect(user2).disputeWork(0, "reason")).to.be.revertedWith(
        "work not registered",
      );
    });

    it("Should require non-empty reason", async function () {
      const registry = await ethers.deployContract("RegisterMusicWork");
      const [user1, user2] = await ethers.getSigners();

      await registry.connect(user1).createWork("Song", "Hash");
      await registry.connect(user1).lockSplits(0);
      await registry.connect(user1).registerWork(0);

      await expect(registry.connect(user2).disputeWork(0, "")).to.be.revertedWith("reason required");
    });
  });

  describe("finalizeWork", function () {
    it("Should finalize a registered work and emit event", async function () {
      const registry = await ethers.deployContract("RegisterMusicWork");
      const [user1] = await ethers.getSigners();

      await registry.connect(user1).createWork("Song", "Hash");
      await registry.connect(user1).lockSplits(0);
      await registry.connect(user1).registerWork(0);

      await expect(registry.connect(user1).finalizeWork(0))
        .to.emit(registry, "WorkFinalized")
        .withArgs(0n, user1.address);

      const work = await registry.works(0);
      expect(work.state).to.equal(3); // Finalized = 3
    });

    it("Should revert if caller is not an author", async function () {
      const registry = await ethers.deployContract("RegisterMusicWork");
      const [user1, user2] = await ethers.getSigners();

      await registry.connect(user1).createWork("Song", "Hash");
      await registry.connect(user1).lockSplits(0);
      await registry.connect(user1).registerWork(0);

      await expect(registry.connect(user2).finalizeWork(0)).to.be.revertedWith("only author");
    });

    it("Should revert if work is not registered", async function () {
      const registry = await ethers.deployContract("RegisterMusicWork");
      const [user1] = await ethers.getSigners();

      await registry.connect(user1).createWork("Song", "Hash");

      await expect(registry.connect(user1).finalizeWork(0)).to.be.revertedWith("work not registered");
    });

    it("Should block finalize after dispute", async function () {
      const registry = await ethers.deployContract("RegisterMusicWork");
      const [user1, user2] = await ethers.getSigners();

      await registry.connect(user1).createWork("Song", "Hash");
      await registry.connect(user1).lockSplits(0);
      await registry.connect(user1).registerWork(0);

      await registry.connect(user2).disputeWork(0, "reason");

      await expect(registry.connect(user1).finalizeWork(0)).to.be.revertedWith("work not registered");
    });
  });
});
    describe("createVersion", function () {
      it("Should create version inheriting splits and lock them", async function () {
        const registry = await ethers.deployContract("RegisterMusicWork");
        const [user1, user2] = await ethers.getSigners();

        await registry.connect(user1).createWork("Root", "HashRoot");
        await registry.connect(user1).lockSplits(0);
        await registry.connect(user1).registerWork(0);

        await expect(registry.connect(user2).createVersion(0, "Root v2", "HashV2"))
          .to.emit(registry, "VersionCreated")
          .withArgs(1n, 0n, user2.address);

        const version = await registry.works(1);
        expect(version.state).to.equal(0); // Draft
        expect(version.splitsLocked).to.equal(true);
        expect(await registry.rootOf(1)).to.equal(0);

        const authors = await registry.getAuthors(1);
        expect(authors.length).to.equal(1);
        expect(authors[0]).to.equal(user1.address);
        expect(await registry.authorSplits(1, user1.address)).to.equal(100);
        expect(await registry.totalSplits(1)).to.equal(100n);
      });

      it("Should revert if root not stable (not registered/finalized)", async function () {
        const registry = await ethers.deployContract("RegisterMusicWork");
        const [user1, user2] = await ethers.getSigners();

        await registry.connect(user1).createWork("Root", "HashRoot");

        await expect(registry.connect(user2).createVersion(0, "v2", "HashV2")).to.be.revertedWith(
          "root not stable",
        );
      });

      it("Should block split updates on version (inherited locked)", async function () {
        const registry = await ethers.deployContract("RegisterMusicWork");
        const [user1, user2] = await ethers.getSigners();

        await registry.connect(user1).createWork("Root", "HashRoot");
        await registry.connect(user1).lockSplits(0);
        await registry.connect(user1).registerWork(0);

        await registry.connect(user2).createVersion(0, "v2", "HashV2");

        await expect(registry.connect(user2).updateAuthorSplit(1, user1.address, 90)).to.be.revertedWith(
          "splits locked",
        );
      });

    it("Should clone splits from root when creating version of version", async function () {
      const registry = await ethers.deployContract("RegisterMusicWork");
      const [user1, user2, user3] = await ethers.getSigners();

      // Create root with user1 at 100%
      await registry.connect(user1).createWork("Root", "HashRoot");
      await registry.connect(user1).lockSplits(0);
      await registry.connect(user1).registerWork(0);

      // user2 creates v2 from root (inherits user1 as author)
      await registry.connect(user2).createVersion(0, "v2", "HashV2");
      
      // user1 (inherited author) registers v2
      await registry.connect(user1).registerWork(1);

      // user3 creates v3 from v2 (version of version)
      await registry.connect(user3).createVersion(1, "v3", "HashV3");

      // v3 should point to original root
      expect(await registry.rootOf(2)).to.equal(0);

      // v3 should inherit splits from root (user1 100%), not from v2
      const authorsV3 = await registry.getAuthors(2);
      expect(authorsV3.length).to.equal(1);
      expect(authorsV3[0]).to.equal(user1.address);
      expect(await registry.authorSplits(2, user1.address)).to.equal(100);
      expect(await registry.totalSplits(2)).to.equal(100n);
    });
  });

  describe("general validations", function () {
    it("Should not finalize from Draft", async function () {
      const registry = await ethers.deployContract("RegisterMusicWork");
      const [user1] = await ethers.getSigners();

      await registry.connect(user1).createWork("Song", "Hash");

      await expect(registry.connect(user1).finalizeWork(0)).to.be.revertedWith("work not registered");
    });

    it("Should not add author after register", async function () {
      const registry = await ethers.deployContract("RegisterMusicWork");
      const [user1, user2] = await ethers.getSigners();

      await registry.connect(user1).createWork("Song", "Hash");
      await registry.connect(user1).lockSplits(0);
      await registry.connect(user1).registerWork(0);

      await expect(registry.connect(user1).addAuthor(0, user2.address, 1)).to.be.revertedWith(
        "work not in draft",
      );
    });

    it("Should not update author after register", async function () {
      const registry = await ethers.deployContract("RegisterMusicWork");
      const [user1] = await ethers.getSigners();

      await registry.connect(user1).createWork("Song", "Hash");
      await registry.connect(user1).lockSplits(0);
      await registry.connect(user1).registerWork(0);

      await expect(registry.connect(user1).updateAuthorSplit(0, user1.address, 90)).to.be.revertedWith(
        "work not in draft",
      );
    });

    it("Should not register after finalized", async function () {
      const registry = await ethers.deployContract("RegisterMusicWork");
      const [user1] = await ethers.getSigners();

      await registry.connect(user1).createWork("Song", "Hash");
      await registry.connect(user1).lockSplits(0);
      await registry.connect(user1).registerWork(0);
      await registry.connect(user1).finalizeWork(0);

      await expect(registry.connect(user1).registerWork(0)).to.be.revertedWith("work not in draft");
    });
  });
