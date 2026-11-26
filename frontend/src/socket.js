import io from "socket.io-client";
import { API_URL } from "./lib/config";

const socket = io(API_URL, { transports: ["websocket"], autoConnect: false });

export default socket;
