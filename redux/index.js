import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk';
import { createEpicMiddleware } from 'redux-observable';
import  rootReducer  from './reducers/index';
import rootEpic  from './epics/index';


const isServer = typeof window === 'undefined'
const __NEXT_REDUX_STORE__ = '__NEXT_REDUX_STORE__'

function getOrCreateStore(initialState) {
  
    const epicMiddleware = createEpicMiddleware();
    const reduxMiddleware = applyMiddleware(thunkMiddleware, epicMiddleware);
    let store =  createStore(
        rootReducer,
        initialState,
        reduxMiddleware
      );
    epicMiddleware.run(rootEpic);

    return store;
}



/**
* @param {object} initialState
* @param {boolean} options.isServer indicates whether it is a server side or client side
* @param {Request} options.req NodeJS Request object (not set when client applies initialState from server)
* @param {Request} options.res NodeJS Request object (not set when client applies initialState from server)
* @param {boolean} options.debug User-defined debug mode param
* @param {string} options.storeKey This key will be used to preserve store in global namespace for safe HMR 
*/

export default function initializeStore (initialState, options) {

    console.log("isServer: "+ isServer);
    
    // Always make a new store if server, otherwise state is shared between requests
  if (isServer) {
    return getOrCreateStore(initialState)
  }

  // Create store if unavailable on the client and set it on the window object
  if (!window[__NEXT_REDUX_STORE__]) {
    window[__NEXT_REDUX_STORE__] = getOrCreateStore(initialState);
  }
  return window[__NEXT_REDUX_STORE__];
};



  


