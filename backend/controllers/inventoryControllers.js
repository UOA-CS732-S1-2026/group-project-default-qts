const mongoose = require('mongoose');
const InventoryItem = require('../models/InventoryItem');

const getInventory = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_AUTH_USER',
          message: 'Authenticated user id is missing or invalid',
          details: {}
        }
      });
    }

    const inventoryItems = await InventoryItem.find({ userId })
      .populate('storeItemId', 'code name type price growthValue')
      .sort({ createdAt: 1 });

    const items = inventoryItems.map((entry) => ({
      id: entry._id,
      storeItemId: entry.storeItemId?._id || null,
      itemCode: entry.storeItemId?.code || null,
      itemName: entry.storeItemId?.name || null,
      type: entry.storeItemId?.type || null,
      price: entry.storeItemId?.price ?? null,
      growthValue: entry.storeItemId?.growthValue ?? null,
      quantity: entry.quantity
    }));

    return res.status(200).json({
      success: true,
      message: 'Inventory loaded successfully',
      data: {
        items
      }
    });
  } catch (error) {
    console.error('getInventory error:', error);

    return res.status(500).json({
      success: false,
      error: {
        code: 'INVENTORY_FETCH_FAILED',
        message: 'Failed to load inventory',
        details: {}
      }
    });
  }
};

module.exports = {
  getInventory
};
