import React, { useState, useCallback } from 'react';
import DashboardLayout from './DashboardLayout.jsx';
import '../styles/doctor-dashboard.scss';
import Billing from '../pages/Billing/Billing.jsx';
// Removed QR scanner; using manual add form instead
import AddMedicineForm from '../pages/Inventory/AddMedicineForm.jsx';
import Inventory from '../pages/Inventory/Inventory.jsx';
import { FaCashRegister, FaBarcode, FaBoxes, FaHistory } from 'react-icons/fa';
import PatientHistory from '../pages/Pharmacy/PatientHistory.jsx';

// Simple initial demo inventory
const initialInventory = [];

export default function PharmacyDashboard() {
  const [active, setActive] = useState('billing');
  const [inventory, setInventory] = useState(initialInventory);
  const session = (()=>{ try { return JSON.parse(localStorage.getItem('session')||'null') } catch { return null } })();
  const pharmacyId = session?.user?.id || session?.user?._id || undefined;

  React.useEffect(() => {
    if (!pharmacyId) return;
    fetch(`/api/inventory?pharmacyId=${encodeURIComponent(pharmacyId)}`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setInventory(data); })
      .catch(() => {});
  }, [pharmacyId]);

  const addMedicine = useCallback((med) => {
    setInventory(prev => {
      const existingIdx = prev.findIndex(m => m.drugCode === med.drugCode);
      if (existingIdx !== -1) {
        const updated = [...prev];
        updated[existingIdx] = { ...updated[existingIdx], quantity: updated[existingIdx].quantity + med.quantity };
        return updated;
      }
      return [...prev, med];
    });
  }, []);

  const updateStock = useCallback((drugCode, soldQty) => {
    setInventory(prev => prev.map(m => m.drugCode === drugCode ? { ...m, quantity: Math.max(0, m.quantity - soldQty) } : m));
  }, []);

  const menuItems = [
    { key: 'billing', label: 'Billing', icon: <FaCashRegister /> },
  { key: 'scan', label: 'Add Medicine', icon: <FaBarcode /> },
    { key: 'inventory', label: 'Inventory', icon: <FaBoxes /> },
    { key: 'history', label: 'Patient History', icon: <FaHistory /> },
  ];

  return (
    <div className="pharmacy-dashboard">
      <DashboardLayout
        brand="Pharmacy"
        menuItems={menuItems}
        active={active}
        setActive={setActive}
      >
        {active === 'billing' && (
          <section className="billing-pane">
            <h2>Billing</h2>
            <p>Create bills and automatically decrement stock.</p>
            <Billing inventory={inventory} updateStock={updateStock} />
          </section>
        )}
        {active === 'scan' && (
          <section className="scan-pane">
            <AddMedicineForm addMedicine={addMedicine} pharmacyId={pharmacyId} />
          </section>
        )}
        {active === 'inventory' && (
          <section className="inventory-pane">
            <Inventory inventory={inventory} addMedicine={addMedicine} />
          </section>
        )}
        {active === 'history' && (
          <section className="history-pane">
            <PatientHistory />
          </section>
        )}
      </DashboardLayout>
    </div>
  );
}
