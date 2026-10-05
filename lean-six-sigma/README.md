# UpSkills — Formação Lean 6 Sigma

Redesign estático da landing page, inspirado no `referencia.html` fornecido no projeto. A referência foi preservada sem alterações.

## Abrir

Abra `dist/index.html` diretamente ou sirva a pasta `dist` com `python3 -m http.server 4173 --directory dist`.

- `dist/index.html`: conteúdo e estrutura.
- `dist/styles.css`: visual e responsividade.
- `dist/script.js`: parâmetros UTM e formulário.
- `dist/fonts.css` e `dist/assets`: fontes e imagens locais, sem dependência de CDNs para renderizar a página.
- `source/original.html`: captura do HTML original de 21/09/2026.
- `source/assets.json`: URLs originais das imagens.
- `source/mapa-conteudo.md`: relação entre os elementos originais e a nova página.

## Formulário e ativação

A prévia local e a publicação privada não enviam leads. A validação funciona e, após um preenchimento válido, o visitante recebe um link para concluir no site oficial. Não há confirmação falsa de envio nem armazenamento de dados pessoais no navegador.

Foram preservados `post_id=8687`, `form_id=424aa5d3`, os nomes dos campos e UTMs. Para ativar o envio no WordPress, integrar a página ao contexto do Elementor Pro que disponibiliza um nonce atualizado em `window.elementorProFrontendConfig.nonce`. O script só envia no domínio `https://upskillseducacao.com.br`, com esse contexto presente. A integração de produção e a entrega ao CRM não foram testadas. Preservar os valores esperados pelo CRM ao decidir quais opções de cargo/porte utilizar.

A instalação no WordPress e a substituição da página oficial não foram realizadas.

## Verificações

JavaScript validado com `node --check`. IDs, âncoras e arquivos locais verificados. Inspeção visual no navegador, incluindo viewport efetivo de 390 px e formulário com dados fictícios, sem envio externo. Preferência por movimento reduzido respeitada. Nenhuma nova promessa comercial, currículo ou depoimento foi inventado.
