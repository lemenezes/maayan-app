# React + TypeScript + Vite

## Nota técnica: status de moradores

Para evitar regressões de modelagem em fluxos de moderação, este projeto separa claramente os papéis de cada tabela:

- access_requests: histórico da solicitação inicial de acesso.
  Status válidos: pending, approved, rejected.
- profiles: estado operacional atual do morador no sistema.
  Status válidos: pending, approved, rejected, suspended.

Regra de negócio:

- Suspender/Reativar altera somente profiles.status.
- access_requests.status não deve ser usado para representar suspensão posterior à aprovação.
- Em telas administrativas, quando houver profile associado ao morador, o status operacional exibido deve vir de profiles.status.
- Sem profile associado, usar fallback para access_requests.status.

## Checklist manual pré-deploy (moderação)

1. Aprovar morador novo:
   Login e navegação interna devem funcionar normalmente.
2. Suspender morador aprovado:
   Login deve continuar funcionando e o usuário deve ser redirecionado para /acesso-suspenso.
3. Reativar morador suspenso:
   Usuário volta a acessar anúncios e áreas internas protegidas.
4. Editar bloco/apartamento no admin pelo celular:
   Fluxo de edição deve funcionar em layout mobile-first sem quebra de usabilidade.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname
      }
      // other options...
    }
  }
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname
      }
      // other options...
    }
  }
]);
```
