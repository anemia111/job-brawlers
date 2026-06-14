"use strict";

const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const root = __dirname;
const port = Number(process.env.PORT || process.argv[2] || 8080);
const host = process.env.HOST || "0.0.0.0";
const maxPlayers = Number(process.env.MAX_PLAYERS || 4);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

const rooms = new Map();

app.use(express.static(root, {
  extensions: ["html"],
  setHeaders(res) {
    res.setHeader("Cache-Control", "no-cache");
  }
}));

app.get("/healthz", (_req, res) => {
  res.status(200).json({
    ok: true,
    name: "job-brawlers",
    rooms: rooms.size
  });
});

app.get("/", (_req, res) => {
  res.sendFile(path.join(root, "index.html"));
});

function log(event, details = {}) {
  const suffix = Object.keys(details).length > 0 ? ` ${JSON.stringify(details)}` : "";
  console.log(`[${new Date().toISOString()}] ${event}${suffix}`);
}

function createRoomId() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "";
  do {
    id = "";
    for (let i = 0; i < 6; i += 1) id += alphabet[Math.floor(Math.random() * alphabet.length)];
  } while (rooms.has(id));
  return id;
}

function clampStocks(value) {
  return Math.max(1, Math.min(Number(value || 3), 5));
}

function publicRoom(room) {
  return {
    id: room.id,
    hostId: room.hostId,
    maxPlayers,
    started: room.started,
    settings: room.settings,
    players: room.players.map((player) => ({
      socketId: player.socketId,
      index: player.index,
      characterId: player.characterId,
      ready: player.ready,
      isHost: player.socketId === room.hostId
    }))
  };
}

function emitRoom(room) {
  const payload = publicRoom(room);
  io.to(room.id).emit("roomUpdated", payload);
}

function emitOnlineError(socket, message) {
  socket.emit("onlineError", message);
}

function getRoomAndPlayer(socket, roomId = socket.data.roomId) {
  const id = String(roomId || "").trim().toUpperCase();
  const room = rooms.get(id);
  if (!room) return { room: null, player: null };
  const player = room.players.find((entry) => entry.socketId === socket.id) ?? null;
  return { room, player };
}

function removeSocketFromRoom(socket, reason = "leave") {
  const roomId = socket.data.roomId;
  const room = rooms.get(roomId);
  if (!room) return;

  const leaving = room.players.find((player) => player.socketId === socket.id) ?? null;
  room.players = room.players.filter((player) => player.socketId !== socket.id);
  delete room.inputs[leaving?.index];
  delete room.states[leaving?.index];
  socket.leave(room.id);
  socket.data.roomId = null;

  log("room:leave", { roomId: room.id, socketId: socket.id, reason });

  if (room.players.length === 0) {
    rooms.delete(room.id);
    log("room:deleted", { roomId: room.id });
    return;
  }

  if (room.hostId === socket.id) {
    room.hostId = room.players[0].socketId;
    room.players[0].ready = true;
    log("room:hostChanged", { roomId: room.id, hostId: room.hostId });
  }

  const disconnectPayload = {
    roomId: room.id,
    socketId: socket.id,
    playerIndex: leaving?.index ?? null,
    message: "相手が切断しました。"
  };
  io.to(room.id).emit("opponentDisconnected", disconnectPayload);
  emitRoom(room);
}

function bindAliases(socket, names, handler) {
  for (const name of names) socket.on(name, handler);
}

io.on("connection", (socket) => {
  log("socket:connect", { socketId: socket.id });
  socket.emit("online-status", {
    connected: true,
    socketId: socket.id,
    message: "サーバー接続済み"
  });

  bindAliases(socket, ["createRoom", "create-room"], (payload = {}) => {
    removeSocketFromRoom(socket, "create-new-room");

    const roomId = createRoomId();
    const room = {
      id: roomId,
      hostId: socket.id,
      players: [{
        socketId: socket.id,
        index: 0,
        characterId: payload.characterId || "salaryman",
        ready: true
      }],
      inputs: {},
      states: {},
      settings: {
        stageId: payload.stageId || "office_tower",
        stocks: clampStocks(payload.stocks)
      },
      started: false
    };

    rooms.set(roomId, room);
    socket.join(roomId);
    socket.data.roomId = roomId;

    log("room:create", { roomId, socketId: socket.id });
    const joinedPayload = { room: publicRoom(room), playerIndex: 0, isHost: true };
    socket.emit("roomCreated", joinedPayload);
    emitRoom(room);
  });

  bindAliases(socket, ["joinRoom", "join-room"], (payload = {}) => {
    const roomId = String(payload.roomId || "").trim().toUpperCase();
    const room = rooms.get(roomId);
    if (!room) {
      emitOnlineError(socket, "ルームが見つかりません。");
      log("room:joinFailed", { roomId, socketId: socket.id, reason: "not-found" });
      return;
    }
    if (room.players.length >= maxPlayers) {
      emitOnlineError(socket, "このルームは満員です。");
      log("room:joinFailed", { roomId, socketId: socket.id, reason: "full" });
      return;
    }
    if (room.started) {
      emitOnlineError(socket, "このルームは試合中です。");
      log("room:joinFailed", { roomId, socketId: socket.id, reason: "started" });
      return;
    }

    removeSocketFromRoom(socket, "join-other-room");

    const used = new Set(room.players.map((player) => player.index));
    let index = 0;
    while (used.has(index)) index += 1;

    room.players.push({
      socketId: socket.id,
      index,
      characterId: payload.characterId || "salaryman",
      ready: false
    });
    socket.join(roomId);
    socket.data.roomId = roomId;

    log("room:join", { roomId, socketId: socket.id, index });
    const joinedPayload = { room: publicRoom(room), playerIndex: index, isHost: false };
    socket.emit("roomJoined", joinedPayload);
    emitRoom(room);
  });

  bindAliases(socket, ["playerInput", "player-input"], (payload = {}) => {
    const { room, player } = getRoomAndPlayer(socket, payload.roomId);
    if (!room || !player) return;
    room.inputs[player.index] = {
      moveX: Number(payload.input?.moveX || 0),
      up: Boolean(payload.input?.up),
      down: Boolean(payload.input?.down),
      jumpPressed: Boolean(payload.input?.jumpPressed),
      normalPressed: Boolean(payload.input?.normalPressed ?? payload.input?.normalAttackPressed),
      strongPressed: Boolean(payload.input?.strongPressed ?? payload.input?.strongAttackPressed),
      strongHeld: Boolean(payload.input?.strongHeld),
      grabPressed: Boolean(payload.input?.grabPressed),
      skillPressed: Boolean(payload.input?.skillPressed),
      ultimatePressed: Boolean(payload.input?.ultimatePressed),
      guardHeld: Boolean(payload.input?.guardHeld),
      dodgePressed: Boolean(payload.input?.dodgePressed)
    };
    io.to(room.id).emit("roomInputs", { inputs: room.inputs });
  });

  bindAliases(socket, ["playerState", "player-state"], (payload = {}) => {
    const { room, player } = getRoomAndPlayer(socket, payload.roomId);
    if (!room || !player || !payload.state) return;
    const state = {
      ...payload.state,
      playerIndex: player.index,
      socketId: socket.id,
      serverTime: Date.now()
    };
    room.states[player.index] = state;
    socket.to(room.id).emit("enemy-state", {
      roomId: room.id,
      playerIndex: player.index,
      socketId: socket.id,
      state
    });
  });

  bindAliases(socket, ["combatEvent", "combat-event"], (payload = {}) => {
    const { room, player } = getRoomAndPlayer(socket, payload.roomId);
    if (!room || !player) return;
    const event = {
      ...payload,
      roomId: room.id,
      playerIndex: player.index,
      socketId: socket.id,
      serverTime: Date.now()
    };
    socket.to(room.id).emit("combat-event", event);
  });

  bindAliases(socket, ["selectCharacter", "select-character"], (payload = {}) => {
    const { room, player } = getRoomAndPlayer(socket, payload.roomId);
    if (!room || !player || room.started) return;
    player.characterId = payload.characterId || player.characterId;
    log("room:character", { roomId: room.id, socketId: socket.id, characterId: player.characterId });
    emitRoom(room);
  });

  bindAliases(socket, ["selectStage", "select-stage"], (payload = {}) => {
    const { room } = getRoomAndPlayer(socket, payload.roomId);
    if (!room || room.hostId !== socket.id || room.started) return;
    room.settings.stageId = payload.stageId || room.settings.stageId;
    log("room:stage", { roomId: room.id, stageId: room.settings.stageId });
    emitRoom(room);
  });

  bindAliases(socket, ["selectStocks", "select-stocks"], (payload = {}) => {
    const { room } = getRoomAndPlayer(socket, payload.roomId);
    if (!room || room.hostId !== socket.id || room.started) return;
    room.settings.stocks = clampStocks(payload.stocks || room.settings.stocks);
    log("room:stocks", { roomId: room.id, stocks: room.settings.stocks });
    emitRoom(room);
  });

  bindAliases(socket, ["toggleReady", "toggle-ready"], (payload = {}) => {
    const { room, player } = getRoomAndPlayer(socket, payload.roomId);
    if (!room || !player || room.started) return;
    player.ready = player.socketId === room.hostId ? true : !player.ready;
    log("room:ready", { roomId: room.id, socketId: socket.id, ready: player.ready });
    emitRoom(room);
  });

  bindAliases(socket, ["startGame", "start-game"], (payload = {}) => {
    const { room } = getRoomAndPlayer(socket, payload.roomId);
    if (!room || room.hostId !== socket.id) return;
    if (room.players.length < 2) {
      emitOnlineError(socket, "2人以上で開始できます。");
      return;
    }
    room.started = true;
    room.players.forEach((player) => {
      player.ready = true;
      room.inputs[player.index] = room.inputs[player.index] || {};
    });
    log("room:start", { roomId: room.id, players: room.players.length });
    const startPayload = { room: publicRoom(room) };
    io.to(room.id).emit("onlineStart", startPayload);
  });

  bindAliases(socket, ["gameStateUpdate", "game-state-update"], (snapshot = {}) => {
    const roomId = snapshot.roomId || socket.data.roomId;
    const room = rooms.get(roomId);
    if (!room || room.hostId !== socket.id) return;
    const payload = {
      ...snapshot,
      roomId: room.id,
      serverTime: Date.now()
    };
    socket.to(room.id).emit("gameStateSnapshot", payload);
  });

  socket.on("leaveRoom", () => removeSocketFromRoom(socket, "client-leave"));
  socket.on("leave-room", () => removeSocketFromRoom(socket, "client-leave"));

  socket.on("disconnect", (reason) => {
    log("socket:disconnect", { socketId: socket.id, reason });
    removeSocketFromRoom(socket, reason);
  });
});

server.listen(port, host, () => {
  const displayHost = host === "0.0.0.0" ? "localhost" : host;
  log("server:listening", {
    localUrl: `http://${displayHost}:${port}/`,
    bind: `${host}:${port}`,
    maxPlayers
  });
});
