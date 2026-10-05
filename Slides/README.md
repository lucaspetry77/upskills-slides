# UpSkills · Slides

- `design-system.html`: guia visual em 10 telas, com cores, tipografia, composição, elementos de conteúdo, dados e movimento.
- `apresentacao.html`: apresentação de 15 slides sobre a formação Lean 6 Sigma.
- `slides.css` e `slides.js`: sistema visual e navegação compartilhados pelos dois arquivos.
- `assets/`: fontes, marca, fotografia e belts locais da página original.

Abra um dos HTMLs no navegador. Não há instalação, build ou dependência de CDN. Para transportar a apresentação, copie a pasta Slides inteira.

## Apresentar

Use as setas do teclado. A tela não tem setas, contador ou controles visíveis. Espaço e Page Down avançam; Shift + Espaço e Page Up voltam. Home vai ao primeiro slide; End, ao último. Em dispositivos touch, deslize horizontalmente. F alterna tela cheia quando o navegador permite. Escape sai da tela cheia.

O canvas mantém 16:9 e se ajusta à janela. Para apresentar no celular, prefira a orientação horizontal. A preferência de movimento reduzido do sistema operacional é respeitada. O endereço aceita `#1` até `#15` na apresentação e `#1` até `#10` no design system.

## Reutilizar

Duplique uma seção `<section class="slide">` dentro de `.stage`. Edite `data-title`, `aria-label` e o conteúdo. A navegação se adapta automaticamente à quantidade de slides. Use `.reveal` com `style="--i:1"`, `--i:2` etc. para ordenar entradas. Cores e movimento são definidos nas variáveis de `:root` em `slides.css`.

A identidade e os dados sobre a formação e o mentor vêm de `../lean-six-sigma/dist/index.html`. A apresentação é uma adaptação editorial dessa página, sem oferta comercial ou depoimentos fictícios. O gráfico do Green Belt é conceitual. O exemplo de retrabalho usa dados hipotéticos, identificados no próprio slide.
