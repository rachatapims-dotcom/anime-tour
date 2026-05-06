const fs = require('fs');

// We use the environment variables provided by GitHub Actions
const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function backupTable(tableName) {
    console.log(`📡 Fetching data from: ${tableName}...`);
    const url = `${supabaseUrl}/rest/v1/${tableName}?select=*`;
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'apikey': serviceKey,
                'Authorization': `Bearer ${serviceKey}`,
                'Range': '0-999' // Adjust if you have more than 1000 rows
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (!fs.existsSync('./backups')) {
            fs.mkdirSync('./backups');
        }

        fs.writeFileSync(`./backups/${tableName}.json`, JSON.stringify(data, null, 2));
        console.log(`✅ Backup completed for: ${tableName} (${data.length} rows)`);
    } catch (error) {
        console.error(`❌ Failed to backup ${tableName}:`, error.message);
        process.exit(1); // Exit with error so GitHub Action knows it failed
    }
}

async function run() {
    if (!supabaseUrl || !serviceKey) {
        console.error('❌ Error: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing from environment variables.');
        process.exit(1);
    }

    // List all tables you want to backup
    const tables = ['bookings', 'profiles', 'reviews', 'inquiries', 'performance_metrics', 'system_logs', 'tour_packages'];
    
    for (const table of tables) {
        await backupTable(table);
    }
    
    console.log('\n🌟 All backups finished successfully.');
}

run();
