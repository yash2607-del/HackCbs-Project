import Billing from '../models/Billing.js';
import Inventory from '../models/Inventory.js';

export const createBill = async (req, res) => {
  const { pharmacyId, items, total } = req.body;
  // Reduce inventory quantities
  for (const it of items) {
    const item = await Inventory.findOne({ drugCode: it.drugCode, pharmacyId });
    if (!item || item.quantity < it.qty) {
      return res.status(400).json({ error: `Insufficient stock for ${it.name}` });
    }
    item.quantity -= it.qty;
    await item.save();
  }
  // Store bill
  const bill = new Billing({ pharmacyId, items, total });
  await bill.save();
  res.json(bill);
};

export const getBills = async (req, res) => {
  const { pharmacyId } = req.query;
  const bills = await Billing.find({ pharmacyId });
  res.json(bills);
};
