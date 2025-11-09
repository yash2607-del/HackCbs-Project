import { useMemo } from 'react';

export default function usePharmacySession() {
  const session = useMemo(() => {
    try {
      const raw = localStorage.getItem('session');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }, []);

  const role = session?.role;
  const pharmacyId = session?.pharmacyId || session?.pharmacyID || session?.pharmacy_id;
  const pharmacyName = session?.pharmacyName || session?.user?.shopName || 'Pharmacy';
  const token = session?.token;

  return { role, pharmacyId, pharmacyName, token };
}
