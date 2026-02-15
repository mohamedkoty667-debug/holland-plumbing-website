const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- Config ----------
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

// ---------- Business data ----------
const site = {
  name: "HOLLAND BATHROOM AND PLUMBING",
  phone: "+44 20 3976 0284",
  whatsapp: "+44 20 3976 0284",
  companyNumber: "14389725",
  vat: "482600009",
  serviceArea: "London & surrounding areas",
  hours: "Mon–Sun: 24/7 by appointment",
  address: "8 Swanscombe Rd, London W11 4SX, UK"
};

// Helpers
function waLink(number) {
  return "https://wa.me/" + String(number).replace(/[^\d]/g, "");
}
function telLink(number) {
  return "tel:" + String(number).replace(/\s/g, "");
}

// ---------- Latest Work (20 photos) ----------
// Reads real files from: public/image/work
// Creates URLs like: /image/work/filename.jpg
function loadLatestWork() {
  const workDir = path.join(__dirname, "public", "image", "work");

  try {
    const files = fs
      .readdirSync(workDir)
      .filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    return files.slice(0, 20).map((file) => ({
      image: `/image/work/${file}`
    }));
  } catch (err) {
    console.log("Work images folder not found:", workDir);
    console.log("Error:", err.message);
    return [];
  }
}

// ---------- Orders storage ----------
const ordersPath = path.join(__dirname, "data", "orders.json");

function safeReadOrders() {
  try {
    const raw = fs.readFileSync(ordersPath, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function safeWriteOrders(orders) {
  fs.writeFileSync(ordersPath, JSON.stringify(orders, null, 2), "utf8");
}

function nowISO() {
  return new Date().toISOString();
}

// Make common data available to all views
app.use((req, res, next) => {
  res.locals.site = site;
  res.locals.waLink = waLink(site.whatsapp);
  res.locals.telLink = telLink(site.phone);
  res.locals.path = req.path;
  next();
});

// Debug route (اختياري): يشوفك الصور اللي اتقريت من السيرفر
app.get("/debug/work", (req, res) => {
  const latestWork = loadLatestWork();
  res.json({ count: latestWork.length, latestWork });
});

// ---------- Routes ----------
app.get("/", (req, res) => res.render("home", { pageTitle: "Home" }));

app.get("/services", (req, res) =>
  res.render("services", { pageTitle: "Services" })
);

// Latest Work (replaces stock)
app.get("/our-stock", (req, res) => {
  const latestWork = loadLatestWork();
  res.render("stock", { pageTitle: "Latest Work", latestWork });
});

app.get("/about", (req, res) =>
  res.render("about", { pageTitle: "About" })
);

app.get("/contact", (req, res) =>
  res.render("contact", { pageTitle: "Contact" })
);

app.get("/make-an-order", (req, res) => {
  res.render("order", { pageTitle: "Make an Order", errors: null, form: {} });
});

app.post("/make-an-order", (req, res) => {
  const form = {
    fullName: (req.body.fullName || "").trim(),
    phone: (req.body.phone || "").trim(),
    email: (req.body.email || "").trim(),
    address: (req.body.address || "").trim(),
    serviceType: (req.body.serviceType || "").trim(),
    preferredDate: (req.body.preferredDate || "").trim(),
    details: (req.body.details || "").trim()
  };

  const errors = {};
  if (!form.fullName) errors.fullName = "Please enter your full name.";
  if (!form.phone) errors.phone = "Please enter a phone number.";
  if (!form.serviceType) errors.serviceType = "Please choose a service.";
  if (!form.details || form.details.length < 10)
    errors.details = "Please add at least 10 characters describing the job.";

  if (Object.keys(errors).length > 0) {
    return res.status(400).render("order", {
      pageTitle: "Make an Order",
      errors,
      form
    });
  }

  const orders = safeReadOrders();
  const record = {
    id: "ORD-" + (orders.length + 1),
    createdAt: nowISO(),
    ...form
  };

  orders.unshift(record);
  safeWriteOrders(orders);

  res.render("thanks", { pageTitle: "Thank You", record });
});

// Simple admin view (optional)
app.get("/admin/orders", (req, res) => {
  const orders = safeReadOrders();
  res.render("orders", { pageTitle: "Orders", orders });
});

// 404
app.use((req, res) => res.status(404).render("404", { pageTitle: "Not Found" }));

app.listen(PORT, () => console.log(`Running: http://localhost:${PORT}`));
