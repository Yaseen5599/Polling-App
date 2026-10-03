import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { CreatePollPage } from './pages/CreatePollPage';
import { VotePage } from './pages/VotePage';
import { ResultsPage } from './pages/ResultsPage';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
            <Navbar />
            <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/create" element={<CreatePollPage />} />
                <Route path="/poll/:id" element={<VotePage />} />
                <Route path="/poll/:id/results" element={<ResultsPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;
