import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect({
    network: "localhost",
    chainType: "l1",
  });

  const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  
  const contract = await ethers.getContractAt(
    "RegisterMusicWork",
    contractAddress
  );

  console.log("🎵 Criando obra musical...");
  console.log("📍 Contrato:", contractAddress);

  const tx = await contract.createWork(
    "Entra no Trem",
    "ipfs://QmFakeHash123"
  );

  console.log("⏳ Aguardando confirmação...");
  await tx.wait();
  console.log("✅ Obra criada com sucesso!");

  const work = await contract.works(0);
  console.log("\n📄 Dados da obra:");
  console.log("  Creator:", work.creator);
  console.log("  Title:", work.title);
  console.log("  State:", work.state, "(0=Draft, 1=Registered, 2=Disputed, 3=Finalized)");
  console.log("  Metadata Hash:", work.metadataHash);
  console.log("  Splits Locked:", work.splitsLocked);

  // Verificando autores
  const authors = await contract.getAuthors(0);
  console.log("\n👥 Autores:", authors);

  const authorSplit = await contract.authorSplits(0, authors[0]);
  console.log("  Split do criador:", authorSplit.toString() + "%");

  const totalSplits = await contract.totalSplits(0);
  console.log("  Total de splits:", totalSplits.toString() + "%");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
