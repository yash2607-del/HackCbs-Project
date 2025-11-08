import Inventory from '../models/Inventory.js';
import mongoose from 'mongoose';

// Simple in-memory fallback when MongoDB is not connected (dev/test only)
const mockInventory = [];

const dbConnected = () => mongoose.connection && mongoose.connection.readyState === 1;

export const getInventory = async (req, res) => {
  try {
    const { pharmacyId } = req.query || {};
    if (dbConnected()) {
      const query = pharmacyId ? { pharmacyId } : {};
      const items = await Inventory.find(query);
      return res.json(items);
    }
    if (pharmacyId) return res.json(mockInventory.filter(i => i.pharmacyId === pharmacyId));
    return res.json(mockInventory);
  } catch (err) {
    console.error('getInventory err', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const addInventory = async (req, res) => {
  try {
    if (dbConnected()) {
      const newItem = new Inventory(req.body);
      await newItem.save();
      return res.json(newItem);
    }
    // fallback: push to mock array and return the object with fake _id
    const item = { ...req.body, _id: String(Date.now()) };
    mockInventory.push(item);
    return res.json(item);
  } catch (err) {
    console.error('addInventory err', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const updateStock = async (req, res) => {
  try {
    const { drugCode, qty, pharmacyId } = req.body;
    if (dbConnected()) {
      const item = await Inventory.findOne({ drugCode, pharmacyId });
      if (!item) return res.status(404).json({ error: 'Item not found' });
      if (item.quantity < qty) return res.status(400).json({ error: 'Insufficient stock' });
      item.quantity -= qty;
      await item.save();
      return res.json({ success: true });
    }
    // fallback
    const idx = mockInventory.findIndex(i => i.drugCode === drugCode && (!pharmacyId || i.pharmacyId === pharmacyId));
    if (idx === -1) return res.status(404).json({ error: 'Item not found (mock)' });
    if (mockInventory[idx].quantity < qty) return res.status(400).json({ error: 'Insufficient stock (mock)' });
    mockInventory[idx].quantity -= qty;
    return res.json({ success: true });
  } catch (err) {
    console.error('updateStock err', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
