import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import AppointmentDetail from "./pages/AppointmentDetail.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/appointments/:id" element={<AppointmentDetail />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
