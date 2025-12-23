/**
 * Playground main entry point
 * 
 * Demonstrates the Kanban Board component with PrimeVue integration
 */

import { createApp } from 'vue';
import PrimeVue from 'primevue/config';
import App from './App.vue';

// Import PrimeVue theme
import 'primevue/resources/themes/lara-light-blue/theme.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';

// Import kanban styles
import '../src/style.css';

const app = createApp(App);

app.use(PrimeVue);

app.mount('#app');
