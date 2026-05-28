/**
 * ABI do contrato de música (apenas eventos relevantes para indexação)
 *
 * Evento WorkRegistered é emitido quando uma obra é registrada on-chain
 */
export const MUSIC_CONTRACT_ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "workId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "creator",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "title",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "metadataHash",
        type: "string",
      },
    ],
    name: "WorkRegistered",
    type: "event",
  },
  // Adicionar outros eventos conforme necessário
  // ex: WorkStateChanged, SplitUpdated, etc.
] as const;
