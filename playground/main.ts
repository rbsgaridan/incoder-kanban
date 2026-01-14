/**
 * Playground main entry point
 * 
 * Demonstrates the Kanban Board component with PrimeVue integration
 */

import { createApp } from 'vue';
import PrimeVue from 'primevue/config';
import Lara from '@primevue/themes/lara';
import App from './App.vue';

// Import PrimeIcons
import 'primeicons/primeicons.css';

// Import kanban styles
import '../src/style.css';

const app = createApp(App);

app.use(PrimeVue, {
    theme: {
        preset: Lara,
        options: {
            darkModeSelector: '.dark-mode',
            cssLayer: false
        }
    }
});

app.mount('#app');
