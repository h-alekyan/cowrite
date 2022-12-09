import React, { lazy } from 'react';
import { Route, Switch, useLocation } from 'react-router-dom';

// project imports
import MinimalLayout from './../layout/MinimalLayout';
import OuterLayout from '../layout/OuterLayout';
import Loadable from '../ui-component/Loadable';
import AuthGuard from './../utils/route-guard/AuthGuard';

// dashboard routing
const BookstoreMain = Loadable(lazy(() => import('../views/bookstore')));
const BookPage = Loadable(lazy(() => import('../views/pages/authentication/bookpage')));
const NewBook = Loadable(lazy(() => import('../views/utilities/NewBook')));
const AuthRegister = Loadable(lazy(() => import('../views/pages/authentication/register')));


// sample page routing
const SamplePage = Loadable(lazy(() => import('../views/sample-page')));

//-----------------------|| MAIN ROUTING ||-----------------------//

const OpenRoutes = () => {
    const location = useLocation();

    return (
        <Route
            path={[
                '/bookstore',
                '/book',
            ]}
        >
            <OuterLayout>
                <Switch location={location} key={location.pathname}>
                        <Route path="/bookstore" component={BookstoreMain} />
                        <Route path="/book/:id" component={BookPage} />
                </Switch>
            </OuterLayout>
        </Route>
    );
};

export default OpenRoutes;
