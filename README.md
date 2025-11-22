# FinanceApp (Expo / React Native)

Projeto do **FinanceApp** em **Expo + React Native**, pronto para:

- Rodar em Android, iOS e Web (via Expo);
- Ser integrado ao Codemagic usando o arquivo `codemagic.yaml`.

## Build Web no Codemagic

O workflow `expo-web` executa:

- `npm install`
- `npx expo export --platform web --output-dir dist`

O build web ficará na pasta `dist/` e será exportado como artefato do build.
