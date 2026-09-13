from fastapi import WebSocket
from typing import List, Dict
import json
import logging

logger = logging.getLogger("websockets")

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.user_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, username: str = "guest"):
        await websocket.accept()
        self.active_connections.append(websocket)
        if username not in self.user_connections:
            self.user_connections[username] = []
        self.user_connections[username].append(websocket)
        logger.info(f"WebSocket client connected: {username}. Total: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket, username: str = "guest"):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        if username in self.user_connections and websocket in self.user_connections[username]:
            self.user_connections[username].remove(websocket)
        logger.info(f"WebSocket client disconnected: {username}")

    async def broadcast(self, message: dict):
        payload = json.dumps(message)
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(payload)
            except Exception as e:
                logger.error(f"Error sending websocket message: {e}")
                disconnected.append(connection)
        
        for conn in disconnected:
            if conn in self.active_connections:
                self.active_connections.remove(conn)

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        await websocket.send_text(json.dumps(message))

ws_manager = ConnectionManager()
