const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const { xss } = require("express-xss-sanitizer");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const path = require("path");

// Load Swagger document
const swaggerDocument = YAML.load(path.join(__dirname, "./swagger.yaml"));

// Load swagger styles
const CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css";

// route files
const hotels = require("./routes/hotels");
const auth = require("./routes/auth");
const bookings = require("./routes/bookings");
const accounts = require("./routes/accounts");
const roomTypes = require('./routes/roomTypes');
const manager = require('./routes/manager');

// load dotenv
dotenv.config({ path: "./config/config.env" });

// rate limit
const limiter = rateLimit({
  windowsMs: 10 * 50 * 1000,
  max: 100,
});

// connect DB here
connectDB();

const app = express();

// body parser
app.use(express.json());
app.use(cookieParser());
app.use(mongoSanitize());
app.use(helmet());
app.use(xss());
app.use(hpp());
app.use(cors());
app.use(limiter);

// Serve static files
app.use('/swagger', express.static(path.join(__dirname, './swagger.yaml')));

// Swagger UI
const swaggerUICss = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.3.0/swagger-ui.min.css";
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    customCss: '.swagger-ui .opblock .opblock-summary-path-description-wrapper { align-items: center; display: flex; flex-wrap: wrap; gap: 0 10px; padding: 0 10px; width: 100%; }',
    customCssUrl: swaggerUICss,
  })
);

app.use("/api/v1/hotels", hotels);
app.use("/api/v1/bookings", bookings);
app.use("/api/v1/auth", auth);
app.use("/api/v1/accounts", accounts)
app.use('/api/v1/roomtypes', roomTypes);
app.use('/api/v1/manager', manager);

const PORT = process.env.PORT || 5000;
app.listen(
  PORT,
  console.log(
    "Server running in ",
    process.env.NODE_ENV,
    " mode on port ",
    PORT
  )
);
