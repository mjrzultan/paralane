import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

// Simple JSON File DB setup for persistence
const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "db.json");

interface User {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  avatarUrl: string;
  createdAt: string;
  allowSearch?: boolean;
  requireMessageRequests?: boolean;
}

interface Chat {
  id: string;
  name: string;
  isGroup: boolean;
  participantIds: string[];
  createdBy: string;
  createdAt: string;
}

interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  createdAt: string;
  seen?: boolean;
}

interface MessageRequest {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  receiverId: string;
  receiverName: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
}

interface DB {
  users: User[];
  chats: Chat[];
  messages: Message[];
  messageRequests: MessageRequest[];
}

const defaultDB: DB = {
  users: [
    {
      id: "user-system",
      email: "system@paralane.io",
      username: "Paralane Bot ⚡",
      passwordHash: "system-bot-password-hash-not-real",
      avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=paralane",
      createdAt: new Date().toISOString(),
    }
  ],
  chats: [
    {
      id: "chat-general",
      name: "Paralane General Space 🚀",
      isGroup: true,
      participantIds: ["user-system"],
      createdBy: "user-system",
      createdAt: new Date().toISOString(),
    },
  ],
  messages: [
    {
      id: "msg-welcome",
      chatId: "chat-general",
      senderId: "user-system",
      senderName: "Paralane Bot ⚡",
      senderAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=paralane",
      text: "Welcome to Paralane General Space! This is a live persistent space. Register your account, invite your friends, or create new chats/groups seamlessly! 💬⚡",
      createdAt: new Date().toISOString(),
    },
  ],
  messageRequests: [],
};

function readDB(): DB {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultDB, null, 2), "utf8");
      return defaultDB;
    }
    const data = fs.readFileSync(DB_FILE, "utf8");
    const db = JSON.parse(data) as DB;
    db.messageRequests = db.messageRequests || [];
    return db;
  } catch (err) {
    console.error("Error reading database file, returning default.", err);
    return defaultDB;
  }
}

function writeDB(db: DB) {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing to database file", err);
  }
}

// Ensure database is initialized at start
readDB();

// API ROUTES

// 1. Auth: Register
app.post("/api/auth/register", (req, res) => {
  const { email, username, password } = req.body;
  if (!email || !username || !password) {
    return res.status(400).json({ error: "Missing email, username or password." });
  }

  const db = readDB();
  const existingUser = db.users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() || u.username.toLowerCase() === username.toLowerCase()
  );

  if (existingUser) {
    return res.status(400).json({ error: "User with this email or username already exists." });
  }

  const cleanUsername = username.trim();
  const newUser: User = {
    id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    email: email.trim().toLowerCase(),
    username: cleanUsername,
    passwordHash: password, // For simplicity we store plain text or password directly
    avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(cleanUsername)}`,
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  
  // Auto-add new users to general space group
  const generalChat = db.chats.find((c) => c.id === "chat-general");
  if (generalChat && !generalChat.participantIds.includes(newUser.id)) {
    generalChat.participantIds.push(newUser.id);
  }

  writeDB(db);

  res.status(201).json({
    user: {
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      avatarUrl: newUser.avatarUrl,
      allowSearch: true,
    },
  });
});

// 2. Auth: Login
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Missing email or password." });
  }

  const db = readDB();
  const user = db.users.find(
    (u) =>
      u.email.toLowerCase() === email.trim().toLowerCase() &&
      u.passwordHash === password
  );

  if (!user) {
    return res.status(401).json({ error: "Invalid email or password combination." });
  }

  res.json({
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      avatarUrl: user.avatarUrl,
      allowSearch: user.allowSearch !== false,
    },
  });
});

// 3. Auth: Forgot Password Simulation (allows direct resetting)
app.post("/api/auth/forgot-password", (req, res) => {
  const { email, newPassword } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email address is required." });
  }

  const db = readDB();
  const userIndex = db.users.findIndex((u) => u.email.toLowerCase() === email.trim().toLowerCase());

  if (userIndex === -1) {
    return res.status(404).json({ error: "No user found with this email address." });
  }

  if (newPassword) {
    db.users[userIndex].passwordHash = newPassword;
    writeDB(db);
    return res.json({ success: true, message: "Your password has been successfully reset!" });
  }

  // Simulation step 1: Email found
  return res.json({ success: true, codeSent: true, message: "A security verification protocol request was initialized. Enter your new password below." });
});

// 4. Auth: Google Login Simulation
app.post("/api/auth/google", (req, res) => {
  const { email, name, googleId, avatarUrl } = req.body;
  if (!email || !name) {
    return res.status(400).json({ error: "Missing email or name." });
  }

  const db = readDB();
  let user = db.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());

  if (!user) {
    const cleanUsername = `${name} ⚡`;
    user = {
      id: `user-google-${googleId || Date.now()}`,
      email: email.trim().toLowerCase(),
      username: cleanUsername,
      passwordHash: `google-auth-${Date.now()}`, // random fallback
      avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(cleanUsername)}`,
      createdAt: new Date().toISOString(),
    };
    db.users.push(user);
    
    // Auto add to General chat
    const generalChat = db.chats.find((c) => c.id === "chat-general");
    if (generalChat && !generalChat.participantIds.includes(user.id)) {
      generalChat.participantIds.push(user.id);
    }
    
    writeDB(db);
  }

  res.json({
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      avatarUrl: user.avatarUrl,
      allowSearch: user.allowSearch !== false,
    },
  });
});

// 5. Users List (Search for other users)
app.get("/api/users", (req, res) => {
  const db = readDB();
  // Return user list excluding system bot
  // All profiles are findable now per request: "you will be able to find the user's profile"
  const users = db.users
    .filter((u) => u.id !== "user-system")
    .map((u) => ({
      id: u.id,
      username: u.username,
      avatarUrl: u.avatarUrl,
      allowSearch: u.allowSearch !== false,
      requireMessageRequests: u.requireMessageRequests === true,
    }));
  res.json(users);
});

// 5.1 Update User Settings
app.post("/api/users/:userId/settings", (req, res) => {
  const { userId } = req.params;
  const { allowSearch, requireMessageRequests, username, avatarUrl } = req.body;
  
  const db = readDB();
  const user = db.users.find((u) => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  if (username !== undefined) {
    const cleanUsername = username.trim();
    if (cleanUsername) {
      // Ensure username uniqueness among other users
      const duplicated = db.users.some(u => u.id !== userId && u.username.toLowerCase() === cleanUsername.toLowerCase());
      if (duplicated) {
        return res.status(400).json({ error: "Username is already taken." });
      }
      user.username = cleanUsername;
    }
  }

  if (avatarUrl !== undefined) {
    const cleanAvatar = avatarUrl.trim();
    if (cleanAvatar) {
      user.avatarUrl = cleanAvatar;
    }
  }

  if (allowSearch !== undefined) {
    user.allowSearch = allowSearch !== false;
  }
  if (requireMessageRequests !== undefined) {
    user.requireMessageRequests = requireMessageRequests === true;
  }
  
  writeDB(db);

  res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      avatarUrl: user.avatarUrl,
      allowSearch: user.allowSearch !== false,
      requireMessageRequests: user.requireMessageRequests === true,
    },
  });
});

// 5.2 Get Message Requests
app.get("/api/message-requests", (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ error: "userId query parameter is required." });
  }
  const db = readDB();
  const requests = db.messageRequests.filter(
    (r) => r.senderId === userId || r.receiverId === userId
  );
  res.json(requests);
});

// 5.3 Send Message Request
app.post("/api/message-requests", (req, res) => {
  const { senderId, receiverId } = req.body;
  if (!senderId || !receiverId) {
    return res.status(400).json({ error: "senderId and receiverId are required." });
  }

  const db = readDB();
  const sender = db.users.find((u) => u.id === senderId);
  const receiver = db.users.find((u) => u.id === receiverId);
  if (!sender || !receiver) {
    return res.status(404).json({ error: "Sender or receiver profile not found." });
  }

  // Check existing requests
  const existing = db.messageRequests.find(
    (r) =>
      (r.senderId === senderId && r.receiverId === receiverId) ||
      (r.senderId === receiverId && r.receiverId === senderId)
  );
  if (existing) {
    return res.json(existing);
  }

  const newRequest: MessageRequest = {
    id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    senderId,
    senderName: sender.username,
    senderAvatar: sender.avatarUrl,
    receiverId,
    receiverName: receiver.username,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  db.messageRequests.push(newRequest);
  writeDB(db);
  res.status(201).json(newRequest);
});

// 5.4 Respond to Message Request
app.post("/api/message-requests/:requestId/respond", (req, res) => {
  const { requestId } = req.params;
  const { status } = req.body; // 'accepted' | 'declined'
  if (status !== "accepted" && status !== "declined") {
    return res.status(400).json({ error: "Invalid response status." });
  }

  const db = readDB();
  const request = db.messageRequests.find((r) => r.id === requestId);
  if (!request) {
    return res.status(404).json({ error: "Message request not found." });
  }

  request.status = status;

  if (status === "accepted") {
    // Automatically provision DM chat space
    const existing = db.chats.find(
      (c) =>
        !c.isGroup &&
        c.participantIds.includes(request.senderId) &&
        c.participantIds.includes(request.receiverId)
    );
    if (!existing) {
      const newChat: Chat = {
        id: `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: request.senderName,
        isGroup: false,
        participantIds: [request.senderId, request.receiverId],
        createdBy: request.senderId,
        createdAt: new Date().toISOString(),
      };
      db.chats.push(newChat);
    }
  }

  writeDB(db);
  res.json({ success: true, request });
});

// 6. Chats list for current user
app.get("/api/chats", (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ error: "userId query parameter is required." });
  }

  const db = readDB();
  // Filter chats where user is a participant
  const userChats = db.chats.filter((c) => c.participantIds.includes(userId as string));

  // Resolve chat participant details
  const resolvedChats = userChats.map((chat) => {
    let chatName = chat.name;
    let chatAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(chat.name)}`;

    if (!chat.isGroup) {
      // Direct message - resolve the name of the OTHER participant
      const otherId = chat.participantIds.find((id) => id !== userId);
      const otherUser = db.users.find((u) => u.id === otherId);
      if (otherUser) {
        chatName = otherUser.username;
        chatAvatar = otherUser.avatarUrl;
      }
    }

    return {
      ...chat,
      name: chatName,
      avatarUrl: chatAvatar,
    };
  });

  res.json(resolvedChats);
});

// 7. Create a chat / group
app.post("/api/chats", (req, res) => {
  const { name, isGroup, participantIds, createdBy } = req.body;
  if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0 || !createdBy) {
    return res.status(400).json({ error: "Invalid participants or creator." });
  }

  const db = readDB();

  // If Direct Message, check if chat already exists
  if (!isGroup && participantIds.length === 2) {
    const existing = db.chats.find(
      (c) =>
        !c.isGroup &&
        c.participantIds.includes(participantIds[0]) &&
        c.participantIds.includes(participantIds[1])
    );
    if (existing) {
      // Resolve name
      const otherId = existing.participantIds.find((id) => id !== createdBy);
      const otherUser = db.users.find((u) => u.id === otherId);
      return res.json({
        ...existing,
        name: otherUser ? otherUser.username : existing.name,
        avatarUrl: otherUser ? otherUser.avatarUrl : "",
      });
    }
  }

  const newChat: Chat = {
    id: `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: name || (isGroup ? "New Group Space" : "Direct Message"),
    isGroup: !!isGroup,
    participantIds: Array.from(new Set([...participantIds, createdBy])),
    createdBy,
    createdAt: new Date().toISOString(),
  };

  db.chats.push(newChat);
  writeDB(db);

  // Return resolved chat info
  let chatName = newChat.name;
  let chatAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(newChat.name)}`;

  if (!isGroup) {
    const otherId = newChat.participantIds.find((id) => id !== createdBy);
    const otherUser = db.users.find((u) => u.id === otherId);
    if (otherUser) {
      chatName = otherUser.username;
      chatAvatar = otherUser.avatarUrl;
    }
  }

  res.status(201).json({
    ...newChat,
    name: chatName,
    avatarUrl: chatAvatar,
  });
});

// 8. Join an existing group chat (or add oneself to group)
app.post("/api/chats/join", (req, res) => {
  const { chatId, userId } = req.body;
  if (!chatId || !userId) {
    return res.status(400).json({ error: "chatId and userId are required." });
  }

  const db = readDB();
  const chatIndex = db.chats.findIndex((c) => c.id === chatId);

  if (chatIndex === -1) {
    return res.status(404).json({ error: "Chat space not found." });
  }

  const chat = db.chats[chatIndex];
  if (!chat.isGroup) {
    return res.status(400).json({ error: "Cannot join direct message spaces." });
  }

  if (!chat.participantIds.includes(userId)) {
    chat.participantIds.push(userId);
    writeDB(db);
  }

  res.json({ success: true, chat });
});

// 9. Get messages for a chat
app.get("/api/chats/:chatId/messages", (req, res) => {
  const { chatId } = req.params;
  const { userId } = req.query;
  const db = readDB();
  
  const chatMessages = db.messages.filter((m) => m.chatId === chatId);
  let changed = false;

  if (userId) {
    db.messages.forEach((msg) => {
      if (msg.chatId === chatId && msg.senderId !== userId && !msg.seen) {
        msg.seen = true;
        changed = true;
      }
    });
  }

  // Also simulate bot messages being seen immediately
  if (chatId === "chat-general") {
    db.messages.forEach((msg) => {
      if (msg.chatId === chatId && msg.senderId === userId && !msg.seen) {
        msg.seen = true;
        changed = true;
      }
    });
  }

  if (changed) {
    writeDB(db);
  }

  res.json(chatMessages);
});

// 10. Send a message to a chat
app.post("/api/chats/:chatId/messages", (req, res) => {
  const { chatId } = req.params;
  const { senderId, text } = req.body;
  if (!senderId || !text) {
    return res.status(400).json({ error: "Missing senderId or message text." });
  }

  const db = readDB();
  const user = db.users.find((u) => u.id === senderId);
  if (!user) {
    return res.status(404).json({ error: "Sender user profile not found." });
  }

  const chat = db.chats.find((c) => c.id === chatId);
  if (!chat) {
    return res.status(404).json({ error: "Chat space not found." });
  }

  const newMessage: Message = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    chatId,
    senderId,
    senderName: user.username,
    senderAvatar: user.avatarUrl,
    text,
    createdAt: new Date().toISOString(),
  };

  db.messages.push(newMessage);

  // Bot Auto Responder simulation!
  if (chatId === "chat-general" && text.toLowerCase().includes("@bot")) {
    const responses = [
      "Hello! I am Paralane Core Engine ⚡. How can I help you today?",
      "Beep boop! Fast. Safe. Sovereign. Paralane keeps your chats encrypted! 🛡️",
      "I love instant communication. Sub-millisecond sync, active lines! 🚀",
      "Yes! Registered users can click other users in the contact drawer to initiate fully persistent chats instantly!",
    ];
    const botMsg: Message = {
      id: `msg-${Date.now()}-bot`,
      chatId,
      senderId: "user-system",
      senderName: "Paralane Bot ⚡",
      senderAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=paralane",
      text: responses[Math.floor(Math.random() * responses.length)],
      createdAt: new Date(Date.now() + 100).toISOString(),
    };
    db.messages.push(botMsg);
  }

  writeDB(db);
  res.status(201).json(newMessage);
});

// Vite & Static server configuration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Paralane Server] Online on http://0.0.0.0:${PORT}`);
  });
}

startServer();
