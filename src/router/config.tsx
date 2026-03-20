import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

const HomePage = lazy(() => import('../pages/home/page'));
const ProductPage = lazy(() => import('../pages/product/page'));
const ShopPage = lazy(() => import('../pages/shop/page'));
const AdminPage = lazy(() => import('../pages/admin/page'));
const NotFound = lazy(() => import('../pages/NotFound'));

const routes: RouteObject[] = [
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/product/:id',
    element: <ProductPage />,
  },
  {
    path: '/shop',
    element: <ShopPage />,
  },
  {
    path: '/admin',
    element: <AdminPage />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
];

export default routes;
