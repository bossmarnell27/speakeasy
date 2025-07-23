"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const auth_1 = __importDefault(require("./routes/auth"));
const class_1 = __importDefault(require("./routes/class"));
const assignments_1 = __importDefault(require("./routes/assignments"));
const submissions_1 = __importDefault(require("./routes/submissions"));
const webhook_1 = __importDefault(require("./routes/webhook"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json());
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Speakeasy API is running' });
});
app.use('/api/auth', auth_1.default);
app.use('/api/class', class_1.default);
app.use('/api/assignments', assignments_1.default);
app.use('/api/submissions', submissions_1.default);
app.use('/api/webhook', webhook_1.default);
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
