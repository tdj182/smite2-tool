import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import GodsList from './pages/GodsList';
import GodDetail from './pages/GodDetail';
import ItemsList from './pages/ItemsList';
import ItemDetail from './pages/ItemDetail';
import BuildsList from './pages/BuildsList';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="gods" element={<GodsList />} />
          <Route path="gods/:godId" element={<GodDetail />} />
          <Route path="items" element={<ItemsList />} />
          <Route path="items/:itemId" element={<ItemDetail />} />
          <Route path="builds" element={<BuildsList />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
