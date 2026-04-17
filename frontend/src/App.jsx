import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Skills from "./pages/skills";
import Salaries from "./pages/salaries";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/skills" element={<Skills />} />
        <Route path="/salaries" element={<Salaries />} />
      </Routes>
    </BrowserRouter>
  );
}