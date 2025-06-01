import { createRoot } from 'react-dom/client';
import { InertiaApp } from '@inertiajs/inertia-react';
import MaintenanceRequestSystem from './MaintenanceRequestSystem';

const app = document.getElementById('app');

createRoot(app).render(
    <InertiaApp
        initialPage={JSON.parse(app.dataset.page)}
        resolveComponent={(name) => {
            if (name === 'MaintenanceRequestSystem') return MaintenanceRequestSystem;
            return import(`./Pages/${name}`).then(module => module.default);
        }}
    />
);