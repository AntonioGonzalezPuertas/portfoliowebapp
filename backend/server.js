require("./config/db.config");

const path = require("path"); //Rajout de cela pour gérer les chemins de fichiers
const cors = require("cors");

const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

const projectRoutes = require("./routes/projects.route");
const profileRoutes = require("./routes/profiles.route");
const authRoutes = require("./routes/auth.route");
const userRequestsRoutes = require("./routes/userRequests.route");
const statisticsRoutes = require("./routes/statistics.route");
const sessionRoutes = require("./routes/session.route");

app.get("/", (req, res) => {
  res.send(`server running on port ${port}: Portfolio Web App`);
});

//app.use(express.json());
// Augmenter la limite à 50 Mo par exemple
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cors());

// Donne accès aux fichiers statiques dans le dossier public'
app.use(
  "/projectsImages",
  express.static(path.join(__dirname, "public/projectsImages"))
);

app.use("/api/projects", projectRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/requests", userRequestsRoutes);
app.use("/api/stats", statisticsRoutes);
app.use("/api/sessions", sessionRoutes);

app.listen(port, () => {
  console.log(`server running at http://localhost:${port}`);
});
