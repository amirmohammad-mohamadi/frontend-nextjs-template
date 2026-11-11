# Domain generator

```bash
npm run generate:domain -- product
npm run generate:domain -- blog-post --plural=blog-posts --endpoint=/api/v1/posts --page=false
```

For a domain `product` it writes:

```
src/shared/dtos/product/product.dto.ts              schemas: product, createProduct, updateProduct, listProductsQuery
src/shared/models/product/product.{interface,model}.ts
src/shared/services/product/product.{api,hooks,query-keys}.ts
src/app/[locale]/products/page.tsx                  (unless --page=false)
src/features/products/products-list.{tsx,hook.ts}
```

and edits:

- the three layer barrels (`src/shared/{dtos,models,services}/index.ts`) to export the new folder,
- `src/shared/services/shared/endpoints.ts` to add `product: { list, byId }`,
- `messages/en.json` and `messages/fa.json` with a `products` namespace for the list page (the Persian strings are placeholders around the untranslated domain name).

Then by hand: the real fields in the DTO and the model, the list card, a link in `src/components/site-header.tsx`, and the Persian copy. The `example` domain is the finished version of what the generator produces; read it before editing the output.

The generator is a plain Node script, `tools/scripts/generate-domain.mjs`, with no dependency on a build tool. Templates live in `tools/generators/domain/files`: `__name__` in a path and `<%= name %>` in a file are replaced with `fileName`, `className`, `propertyName`, their plural forms and `endpoint`. Change them when a convention changes, so new domains follow suit; the generator is the executable form of the architecture.

## Removing the example domain

`npm run example:remove` deletes the example folders and its e2e spec, strips the barrel exports and the endpoint group, cuts the blocks fenced by `example-domain:start` / `example-domain:end` comments out of the header link and the home button, drops the `examples` message namespace, removes `/api/v1/examples` from the proxy prefix defaults and runs the typecheck. The tree is green afterwards; run `npm run check` and `npm run e2e` before committing.
