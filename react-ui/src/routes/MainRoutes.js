import React, { lazy } from 'react';
import { Route, Switch, useLocation } from 'react-router-dom';

// project imports
import MainLayout from './../layout/MainLayout';
import Loadable from '../ui-component/Loadable';
import AuthGuard from './../utils/route-guard/AuthGuard';

// dashboard routing
const DashboardDefault = Loadable(lazy(() => import('../views/dashboard/Default')));

// utilities routing
const MyBooks = Loadable(lazy(() => import('../views/utilities/MyBooks')));
const MyContributions = Loadable(lazy(() => import('../views/utilities/MyContributions')));
const UtilsShadow = Loadable(lazy(() => import('../views/utilities/Shadow')));
const UtilsMaterialIcons = Loadable(lazy(() => import('../views/utilities/MaterialIcons')));
const UtilsTablerIcons = Loadable(lazy(() => import('../views/utilities/TablerIcons')));
const NewBook = Loadable(lazy(() => import('../views/utilities/NewBook')));
const EditBook = Loadable(lazy(() => import('../views/utilities/EditBook')));
const NewContribution = Loadable(lazy(() => import('../views/utilities/NewContribution')));
const ReviewContribution = Loadable(lazy(() => import('../views/utilities/ReviewContribution')));

// sample page routing
const SamplePage = Loadable(lazy(() => import('../views/sample-page')));

//-----------------------|| MAIN ROUTING ||-----------------------//

const MainRoutes = () => {
    const location = useLocation();

    return (
        <Route
            path={[
                '/dashboard/default',

                '/my-books',
                '/my-contributions',
                '/review-contribution',
                '/new-contribution',
                '/new-book',
                '/edit-book'
            ]}
        >
            <MainLayout>
                <Switch location={location} key={location.pathname}>
                    <AuthGuard>
                        <Route path="/dashboard/default" component={DashboardDefault} />

                        <Route path="/my-books" component={MyBooks} />
                        <Route path="/my-contributions" component={MyContributions} />
                        <Route path="/review-contribution/:id" component={ReviewContribution} />
                        <Route path="/new-contribution/:id" component={NewContribution} />
                        <Route path="/new-book" component={NewBook} />

                        <Route path="/edit-book/:id" component={EditBook} />
                    </AuthGuard>
                </Switch>
            </MainLayout>
        </Route>
    );
};

export default MainRoutes;
