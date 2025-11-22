import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initSecurityChecks } from "./middleware/securityHeaders";

// Initialize security checks
initSecurityChecks();

createRoot(document.getElementById("root")!).render(<App />);
