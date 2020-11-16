/* eslint-disable */
export const STYLESHEET_URL = (process.env.REACT_APP_NODE_ENV === 'development') ? 'http://localhost:3000' : process.env.REACT_APP_EXPRESS_SERVER_URL;
export const FILE_SERVER_URL = (process.env.REACT_APP_NODE_ENV === 'development') ? 'http://localhost:3000/LS_API' : process.env.REACT_APP_FILE_SERVER_URL;
export const API_SERVER_URL = (process.env.REACT_APP_NODE_ENV === 'development') ? 'http://localhost:3000/LS_API' : process.env.REACT_APP_EXPRESS_SERVER_URL;