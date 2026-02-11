const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs/promises");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const playlistRoutes = require("./routes/playlists");
const favoritesRoutes = require("./routes/favorites");
const tracksRoutes = require("./routes/tracks");
const videoClipsRoutes = require("./routes/videoClips");
const subscriptionsRoutes = require("./routes/subscriptions");
const shareCapsulesRoutes = require("./routes/shareCapsules");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.use(cors({
    origin: ['http://localhost:3000', 'https://nerd-music-platform-production.up.railway.app'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: "1mb" }));

app.use(express.static(path.resolve(__dirname, "../..")));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/more-playlists", async (req, res, next) => {
  try {
    const filePath = path.resolve(__dirname, "../..", "frontend", "src", "more-playlists.json");
    const data = await fs.readFile(filePath, "utf-8");
    const playlists = JSON.parse(data);
    return res.json(playlists);
  } catch (error) {
    return next(error);
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/playlists", playlistRoutes);
app.use("/api/favorites", favoritesRoutes);
app.use("/api/tracks", tracksRoutes);
app.use("/api/tracks", videoClipsRoutes);
app.use("/api/subscription", subscriptionsRoutes);
app.use("/api/share-capsules", shareCapsulesRoutes);

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../..", "index.html"));
});

app.use(errorHandler);

module.exports = app;
