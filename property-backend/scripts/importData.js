require('dotenv').config();
const fs = require('fs');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const Property = require('../models/Property');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

const results = [];

// Read and parse the CSV file
fs.createReadStream('../internship_ass.csv')
    .pipe(csv())
    .on('data', (data) => {
        // Transform the data to match our schema
        const property = {
            id: parseInt(data.id.replace('PROP', '')),
            title: data.title,
            type: data.type,
            price: parseFloat(data.price),
            state: data.state,
            city: data.city,
            areaSqFt: parseFloat(data.areaSqFt),
            bedrooms: parseInt(data.bedrooms),
            bathrooms: parseInt(data.bathrooms),
            amenities: data.amenities.split('|'),
            furnished: data.furnished === 'Furnished' ? true : (data.furnished === 'Semi' ? null : false),
            availableFrom: new Date(data.availableFrom),
            listedBy: data.listedBy,
            tags: data.tags.split('|'),
            colorTheme: data.colorTheme,
            rating: parseFloat(data.rating),
            isVerified: data.isVerified.toLowerCase() === 'true',
            listingType: data.listingType
        };
        results.push(property);
    })
    .on('end', async () => {
        try {

            await Property.deleteMany({});
            console.log('Cleared existing properties');

            await Property.insertMany(results);
            console.log(`Successfully imported ${results.length} properties`);
            
            mongoose.connection.close();
            process.exit(0);
        } catch (error) {
            console.error('Error importing data:', error);
            mongoose.connection.close();
            process.exit(1);
        }
    });
