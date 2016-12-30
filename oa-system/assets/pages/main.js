import React from 'react';
import { render } from 'react-dom';
import {Router, hashHistory} from 'react-router';
const rootRoute = {
    path: '/',
    component: require('./components/home.jsx'),
    childRoutes: [require('./routers/operation-management/index.jsx')]
};

class Entry extends React.Component{
    constructor(){
        super();
    }


    render (){
        console.log('in');
        return <Router history={hashHistory} routes={rootRoute} />;
    }

}
render(<Entry />, document.getElementById('main-holder'));