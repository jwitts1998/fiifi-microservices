#!/bin/bash

echo "🧹 MongoDB Atlas Cleanup Script"
echo "==============================="
echo ""
echo "Your database is at 97% capacity (496.96 MB / 512 MB)"
echo "Largest collections consuming space:"
echo ""
echo "1. rss_feeds: 221.90 MB (82,834 docs) - 43% of storage"
echo "2. crunchbase_companies: 91.87 MB (8,571 docs) - 18% of storage"  
echo "3. Organizations: 60.28 MB (4,316 docs) - 12% of storage"
echo "4. people: 34.88 MB (63,825 docs) - 7% of storage"
echo "5. master_people: 32.90 MB (61,019 docs) - 7% of storage"
echo "6. rss_report: 27.02 MB (882 docs) - 5% of storage"
echo ""
echo "💡 Recommended cleanup options:"
echo ""
echo "Option 1: Delete RSS feeds (safest - frees 221.90 MB)"
echo "Option 2: Delete old crunchbase data (frees 91.87 MB)"
echo "Option 3: Delete test/development data"
echo ""
echo "Would you like to proceed with cleanup? (y/n)"
read -p "> " response

if [[ "$response" =~ ^[Yy]$ ]]; then
    echo ""
    echo "🔧 Starting cleanup..."
    
    # Connect to MongoDB and delete rss_feeds collection
    mongosh "mongodb+srv://fiifi-dev-v2:y7LYAZGR5zoK16yp@fiifi-dev.h3qwt.mongodb.net/" --eval "
    use('fiifi');
    
    console.log('🗑️  Deleting rss_feeds collection...');
    const rssFeeds = db.getCollection('rss_feeds');
    const count = rssFeeds.countDocuments();
    console.log('Documents to delete:', count);
    
    // Drop the collection
    rssFeeds.drop();
    console.log('✅ rss_feeds collection deleted successfully');
    
    // Check new database size
    const stats = db.stats();
    console.log('');
    console.log('📊 New Database Stats:');
    console.log('- Data Size:', (stats.dataSize / 1024 / 1024).toFixed(2), 'MB');
    console.log('- Storage Size:', (stats.storageSize / 1024 / 1024).toFixed(2), 'MB');
    console.log('- Total Size:', (stats.totalSize / 1024 / 1024).toFixed(2), 'MB');
    console.log('');
    console.log('🎉 Cleanup complete! You should now be under the 512 MB limit.');
    "
else
    echo "Cleanup cancelled."
fi
