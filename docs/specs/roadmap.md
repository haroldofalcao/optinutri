# OptiNutri — Roadmap

## Princípio de priorização

> Produto funcional e polido antes de infraestrutura nova.

As fases estão ordenadas por impacto direto na experiência de quem usa o sistema hoje. Funcionalidades de backend e integração (Firestore, SBNPE) vêm depois que o produto estiver sólido na frente.

---

## Fase 1 — Interface & UX

**Marco**: O programa parece um produto profissional. Qualquer profissional de saúde consegue usá-lo sem treinamento.

### 1.1 Auditoria visual
- Listar inconsistências visuais entre as telas (cores, espaçamentos, tipografia)
- Identificar elementos que quebram em telas menores (tablet/mobile)
- Documentar pontos de confusão relatados ou observados

### 1.2 Sistema de design consistente
- Padronizar paleta de cores usando as variáveis já definidas no Tailwind
- Padronizar tamanhos de fonte e hierarquia tipográfica
- Garantir que todos os botões, inputs e cards sigam o mesmo padrão visual

### 1.3 Navegação
- Revisar a barra de navegação — itens claros e com estado ativo visível
- Garantir que o usuário sempre saiba em qual página está
- Melhorar o fluxo entre Dashboard → Calculador → Resultado

### 1.4 Responsividade
- Testar e corrigir layout em tablet (principal dispositivo de uso clínico)
- Garantir que tabelas de resultado não quebrem em telas menores
- Menu mobile funcional

### 1.5 Feedback ao usuário
- Estados de carregamento visíveis (skeleton ou spinner) onde necessário
- Mensagens de erro claras em linguagem simples (não "Error 422")
- Confirmações visuais de ações (salvar, excluir)

---

## Fase 2 — Calculador & Otimizador

**Marco**: O fluxo de cálculo é intuitivo, o resultado é fácil de entender, e o feedback quando não há solução é útil clinicamente.

### 2.1 Formulário de entrada
- Revisar labels e tooltips dos campos de restrição (kcal, proteína, volume)
- Adicionar referências clínicas como dica (ex: "ASPEN recomenda 25–30 kcal/kg/dia")
- Validação em tempo real com feedback imediato (não só no submit)

### 2.2 Filtros de fórmula
- Melhorar UX dos filtros de via (Enteral/Central/Periférica) e tipo de emulsão
- Tornar o seletor de fórmulas fixas mais claro
- Indicar visualmente quantas fórmulas estão disponíveis com os filtros ativos

### 2.3 Apresentação do resultado
- Redesenhar o card de resultado para destacar: custo total, calorias totais, proteína total
- Mostrar as fórmulas selecionadas em formato de lista clara (nome, volume, custo)
- Gráfico de composição nutricional do resultado (macro breakdown)

### 2.4 Resultado inviável (Infeasible)
- Quando não há solução, mostrar **qual restrição está impedindo** (já existe em `violation_details`)
- Sugerir ajuste ao usuário ("Reduza o mínimo de proteína para X ou aumente o volume máximo para Y")
- Distinguir claramente "sem solução" de "erro técnico"

### 2.5 Histórico de cálculos
- Permitir ver e recarregar cálculos anteriores da sessão
- Comparar dois resultados lado a lado

---

## Fase 3 — Gestão de Fórmulas

**Marco**: O usuário consegue gerenciar seu próprio catálogo de fórmulas sem precisar editar JSON.

### 3.1 Visualização do catálogo
- Tabela de fórmulas com filtros, busca e ordenação
- Indicar claramente quais são fórmulas base (padrão) e quais são customizadas pelo usuário
- Mostrar campos relevantes: nome, fabricante, via, kcal, proteína, custo

### 3.2 Adicionar / editar fórmula
- Formulário com todos os campos de `Formula` (tipado, validado com Zod)
- Validação clínica básica (ex: não permitir osmolaridade negativa)
- Preview do impacto nutricional antes de salvar

### 3.3 Customização de preço
- Permitir que o usuário informe o preço praticado na sua instituição sem alterar a fórmula base
- Manter o preço base original visível para comparação

### 3.4 Importação via Excel
- Importar lista de fórmulas a partir de planilha `.xlsx`
- Template para download com as colunas corretas
- Validação linha a linha com feedback de erros

### 3.5 Ocultar / restaurar fórmulas
- Soft-delete: marcar como `hidden` para não aparecer no calculador
- Opção de restaurar fórmulas ocultadas
- Separar "oculto pelo usuário" de "inativo na base global"

---

## Fase 4 — Exportação e Relatório

**Marco**: O resultado do cálculo pode ser impresso ou enviado ao prontuário.

### 4.1 Relatório PDF da prescrição
- Gerar PDF com: data, restrições informadas, fórmulas selecionadas, totais nutricionais, custo
- Cabeçalho com espaço para nome do profissional e instituição
- Rodapé com aviso legal ("Ferramenta de suporte — decisão final é do profissional")

### 4.2 Exportação Excel
- Exportar o resultado para `.xlsx` para registro ou inclusão em outros sistemas
- Incluir breakdown completo: volume por fórmula, custo, macro por fórmula

### 4.3 Link compartilhável
- Gerar URL que recria os parâmetros do cálculo (via query string ou hash)
- Permite compartilhar um cálculo específico com um colega sem precisar refazer

---

## Fase 5 — Persistência em Nuvem

**Marco**: As fórmulas e preferências do usuário não se perdem ao trocar de dispositivo.

### 5.1 Migração de fórmulas para Firestore
- Substituir `localStorage` (`atomWithStorage`) por leitura/escrita no Firestore
- Estrutura: `users/{userId}/formulas/{formulaId}`
- Manter retrocompatibilidade: migrar dados do localStorage na primeira sessão autenticada

### 5.2 Sincronização de preferências
- Preços customizados e fórmulas ocultas persistidos por usuário no Firestore
- Sincronização automática entre dispositivos

### 5.3 Histórico permanente
- Histórico de otimizações já vai para Firestore (`services/db.ts`)
- Melhorar visualização: filtro por data, busca, paginação

---

## Fase 6 — Integração SBNPE *(fase futura)*

**Marco**: O OptiNutri está integrado ao portal da SBNPE e o acesso é controlado automaticamente pela adimplência.

> Esta fase depende de alinhamento técnico com a equipe da SBNPE. Não iniciar sem definir o protocolo de integração com eles.

### 6.1 Definição do protocolo
- Levantar com a SBNPE: OAuth 2.0? Token JWT? Redirect com cookie de sessão?
- Mapear como verificar status de adimplência (API? Campo no token?)
- Definir o fluxo de acesso: usuário entra pelo portal da SBNPE → é redirecionado ao OptiNutri autenticado

### 6.2 Implementação da autenticação
- Firebase Auth como intermediário: recebe token da SBNPE, cria sessão Firebase
- Bloquear acesso se adimplência estiver inativa
- Tela de acesso negado com instruções para regularizar na SBNPE

### 6.3 Embedding no portal da SBNPE
- OptiNutri acessível dentro da área do sócio no site da SBNPE
- Ajustar branding se necessário (logo da SBNPE no cabeçalho)

### 6.4 Testes de aceitação
- Validar fluxo completo com conta de teste da SBNPE
- Testar bloqueio automático quando adimplência expira
- Auditoria de segurança antes do go-live
