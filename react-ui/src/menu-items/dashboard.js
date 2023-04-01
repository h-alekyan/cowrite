// assets
import { IconDashboard, IconDeviceAnalytics } from '@tabler/icons';

// constant
const icons = {
    IconDashboard: IconDashboard,
    IconDeviceAnalytics
};

//-----------------------|| DASHBOARD MENU ITEMS ||-----------------------//

export const dashboard = {
    id: 'dashboard',
    title: 'Welcome!',
    type: 'group',
    children: [

    ]
};

export const bookstore = {
    id: 'bookstore',
    title: 'Bookstore',
    type: 'group',
    children: [
        {
            id: 'default',
            title: 'Bookstore',
            type: 'item',
            url: '/bookstore',
            icon: icons['IconDashboard'],
            breadcrumbs: false
        }
    ]
};