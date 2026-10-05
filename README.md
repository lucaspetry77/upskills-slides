# UpSkills

Projeto estático com a página da formação Lean Six Sigma e apresentações HTML baseadas na mesma identidade visual.

## Arquivos

- [Apresentação com 15 slides](Slides/apresentacao.html)
- [Design system para slides](Slides/design-system.html)
- [Guia dos slides](Slides/README.md)
- [Página da formação](lean-six-sigma/dist/index.html)
- [Guia da página](lean-six-sigma/README.md)
- `lean-six-sigma/source/`: conteúdo original, referências e documentação do redesign.
- `referencia.html` e `logo-upskills.png`: referências visuais do projeto.

## Abrir localmente

Abra os arquivos HTML no navegador ou execute, na raiz:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Acesse `http://127.0.0.1:4173/Slides/apresentacao.html` ou `http://127.0.0.1:4173/lean-six-sigma/dist/index.html`.

Os slides usam fontes e imagens locais e não precisam de instalação ou build. Avance com as setas do teclado ou espaço. Use Home e End para ir ao início e ao fim. Em dispositivos touch, deslize horizontalmente. A tela não possui controles de navegação visíveis.

Consulte o README da página para os detalhes do formulário e da integração de produção.
