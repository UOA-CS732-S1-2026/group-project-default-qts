const mongoose = require('mongoose');
const InventoryItem = require('../models/InventoryItem');
const StoreItem = require('../models/StoreItem');

const getInventory = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'USER_ID_REQUIRED',
          message: 'userId is required in query string',
          details: {}
        }
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_USER_ID',
          message: 'userId is not a valid ObjectId',
          details: {}
        }
      });
    }

    const inventoryItems = await InventoryItem.find({ userId })
      .populate('storeItemId', 'code name type price growthValue')
      .sort({ createdAt: 1 });

    const items = inventoryItems.map((entry) => ({
      id: entry._id,
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