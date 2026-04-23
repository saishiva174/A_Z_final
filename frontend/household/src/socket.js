import { io } from "socket.io-client";

import { API_URL } from "./apiConfig";


export const socket = io(API_URL, {
  path: "/socket.io/",
  withCredentials: true,
  transports: ['websocket',"polling"] 
});