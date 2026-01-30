const express = require('express');
const router = express.Router();
const Measurement = require('../models/Measurement');

router.get('/', async (req, res) => {
  try {
    const { field, start_date, end_date, sensor_id } = req.query;
    
    if (!field) {
      return res.status(400).json({ error: 'Field parameter is required' });
    }

    const query = {};
    
    if (start_date || end_date) {
      query.timestamp = {};
      if (start_date) {
        const startDate = new Date(start_date);
        if (isNaN(startDate.getTime())) {
          return res.status(400).json({ error: 'Invalid start_date format. Use YYYY-MM-DD' });
        }
        query.timestamp.$gte = startDate;
      }
      if (end_date) {
        const endDate = new Date(end_date);
        endDate.setHours(23, 59, 59, 999); 
        if (isNaN(endDate.getTime())) {
          return res.status(400).json({ error: 'Invalid end_date format. Use YYYY-MM-DD' });
        }
        query.timestamp.$lte = endDate;
      }
    }
    
    if (sensor_id) {
      query.sensor_id = sensor_id;
    }

    const validFields = ['field1', 'field2', 'field3'];
    if (!validFields.includes(field)) {
      return res.status(400).json({ 
        error: 'Invalid field name. Use field1, field2, or field3' 
      });
    }

    const measurements = await Measurement.find(query, {
      timestamp: 1,
      [field]: 1,
      _id: 0
    }).sort({ timestamp: 1 });

    res.json(measurements);
    
  } catch (error) {
    console.error('Error fetching measurements:', error);
    res.status(500).json({ error: 'Failed to fetch measurements' });
  }
});

router.get('/metrics', async (req, res) => {
  try {
    const { field, start_date, end_date, sensor_id } = req.query;
    
    if (!field) {
      return res.status(400).json({ error: 'Field parameter is required' });
    }

    const query = {};
    
    if (start_date || end_date) {
      query.timestamp = {};
      if (start_date) {
        const startDate = new Date(start_date);
        if (isNaN(startDate.getTime())) {
          return res.status(400).json({ error: 'Invalid start_date format' });
        }
        query.timestamp.$gte = startDate;
      }
      if (end_date) {
        const endDate = new Date(end_date);
        endDate.setHours(23, 59, 59, 999);
        if (isNaN(endDate.getTime())) {
          return res.status(400).json({ error: 'Invalid end_date format' });
        }
        query.timestamp.$lte = endDate;
      }
    }
    
    if (sensor_id) {
      query.sensor_id = sensor_id;
    }

    const validFields = ['field1', 'field2', 'field3'];
    if (!validFields.includes(field)) {
      return res.status(400).json({ 
        error: 'Invalid field name. Use field1, field2, or field3' 
      });
    }

    const measurements = await Measurement.find(query, {
      [field]: 1
    });

    if (measurements.length === 0) {
      return res.status(404).json({ error: 'No data found for the specified criteria' });
    }

    const values = measurements.map(m => m[field]);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    const squareDiffs = values.map(value => {
      const diff = value - avg;
      return diff * diff;
    });
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(avgSquareDiff);

    res.json({
      field,
      avg: parseFloat(avg.toFixed(2)),
      min: parseFloat(min.toFixed(2)),
      max: parseFloat(max.toFixed(2)),
      stdDev: parseFloat(stdDev.toFixed(2)),
      count: values.length
    });
    
  } catch (error) {
    console.error('Error calculating metrics:', error);
    res.status(500).json({ error: 'Failed to calculate metrics' });
  }
});

module.exports = router;