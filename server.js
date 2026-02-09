const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const { updateDailyReturns, processInvestments } = require("./jobs/dailyReturns");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const packageRoutes = require("./routes/packages");
const investmentRoutes = require("./routes/investments");
const transactionRoutes = require("./routes/transactions");
const adminRoutes = require("./routes/admin");
const settingsRoutes = require("./routes/settings");
const transferRoutes = require("./routes/transfers");
const chatRoutes = require("./routes/chat");

const app = express();

// Trust proxy - Required for rate limiting behind reverse proxy (Render)
app.set('trust proxy', 1);

// CORS configuration - Must be before other middleware
const corsOptions = {
	origin: [
		process.env.FRONTEND_URL || "http://localhost:8080",
		"http://localhost:7000",
		"http://localhost:8080"
	],
	credentials: true,
	optionsSuccessStatus: 200,
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
app.use(cors(corsOptions));

// Security middleware
app.use(helmet({
	crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Language middleware
app.use((req, res, next) => {
	const acceptLanguage = req.headers["accept-language"];
	req.language = acceptLanguage ? acceptLanguage.split(",")[0] : "en";
	next();
});

// Swagger configuration
const swaggerOptions = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "Crypto Investment Platform API",
			version: "1.0.0",
			description:
				"Comprehensive API for crypto investment platform with user management, investments, and admin features",
		},
		servers: [
			{
				url: process.env.API_URL || "https://minecrust-backend.onrender.com",
				description: "Development server",
			},
		],
		components: {
			securitySchemes: {
				bearerAuth: {
					type: "http",
					scheme: "bearer",
					bearerFormat: "JWT",
				},
			},
		},
	},
	apis: ["./routes/*.js", "./models/*.js"],
};

const specs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/packages", packageRoutes);
app.use("/api/investments", investmentRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/transfers", transferRoutes);
app.use("/api/chat", chatRoutes);

// Health check
app.get("/api/health", (req, res) => {
	res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({
		message: "Something went wrong!",
		error: process.env.NODE_ENV === "development" ? err.message : {},
	});
});

// 404 handler
app.use("*", (req, res) => {
	res.status(404).json({ message: "Route not found" });
});

// Database connection
mongoose
	.connect(
		process.env.MONGODB_URI || "mongodb://localhost:27017/crypto-investment",
		{
			useNewUrlParser: true,
			useUnifiedTopology: true,
		}
	)
	.then(() => console.log("MongoDB connected successfully"))
	.catch((err) => console.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
	console.log(
		`API Documentation available at http://localhost:${PORT}/api-docs`
	);

	// Start daily returns cron job
	updateDailyReturns.start();
	console.log("Investment processing cron job started (runs every 6 hours)");
	
	// Run immediately on startup
	processInvestments();
});

module.exports = app;
