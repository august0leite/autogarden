import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("RegisterMusicWorkModule", (m) => {
  const registry = m.contract("RegisterMusicWork");

  return { registry };
});
