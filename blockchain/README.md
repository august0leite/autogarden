# audiofy


Deve existir um contrato MusicWorkRegistry - ok

 Deve existir um identificador único workId -ok

 O contrato deve ser determinístico e event-driven -ok
 
 O contrato deve rejeitar estados inválidos -ok

🎼 Criação da Obra

 Usuário deve conseguir criar uma obra em estado Draft -ok

 Criador da obra deve ser automaticamente incluído como autor -ok

 Obra criada deve emitir evento WorkCreated -ok

 Obra deve armazenar metadata básica (title, optional hash) -ok

 Uma obra criada ainda não pode ser registrada -ok

👥 Autores & Splits

 Usuário deve conseguir adicionar autores à obra em Draft -ok

 Cada autor deve possuir um percentual de royalties -ok

 A soma dos splits deve ser exatamente 100% -ok

 Não deve ser possível adicionar autor duplicado -ok

 Não deve ser possível remover o criador da obra -ok

 Splits só podem ser alterados enquanto a obra estiver em Draft -ok

🔒 Lock de Splits

 Usuário deve conseguir finalizar splits -ok

 Ao finalizar splits, eles devem se tornar imutáveis -ok

 Finalização de splits deve emitir evento SplitsLocked -ok

 Após lock, splits não podem ser alterados -ok

📝 Registro da Obra

 Usuário deve conseguir registrar a obra -ok

 Apenas um autor pode registrar a obra -ok
 Registro só é permitido se:

 Splits estiverem travados -ok

 Soma dos splits = 100% -ok

 Registro muda estado para Registered -ok 

 Registro deve emitir evento WorkRegistered -ok

⚖️ Contestação

 Qualquer endereço deve conseguir contestar uma obra -ok

 Contestação só é possível se a obra estiver Registered -ok

 Contestação muda estado para Disputed -ok

 Contestação deve registrar um motivo (metadata) -ok

 Contestação deve emitir evento WorkDisputed -ok

✅ Finalização

 Usuário autorizado deve conseguir finalizar uma obra -ok

 Obra só pode ser finalizada se:

 Não estiver em disputa -ok

 Finalização muda estado para Finalized -ok

 Após finalização, a obra se torna imutável -ok

 Finalização deve emitir evento WorkFinalized -ok

🔁 Versões da Obra

 Usuário deve conseguir criar uma versão da obra -ok

 Versão deve apontar para uma obra raiz -ok

 Versão deve herdar os splits da obra raiz -ok

 Criação de versão deve emitir evento VersionCreated -ok

🔍 Validações Gerais

 Não deve ser possível pular estados (ex: Draft → Finalized) -ok

 Não deve ser possível editar obra fora de Draft -ok

 Funções devem falhar com revert claro -ok

 Estados inválidos devem ser bloqueados -ok

📡 Eventos (API)

 WorkCreated

 SplitsLocked

 WorkRegistered

 WorkDisputed

 WorkFinalized

 VersionCreated

🧪 Testes (Checklist de Qualidade)

 Cada requisito acima deve ter pelo menos 1 teste

 Testes devem cobrir:

 happy path

 edge cases

 reverts esperados

 Nenhum estado inválido deve passar

🎯 Objetivo Final do Contrato

 Contrato funciona como Single Source of Truth

 Contrato pode ser indexado apenas por eventos

 Contrato não distribui dinheiro

 Contrato é legível, auditável e extensível