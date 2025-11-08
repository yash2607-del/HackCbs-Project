import PharmacyDetails from '../models/PharmacyDetails.js';

export const createPharmacy = async (req, res) => {
  const pharmacy = new PharmacyDetails(req.body);
  await pharmacy.save();
  res.json(pharmacy);
};

export const getPharmacies = async (req, res) => {
  const pharmacies = await PharmacyDetails.find();
  res.json(pharmacies);
};
