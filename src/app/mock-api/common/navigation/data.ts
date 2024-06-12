/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';

export const defaultNavigation: FuseNavigationItem[] = [
    {
        id   : 'grabaciones',
        title: 'Grabaciones',
        type : 'basic',
        icon : 'heroicons_outline:video-camera',
        link : '/grabaciones',
        roles: ['admin', 'programador', 'operario', 'monitor']
    },
    {
        id   : 'usuarios',
        title: 'Usuarios',
        type : 'basic',
        icon : 'heroicons_outline:cog-6-tooth',
        link : '/usuarios',
        roles: ['admin']
    },
    {
        id   : 'logs',
        title: 'Logs',
        type : 'basic',
        icon : 'heroicons_outline:newspaper',
        link : '/logs',
        roles: ['admin']
    },
];
export const compactNavigation: FuseNavigationItem[] = [
    {
        id   : 'grabaciones',
        title: 'Grabaciones',
        type : 'basic',
        icon : 'heroicons_outline:video-camera',
        link : '/grabaciones'
    }
];
export const futuristicNavigation: FuseNavigationItem[] = [
    {
        id   : 'grabaciones',
        title: 'Grabaciones',
        type : 'basic',
        icon : 'heroicons_outline:video-camera',
        link : '/grabaciones'
    }
];
export const horizontalNavigation: FuseNavigationItem[] = [
    {
        id   : 'grabaciones',
        title: 'Grabaciones',
        type : 'basic',
        icon : 'heroicons_outline:video-camera',
        link : '/grabaciones',
        roles: ['admin', 'programador', 'operario', 'monitor']
    },
    {
        id   : 'usuarios',
        title: 'Usuarios',
        type : 'basic',
        icon : 'heroicons_outline:cog-6-tooth',
        link : '/usuarios',
        roles: ['admin']
    },
    {
        id   : 'logs',
        title: 'Logs',
        type : 'basic',
        icon : 'heroicons_outline:newspaper',
        link : '/logs',
        roles: ['admin']
    },
];
