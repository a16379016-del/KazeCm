/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import Home from './pages/Home';
import CommissionForm from './pages/CommissionForm';
import Progress from './pages/Progress';
import Admin from './pages/Admin';
import QuoteForm from './pages/QuoteForm';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/commission" element={<CommissionForm />} />
          <Route path="/quote" element={<QuoteForm />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Layout>
    </Router>
  );
}
