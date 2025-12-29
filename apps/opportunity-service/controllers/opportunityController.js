const Opportunity = require('../models/Opportunity');
const { formatResponse } = require('../../../packages/utils');

// @desc    Get all opportunities
// @route   GET /api/opportunities
// @access  Public
exports.getOpportunities = async (req, res) => {
  try {
    console.log('[Opportunity Service] Fetching all opportunities...');
    const opportunities = await Opportunity.find().sort({ createdAt: -1 });
    console.log(`[Opportunity Service] Found ${opportunities.length} opportunities`);
    formatResponse(res, 200, 'Opportunities retrieved successfully', opportunities);
  } catch (err) {
    console.error('[Opportunity Service] Error fetching opportunities:', err);
    formatResponse(res, 500, 'Server Error', err.message);
  }
};

// @desc    Get single opportunity
// @route   GET /api/opportunities/:id
// @access  Public
exports.getOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return formatResponse(res, 404, 'Opportunity not found');
    }

    formatResponse(res, 200, 'Opportunity retrieved successfully', opportunity);
  } catch (err) {
    formatResponse(res, 500, 'Server Error', err.message);
  }
};

// @desc    Create new opportunity
// @route   POST /api/opportunities
// @access  Public
exports.createOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.create(req.body);
    formatResponse(res, 201, 'Opportunity created successfully', opportunity);
  } catch (err) {
    formatResponse(res, 400, 'Invalid data', err.message);
  }
};

// @desc    Update opportunity
// @route   PUT /api/opportunities/:id
// @access  Public
exports.updateOpportunity = async (req, res) => {
  try {
    let opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return formatResponse(res, 404, 'Opportunity not found');
    }

    opportunity = await Opportunity.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    formatResponse(res, 200, 'Opportunity updated successfully', opportunity);
  } catch (err) {
    formatResponse(res, 500, 'Server Error', err.message);
  }
};

// @desc    Delete opportunity
// @route   DELETE /api/opportunities/:id
// @access  Public
exports.deleteOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return formatResponse(res, 404, 'Opportunity not found');
    }

    await opportunity.deleteOne();

    formatResponse(res, 200, 'Opportunity deleted successfully', {});
  } catch (err) {
    formatResponse(res, 500, 'Server Error', err.message);
  }
};
