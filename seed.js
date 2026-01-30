const mongoose = require('mongoose');
const Measurement = require('./models/Measurement');

mongoose.connect('mongodb://localhost:27017/analytics_db')
  .then(() => console.log('Connected to MongoDB for seeding...'))
  .catch(err => console.error('MongoDB connection error:', err));

async function seedData() {
  try {
    await Measurement.deleteMany({});
    
    const measurements = [];
    const startDate = new Date('2025-01-01');
    
    for (let day = 0; day < 30; day++) {
      for (let hour = 0; hour < 24; hour++) {
        const timestamp = new Date(startDate);
        timestamp.setDate(startDate.getDate() + day);
        timestamp.setHours(hour, 0, 0, 0);
        
        const baseTemp = 20 + Math.sin(day / 30 * Math.PI * 2) * 10;
        const temp = baseTemp + (Math.random() * 4 - 2);
        
        const humidity = 40 + Math.sin(day / 30 * Math.PI + Math.PI/2) * 20 + (Math.random() * 10 - 5);
        const co2 = 400 + Math.sin(hour / 24 * Math.PI * 2) * 100 + (Math.random() * 50 - 25);
        
        measurements.push({
          timestamp,
          field1: parseFloat(temp.toFixed(2)),
          field2: parseFloat(humidity.toFixed(2)),
          field3: parseFloat(co2.toFixed(2)),
          sensor_id: 'default'
        });
      }
    }
    
    await Measurement.insertMany(measurements);
    console.log(`✅ Inserted ${measurements.length} records`);
    
    const count = await Measurement.countDocuments();
    console.log(`📊 Total documents in collection: ${count}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedData();