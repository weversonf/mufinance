# Direção visual — MuFinance React

## Referência adotada como especificação-base

Esta versão do MuFinance toma o dashboard Finance & Banking de Vireo como **ground truth visual** para a composição, hierarquia, espaçamento e comportamento de dashboard. A implementação reproduz a lógica de navegação lateral, topo de utilidades, cartões KPI, gráfico de fluxo de caixa, cartão de saldo, gastos por categoria, contas, orçamento, transações e compromissos, mas adapta o conteúdo para português do Brasil, moeda BRL e identidade Mu Finance.

O objetivo é manter a sensação de produto financeiro premium da referência — fundo frio e claro, superfícies brancas, sombras muito suaves, cantos arredondados, chips de estado e blocos densos de informação — sem copiar textos, marcas ou ativos de terceiros. O logotipo já existente do MuFinance continua sendo o elemento de marca principal.

## Design Movement

**Soft Swiss Fintech / editorial dashboard.** Uma interpretação precisa e silenciosa de um painel financeiro moderno: estrutura suíça, tipografia funcional, contraste editorial e pequenos sinais de humanidade para tornar números mais fáceis de ler.

## Core Principles

1. **Clareza em camadas:** cada grupo de dados tem um título curto, um valor dominante e uma leitura secundária discreta.
2. **Calma operacional:** superfícies claras, bordas quase invisíveis e sombras difusas deixam a interface confiável sem parecer fria.
3. **Ritmo de dados:** gráficos, barras, chips e microvariações usam movimento curto para explicar mudanças, nunca para distrair.
4. **Identidade brasileira:** todo o conteúdo de produto é em português, com BRL, formato de moeda local e vocabulário de carteira pessoal.

## Color Philosophy

O canvas usa um azul-cinza muito claro para afastar o dashboard do branco puro e criar uma base de foco. O verde esmeralda é o sinal proprietário de avanço e saldo positivo; azul claro, lavanda, pêssego e amarelo aparecem apenas como códigos semânticos para separar categorias. O azul-marinho do logo e dos textos mantém o vínculo com a identidade atual do MuFinance, enquanto um gradiente violeta-esmeralda é reservado ao cartão financeiro para criar um ponto focal raro.

## Layout Paradigm

No desktop, a página é dividida em **sidebar persistente de 248px** e um canvas fluido. O conteúdo começa com uma barra superior de utilidades e segue para um cabeçalho de página com ações. O corpo usa uma grade assimétrica: os módulos de leitura ampla ocupam duas colunas e os módulos de decisão rápida ocupam uma coluna. Em mobile, a sidebar se converte em navegação inferior, o cabeçalho ganha ações compactas e o gráfico de categorias aparece logo abaixo dos cards de saldo.

## Signature Elements

- Um **rastro de maré**: linhas e áreas de gráfico com curvas suaves e gradientes quase transparentes, remetendo ao farol do logotipo sem desenhar ilustrações decorativas.
- **Pílulas de estado** com setas e variação percentual para tornar performance legível em um olhar.
- Um **cartão de conta em gradiente profundo**, tratado como objeto físico dentro da composição, com textura visual suave e controles de transferência/deposito.

## Interaction Philosophy

Cada clique deve confirmar intenção sem interromper o fluxo: links de navegação mudam o estado ativo com transição curta, filtros atualizam o período do gráfico e botões de ação exibem feedback em toast. Hover desloca levemente cards e revela contexto; foco de teclado permanece visível. Ações que ainda não estão conectadas a dados reais sinalizam isso com uma mensagem clara, sem simular sucesso persistente.

## Animation

O dashboard entra em cena em cascata: sidebar e topo aparecem primeiro, cabeçalho depois, e os módulos do corpo seguem com atraso de 40–60ms. Gráficos revelam suas linhas por scaleX e opacidade, barras crescem apenas no eixo vertical e números fazem uma contagem curta ao montar. Hover usa transform e sombra, com duração entre 160ms e 240ms. Tudo fica estático para `prefers-reduced-motion: reduce`.

## Typography System

Usar **DM Sans** para toda a interface, com peso 400 para apoio, 500 para labels e 700 para títulos e números. Títulos principais usam tracking levemente negativo, valores monetários usam peso 700 e números tabulares. O wordmark fica em uma combinação de peso 700 e espaçamento de -0.04em, acompanhado do ícone do farol.

## Brand Essence

**MuFinance é a carteira visual para quem quer transformar movimentações em decisões tranquilas, unindo clareza de dados e um jeito mais humano de cuidar do dinheiro.** Personalidade: atento, seguro, otimista.

## Brand Voice

Headlines são diretas e orientadas a progresso; CTAs usam verbos de ação simples; microcopy descreve o estado sem jargão bancário. Exemplos: “Seu dinheiro está encontrando um ritmo melhor.” e “Organizar agora, respirar depois.”

## Wordmark & Logo

O wordmark usa a marca gráfica original do farol em tamanho visível, com “Mu” em peso 700 e “Finance” em peso 500. O símbolo não deve ser reduzido a um favicon minúsculo dentro da interface: ele aparece no cabeçalho da sidebar e em estados de navegação relevantes.

## Signature Brand Color

**Farol Esmeralda — `#138A72`.** Um verde fechado, levemente azulado, que traduz orientação e avanço sem cair no verde genérico de sucesso.

## Style Decisions

- A fidelidade à referência prevalece sobre variações estilísticas: não usar tema escuro como padrão, neon, roxos dominantes ou painéis centralizados genéricos.
- A versão inicial usa dados locais demonstrativos do produto, deixando explícita a separação entre visualização e integração futura com dados reais.
- A sidebar deve atuar como âncora permanente do produto: wordmark MuFinance visível, símbolo do farol, navegação ativa em Farol Esmeralda e hierarquia navy/esmeralda mesmo quando o dashboard estiver denso.
- O Farol Esmeralda `#138A72` fica reservado para ação primária, movimento positivo, navegação ativa e destaques de progresso; lavanda, azul, pêssego e amarelo permanecem códigos semânticos secundários.
- A leitura editorial segue a regra título curto, valor dominante e contexto discreto; o rastro de maré aparece como curva leve em cabeçalhos, resumos e gráficos, sem adicionar decoração concorrente.
