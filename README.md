# FinanceApp (Expo / React Native)

Projeto base do **FinanceApp** usando **Expo + React Native**, pronto para:

- Rodar em Android, iOS e Web (via Expo);
- Ser integrado ao Codemagic usando o arquivo `codemagic.yaml` incluso.

## Scripts principais (rodados automaticamente pelo Codemagic)

- `npm install`
- `npx expo export --platform web --output-dir dist`

O build web ficará na pasta `dist/` e será exposto como artefato no Codemagic.

Você não precisa usar o terminal no seu computador; o Codemagic executa tudo no servidor.
