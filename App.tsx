import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Counterparties from './pages/Counterparties';
import Products from './pages/Products';
import Services from './pages/Services';
import Sales from './pages/Sales';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import SubProjects from './pages/SubProjects';
import SubProjectDetail from './pages/SubProjectDetail';
import Tasks from './pages/Tasks';
import NotFound from './pages/NotFound';
import Settings from './pages/Settings';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="counterparties" element={<Counterparties />} />
          <Route path="products" element={<Products />} />
          <Route path="services" element={<Services />} />
          <Route path="sales" element={<Sales />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:id" element={<ProjectDetail />} />
          <Route path="subprojects" element={<SubProjects />} />
          <Route path="subprojects/:id" element={<SubProjectDetail />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;