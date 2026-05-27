import { Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AdminPage from "./pages/AdminPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/admin/*" element={<AdminPage />} />
    </Routes>
  );
}

export default App;
