# Migration Guide: v1.x to v2.0

This guide helps you upgrade from @incoder/kanban v1.x (PrimeVue 3) to v2.0 (PrimeVue 4).

## Breaking Changes

### 1. PrimeVue 4 Requirement

**v1.x:**

```json
{
  "primevue": "^3.46.0"
}
```

**v2.0:**

```json
{
  "primevue": "^4.0.0",
  "@primevue/themes": "^4.2.2"
}
```

### 2. Vue 3.5+ Requirement

**v1.x:**

```json
{
  "vue": "^3.3.0"
}
```

**v2.0:**

```json
{
  "vue": "^3.5.0"
}
```

### 3. PrimeVue Configuration Changes

PrimeVue 4 uses a new preset-based theming system instead of importing CSS theme files.

**v1.x Configuration:**

```typescript
import PrimeVue from "primevue/config";
import "primevue/resources/themes/lara-light-blue/theme.css";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";

app.use(PrimeVue);
```

**v2.0 Configuration:**

```typescript
import PrimeVue from "primevue/config";
import Aura from "@primevue/themes/aura";
import "primeicons/primeicons.css";

app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: ".dark-mode",
    },
  },
});
```

## Step-by-Step Migration

### Step 1: Update Dependencies

Update your `package.json`:

```bash
npm install @incoder/kanban@^2.0.0 vue@^3.5.0 primevue@^4.0.0 @primevue/themes primeicons@^7.0.0
```

Or if using yarn:

```bash
yarn add @incoder/kanban@^2.0.0 vue@^3.5.0 primevue@^4.0.0 @primevue/themes primeicons@^7.0.0
```

### Step 2: Update PrimeVue Configuration

#### Standard Vue App

In your `main.ts`:

```diff
  import { createApp } from 'vue';
  import PrimeVue from 'primevue/config';
+ import Aura from '@primevue/themes/aura';
- import 'primevue/resources/themes/lara-light-blue/theme.css';
- import 'primevue/resources/primevue.min.css';
  import 'primeicons/primeicons.css';

  const app = createApp(App);
- app.use(PrimeVue);
+ app.use(PrimeVue, {
+   theme: {
+     preset: Aura
+   }
+ });
```

#### Laravel + Inertia.js

In your `resources/js/app.ts`:

```diff
  import { createApp, h } from 'vue';
  import { createInertiaApp } from '@inertiajs/vue3';
  import PrimeVue from 'primevue/config';
+ import Aura from '@primevue/themes/aura';
- import 'primevue/resources/themes/lara-light-blue/theme.css';
- import 'primevue/resources/primevue.min.css';
  import 'primeicons/primeicons.css';

  createInertiaApp({
    // ...
    setup({ el, App, props, plugin }) {
      return createApp({ render: () => h(App, props) })
        .use(plugin)
-       .use(PrimeVue)
+       .use(PrimeVue, {
+         theme: {
+           preset: Aura
+         }
+       })
        .mount(el);
    }
  });
```

### Step 3: No Component Changes Required

**Good news!** The Kanban component API remains exactly the same. Your existing component usage continues to work:

```vue
<template>
  <KanbanBoard
    v-model:columns="columns"
    v-model:cards="cards"
    @card-moved="handleCardMoved"
  />
</template>
```

No changes needed to:

- Props
- Events
- Slots
- TypeScript types
- Component imports

### Step 4: Test Your Application

1. **Check the dev server:** `npm run dev`
2. **Verify drag & drop works**
3. **Test all event handlers**
4. **Check custom slots if you're using them**

## PrimeVue 4 Theme Options

PrimeVue 4 comes with several preset themes. You can choose from:

- `Aura` (default, modern)
- `Lara` (PrimeVue 3 style)
- `Material`
- `Nora`

```typescript
import Aura from "@primevue/themes/aura";
import Lara from "@primevue/themes/lara";
import Material from "@primevue/themes/material";
import Nora from "@primevue/themes/nora";

app.use(PrimeVue, {
  theme: {
    preset: Lara, // Choose your preset
  },
});
```

## Custom Theming

PrimeVue 4 makes custom theming easier:

```typescript
import { definePreset } from "@primevue/themes";
import Aura from "@primevue/themes/aura";

const MyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: "#f0f9ff",
      100: "#e0f2fe",
      // ... your colors
    },
  },
});

app.use(PrimeVue, {
  theme: {
    preset: MyPreset,
  },
});
```

## Troubleshooting

### Module not found: @primevue/themes

**Error:**

```
Error: Cannot find module '@primevue/themes/aura'
```

**Solution:**

```bash
npm install @primevue/themes
```

### Styles look broken

**Problem:** Theme not applying correctly.

**Solution:** Ensure you've:

1. Removed old CSS imports (`primevue/resources/themes/...`)
2. Configured PrimeVue with a preset
3. Imported PrimeIcons CSS: `import 'primeicons/primeicons.css'`

### TypeScript errors

**Error:** Type errors after upgrade.

**Solution:**

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Rebuild TypeScript
npm run build
```

### Vite build errors

**Error:** Build fails with module resolution errors.

**Solution:** Update your `vite.config.ts`:

```typescript
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  optimizeDeps: {
    include: ["primevue", "@primevue/themes"],
  },
});
```

## Need Help?

- 📖 [PrimeVue 4 Migration Guide](https://primevue.org/migration/)
- 📖 [Vue 3.5 Release Notes](https://blog.vuejs.org/posts/vue-3-5)
- 📖 [Kanban Laravel Integration](./LARAVEL.md)
- 🐛 [Report an Issue](https://github.com/yourusername/incoder-kanban/issues)

## Rollback to v1.x

If you need to rollback:

```bash
npm install @incoder/kanban@^1.0.0 vue@^3.3.0 primevue@^3.46.0 primeicons@^6.0.0
```

Then restore your old PrimeVue configuration with CSS imports.
