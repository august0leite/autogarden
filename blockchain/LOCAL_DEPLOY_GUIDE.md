# 🚀 Guia: Deploy e Teste do Contrato Local

## 1️⃣ Inicie o node local do Hardhat

Em um terminal separado, execute:

```bash
npx hardhat node
```

**Deixe esse terminal rodando!** Você verá:
- ✅ Servidor HTTP rodando em `http://127.0.0.1:8545/`
- ✅ 20 contas de teste com 10000 ETH cada
- ✅ Logs de todas as transações

---

## 2️⃣ Deploy do Contrato

Em **outro terminal**, faça o deploy:

```bash
yarn hardhat ignition deploy ignition/modules/RegisterMusicWork.ts --network localhost
```

✅ **Confirme o deploy:**
- Verifique o arquivo criado: `ignition/deployments/chain-31337/deployed_addresses.json`
- Endereço do contrato: `0x5FbDB2315678afecb367f032d93F642f64180aa3`

---

## 3️⃣ Interaja com o Contrato

Execute o script de teste:

```bash
npx hardhat run scripts/interact.ts --network localhost
```

**Você deve ver:**
```
🎵 Criando obra musical...
📍 Contrato: 0x5FbDB2315678afecb367f032d93F642f64180aa3
⏳ Aguardando confirmação...
✅ Obra criada com sucesso!

📄 Dados da obra:
  Creator: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
  Title: Entra no Trem
  State: 0 (0=Draft, 1=Registered, 2=Disputed, 3=Finalized)
  Metadata Hash: ipfs://QmFakeHash123
  Splits Locked: false

👥 Autores: [ '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' ]
  Split do criador: 100%
  Total de splits: 100%
```

---

## ✅ Verificação Rápida

### Como saber se está funcionando?

1. **Node rodando?**
   ```bash
   curl -X POST http://localhost:8545 \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
   ```

2. **Contrato deployado?**
   ```bash
   cat ignition/deployments/chain-31337/deployed_addresses.json
   ```

3. **Teste rápido:**
   ```bash
   npx hardhat run scripts/interact.ts --network localhost
   ```

---

## 🔧 Troubleshooting

### ❌ "Connection refused"
→ O node não está rodando. Execute `npx hardhat node` em um terminal separado.

### ❌ "Contract not deployed"
→ Faça o deploy novamente: `yarn hardhat ignition deploy ignition/modules/RegisterMusicWork.ts --network localhost`

### ❌ "Invalid contract address"
→ Verifique o endereço em `ignition/deployments/chain-31337/deployed_addresses.json`

---

## 🎯 Próximos Passos

Agora que o contrato está funcionando localmente, você pode:

1. **Testar funcionalidades adicionais** (adicionar autores, registrar obra, etc.)
2. **Deploy em testnet** (Sepolia, por exemplo)
3. **Integrar com frontend**

---

## 📝 Status Atual

✅ Contrato deployado: `0x5FbDB2315678afecb367f032d93F642f64180aa3`  
✅ Network: localhost (chain-31337)  
✅ Script de teste: `scripts/interact.ts`  
