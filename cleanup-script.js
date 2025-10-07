// MongoDB Cleanup Script
// Run this with: mongosh "mongodb+srv://fiifi-dev-v2:y7LYAZGR5zoK16yp@fiifi-dev.h3qwt.mongodb.net/" cleanup-script.js

console.log("🧹 MongoDB Atlas Cleanup Script");
console.log("================================");

// Get database stats
const db = db.getSiblingDB('fiifi');
const stats = db.stats();
console.log("Database Stats:");
console.log(`- Data Size: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
console.log(`- Storage Size: ${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`);
console.log(`- Index Size: ${(stats.indexSize / 1024 / 1024).toFixed(2)} MB`);
console.log(`- Total Size: ${(stats.totalSize / 1024 / 1024).toFixed(2)} MB`);
console.log("");

// List all collections
const collections = db.getCollectionNames();
console.log("Collections found:");
collections.forEach(name => {
    const coll = db.getCollection(name);
    const count = coll.countDocuments();
    const stats = coll.stats();
    console.log(`- ${name}: ${count} documents, ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
});

console.log("");
console.log("💡 Cleanup Suggestions:");
console.log("1. Delete old test data");
console.log("2. Remove duplicate documents");
console.log("3. Clean up temporary collections");
console.log("4. Remove large unused fields");

// Example cleanup commands (uncomment to use):
// db.companies.deleteMany({createdAt: {$lt: new Date(Date.now() - 30*24*60*60*1000)}});
// db.test_collection.drop();
// db.companies.remove({status: "test"});
