// assets
import { IconBrandFramer, IconTypography, IconPalette, IconShadow, IconWindmill, IconLayoutGridAdd } from '@tabler/icons';

// constant
const icons = {
    IconTypography: IconTypography,
    IconPalette: IconPalette,
    IconShadow: IconShadow,
    IconWindmill: IconWindmill,
    IconBrandFramer: IconBrandFramer,
    IconLayoutGridAdd: IconLayoutGridAdd
};

//-----------------------|| UTILITIES MENU ITEMS ||-----------------------//

export const utilities = {
    id: 'utilities',
    title: '',
    type: 'group',
    children: [
        {
            id: 'util-typography',
            title: 'My Books',
            type: 'item',
            url: '/my-books',
            icon: icons['IconTypography'],
            breadcrumbs: false
        },
        {
            id: 'util-color',
            title: 'My Contributions',
            type: 'item',
            url: '/my-contributions',
            icon: icons['IconPalette'],
            breadcrumbs: false
        },
    ]
};

export const outerLinks = {
    id: 'utilities',
    title: '',
    type: 'group',
    children: [
        {
            id: 'util-typography',
            title: 'My Books',
            type: 'item',
            url: '/my-books',
            icon: icons['IconTypography'],
            breadcrumbs: false
        },
        {
            id: 'util-color',
            title: 'My Contributions',
            type: 'item',
            url: '/my-contributions',
            icon: icons['IconPalette'],
            breadcrumbs: false
        },
       
        
    ]
};