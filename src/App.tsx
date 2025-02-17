import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { ERDPage } from "./pages/ERDPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/erd/:id" element={<ERDPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
