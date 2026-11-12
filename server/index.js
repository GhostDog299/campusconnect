require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "campusconnect-dev-secret-change-in-prod";

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());

// ── In-memory data store (replace with Postgres in production) ──
const db = {
  users: [],
  posts: [],
  resources: [],
  studyGroups: [],
  connections: [],
};

// Seed some demo data
const seedData = () => {
  const demoUsers = [
    { id: "u1", name: "Alex Chen", email: "alex@university.edu", passwordHash: bcrypt.hashSync("demo123", 10), major: "Software Engineering", year: 3, university: "University of Toronto", bio: "Passionate about distributed systems and open source.", skills: ["React", "Node.js", "Python", "Docker"], reputation: 420, avatar: null, role: "student" },
    { id: "u2", name: "Priya Sharma", email: "priya@university.edu", passwordHash: bcrypt.hashSync("demo123", 10), major: "Mechatronics Engineering", year: 2, university: "University of Toronto", bio: "Robotics enthusiast. Currently working on my senior design project.", skills: ["C++", "ROS", "SolidWorks", "Arduino"], reputation: 285, avatar: null, role: "student" },
    { id: "u3", name: "Dr. James Okafor", email: "j.okafor@university.edu", passwordHash: bcrypt.hashSync("demo123", 10), major: "Software Engineering", year: null, university: "University of Toronto", bio: "Professor of Computer Science. Research focus: ML systems.", skills: ["Machine Learning", "Python", "Research"], reputation: 980, avatar: null, role: "professor" },
    { id: "u4", name: "Marcus Webb", email: "marcus@university.edu", passwordHash: bcrypt.hashSync("demo123", 10), major: "Mechanical Engineering", year: 4, university: "University of Toronto", bio: "Final year mech. Looking for co-op in aerospace.", skills: ["MATLAB", "AutoCAD", "Thermodynamics"], reputation: 310, avatar: null, role: "student" },
  ];
  db.users = demoUsers;

  db.posts = [
    { id: "p1", authorId: "u3", content: "Office hours this week are moved to Thursday 2–4pm. Bring your questions about the midterm topics — specifically concurrency and memory management.", major: "Software Engineering", timestamp: new Date(Date.now() - 3600000).toISOString(), likes: ["u1", "u2"], comments: [] },
    { id: "p2", authorId: "u1", content: "Just finished setting up a Docker-based dev environment for our OS assignment. Happy to share the docker-compose file if anyone wants it — DM me!", major: "Software Engineering", timestamp: new Date(Date.now() - 7200000).toISOString(), likes: ["u2", "u4"], comments: [{ id: "c1", authorId: "u2", text: "Yes please! That would save me hours.", timestamp: new Date().toISOString() }] },
    { id: "p3", authorId: "u2", content: "Anyone else struggling with the PID controller tuning in Lab 4? My robot keeps oscillating. Found a really good YouTube series on Ziegler–Nichols method if useful.", major: "Mechatronics Engineering", timestamp: new Date(Date.now() - 14400000).toISOString(), likes: ["u4"], comments: [] },
    { id: "p4", authorId: "u4", content: "Sharing my heat transfer formula sheet for the upcoming exam — peer-reviewed by three classmates. Link in the resources section!", major: "Mechanical Engineering", timestamp: new Date(Date.now() - 86400000).toISOString(), likes: ["u1", "u2", "u3"], comments: [] },
  ];

  db.resources = [
    { id: "r1", uploaderId: "u4", title: "Heat Transfer Formula Sheet", description: "Comprehensive cheat sheet covering conduction, convection, radiation. Exam-ready.", major: "Mechanical Engineering", type: "notes", endorsedBy: ["u3"], downloads: 47, timestamp: new Date(Date.now() - 86400000).toISOString() },
    { id: "r2", uploaderId: "u1", title: "OS Concepts — Week 1-6 Summary", description: "Condensed notes from lectures 1 through 6. Covers processes, threads, scheduling.", major: "Software Engineering", type: "notes", endorsedBy: ["u3"], downloads: 83, timestamp: new Date(Date.now() - 172800000).toISOString() },
    { id: "r3", uploaderId: "u3", title: "Midterm Practice Problems (with solutions)", description: "12 practice problems covering all midterm topics. Professor-verified solutions.", major: "Software Engineering", type: "practice", endorsedBy: ["u3"], downloads: 156, timestamp: new Date(Date.now() - 259200000).toISOString() },
    { id: "r4", uploaderId: "u2", title: "ROS2 Setup Guide for Ubuntu 22.04", description: "Step-by-step guide I wrote after spending 8 hours debugging. Saves you the pain.", major: "Mechatronics Engineering", type: "guide", endorsedBy: [], downloads: 34, timestamp: new Date(Date.now() - 345600000).toISOString() },
  ];

  db.studyGroups = [
    { id: "sg1", name: "OS Midterm Prep", major: "Software Engineering", members: ["u1", "u2"], maxSize: 6, meetingTime: "Sat 2pm", location: "Bahen Centre Rm 1200", description: "Weekly sessions covering OS topics. Friendly to all levels.", createdBy: "u1" },
    { id: "sg2", name: "Mech Thermo Study Circle", major: "Mechanical Engineering", members: ["u4"], maxSize: 5, meetingTime: "Wed 6pm", location: "Sandford Fleming Library", description: "Going through past exams and problem sets together.", createdBy: "u4" },
  ];

  db.connections = [
    { userId: "u1", connectedTo: "u3" },
    { userId: "u2", connectedTo: "u1" },
  ];
};
seedData();

// ── Auth middleware ──
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

const safeUser = (u) => ({ id: u.id, name: u.name, email: u.email, major: u.major, year: u.year, university: u.university, bio: u.bio, skills: u.skills, reputation: u.reputation, role: u.role, avatar: u.avatar });

// ── Auth routes ──
app.post("/api/auth/register", async (req, res) => {
  const { name, email, major, year, university, password } = req.body;
  if (!email.endsWith(".edu")) return res.status(400).json({ error: "Must use a .edu email address" });
  if (db.users.find((u) => u.email === email)) return res.status(400).json({ error: "Email already registered" });
  const user = { id: uuidv4(), name, email, passwordHash: await bcrypt.hash(password, 10), major, year: parseInt(year), university, bio: "", skills: [], reputation: 0, role: "student", avatar: null };
  db.users.push(user);
  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user: safeUser(user) });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find((u) => u.email === email);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(400).json({ error: "Invalid credentials" });
  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user: safeUser(user) });
});

// ── User routes ──
app.get("/api/users/me", auth, (req, res) => {
  const user = db.users.find((u) => u.id === req.user.id);
  res.json(safeUser(user));
});

app.put("/api/users/me", auth, (req, res) => {
  const idx = db.users.findIndex((u) => u.id === req.user.id);
  const allowed = ["name", "bio", "skills", "major", "year", "university"];
  allowed.forEach((k) => { if (req.body[k] !== undefined) db.users[idx][k] = req.body[k]; });
  res.json(safeUser(db.users[idx]));
});

app.get("/api/users", auth, (req, res) => {
  const { major, search } = req.query;
  let users = db.users.filter((u) => u.id !== req.user.id);
  if (major) users = users.filter((u) => u.major === major);
  if (search) users = users.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.skills.some((s) => s.toLowerCase().includes(search.toLowerCase())));
  res.json(users.map(safeUser));
});

app.get("/api/users/:id", auth, (req, res) => {
  const user = db.users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(safeUser(user));
});

app.post("/api/users/:id/connect", auth, (req, res) => {
  const exists = db.connections.find((c) => c.userId === req.user.id && c.connectedTo === req.params.id);
  if (!exists) db.connections.push({ userId: req.user.id, connectedTo: req.params.id });
  res.json({ connected: true });
});

// ── Feed / posts routes ──
app.get("/api/posts", auth, (req, res) => {
  const { major } = req.query;
  let posts = [...db.posts];
  if (major) posts = posts.filter((p) => p.major === major);
  posts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  const enriched = posts.map((p) => ({ ...p, author: safeUser(db.users.find((u) => u.id === p.authorId)) }));
  res.json(enriched);
});

app.post("/api/posts", auth, (req, res) => {
  const user = db.users.find((u) => u.id === req.user.id);
  const post = { id: uuidv4(), authorId: req.user.id, content: req.body.content, major: user.major, timestamp: new Date().toISOString(), likes: [], comments: [] };
  db.posts.unshift(post);
  user.reputation += 10;
  res.json({ ...post, author: safeUser(user) });
});

app.post("/api/posts/:id/like", auth, (req, res) => {
  const post = db.posts.find((p) => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: "Not found" });
  const idx = post.likes.indexOf(req.user.id);
  if (idx > -1) post.likes.splice(idx, 1);
  else post.likes.push(req.user.id);
  res.json({ likes: post.likes });
});

app.post("/api/posts/:id/comment", auth, (req, res) => {
  const post = db.posts.find((p) => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: "Not found" });
  const comment = { id: uuidv4(), authorId: req.user.id, text: req.body.text, timestamp: new Date().toISOString() };
  post.comments.push(comment);
  res.json({ ...comment, author: safeUser(db.users.find((u) => u.id === req.user.id)) });
});

// ── Resources routes ──
app.get("/api/resources", auth, (req, res) => {
  const { major } = req.query;
  let resources = [...db.resources];
  if (major) resources = resources.filter((r) => r.major === major);
  resources.sort((a, b) => b.downloads - a.downloads);
  const enriched = resources.map((r) => ({ ...r, uploader: safeUser(db.users.find((u) => u.id === r.uploaderId)) }));
  res.json(enriched);
});

app.post("/api/resources", auth, (req, res) => {
  const user = db.users.find((u) => u.id === req.user.id);
  const resource = { id: uuidv4(), uploaderId: req.user.id, title: req.body.title, description: req.body.description, major: user.major, type: req.body.type || "notes", endorsedBy: [], downloads: 0, timestamp: new Date().toISOString() };
  db.resources.unshift(resource);
  user.reputation += 25;
  res.json({ ...resource, uploader: safeUser(user) });
});

app.post("/api/resources/:id/download", auth, (req, res) => {
  const resource = db.resources.find((r) => r.id === req.params.id);
  if (!resource) return res.status(404).json({ error: "Not found" });
  resource.downloads++;
  res.json({ downloads: resource.downloads });
});

// ── Study groups routes ──
app.get("/api/studygroups", auth, (req, res) => {
  const { major } = req.query;
  let groups = [...db.studyGroups];
  if (major) groups = groups.filter((g) => g.major === major);
  const enriched = groups.map((g) => ({ ...g, memberCount: g.members.length, isMember: g.members.includes(req.user.id) }));
  res.json(enriched);
});

app.post("/api/studygroups", auth, (req, res) => {
  const user = db.users.find((u) => u.id === req.user.id);
  const group = { id: uuidv4(), ...req.body, major: user.major, members: [req.user.id], createdBy: req.user.id };
  db.studyGroups.push(group);
  res.json(group);
});

app.post("/api/studygroups/:id/join", auth, (req, res) => {
  const group = db.studyGroups.find((g) => g.id === req.params.id);
  if (!group) return res.status(404).json({ error: "Not found" });
  if (!group.members.includes(req.user.id)) group.members.push(req.user.id);
  res.json({ members: group.members.length, isMember: true });
});

// ── Stats ──
app.get("/api/stats", auth, (req, res) => {
  const user = db.users.find((u) => u.id === req.user.id);
  res.json({
    connections: db.connections.filter((c) => c.userId === req.user.id).length,
    posts: db.posts.filter((p) => p.authorId === req.user.id).length,
    resources: db.resources.filter((r) => r.uploaderId === req.user.id).length,
    reputation: user.reputation,
  });
});

app.listen(PORT, () => console.log(`CampusConnect server running on port ${PORT}`));
