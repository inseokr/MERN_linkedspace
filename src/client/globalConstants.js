/* eslint-disable */
export const STYLESHEET_URL = (process.env.NODE_ENV === 'development') ? 'http://localhost:3000' : process.env.EXPRESS_SERVER_URL;
export const FILE_SERVER_URL = (process.env.NODE_ENV === 'development') ? 'http://localhost:3000/LS_API' : process.env.EXPRESS_SERVER_URL;