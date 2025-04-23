import { io } from "socket.io-client";

const socket = io("http://192.168.0.107:5000"); // Replace <YOUR_IP>
export default socket;
