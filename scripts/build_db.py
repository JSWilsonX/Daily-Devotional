import zipfile
import sqlite3
import json
import os
import sys
import re
import time

def build_database(db_path='devotionals.db'):
    print(f"Building SQLite database at '{db_path}'...")
    start_time = time.time()

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Create table with PRIMARY KEY on (profile_id, book_id, day)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS devotionals (
        profile_id TEXT NOT NULL,
        book_id TEXT NOT NULL,
        day TEXT NOT NULL,
        title TEXT,
        paragraphs TEXT NOT NULL,
        PRIMARY KEY (profile_id, book_id, day)
    );
    ''')

    # Explicit index on (profile_id, book_id, day) as requested
    cursor.execute('''
    CREATE INDEX IF NOT EXISTS idx_profile_book_day ON devotionals (profile_id, book_id, day);
    ''')

    zip_files = [
        'original.zip',
        'clear_modern.zip',
        'easy_reading.zip',
        'kids_primary.zip',
        'teens_youth.zip',
        'young_adult.zip'
    ]

    total_inserted = 0

    for z in zip_files:
        profile_id = z.replace('.zip', '')
        zip_path = os.path.join('zips', z) if os.path.exists(os.path.join('zips', z)) else z
        if not os.path.exists(zip_path):
            print(f"Zip file '{z}' not found in 'zips/' or root, skipping...")
            continue

        print(f"Importing {zip_path} (profile_id: {profile_id})...")
        with zipfile.ZipFile(zip_path, 'r') as zf:
            records = []
            for name in zf.namelist():
                if name.endswith('.json'):
                    filename = os.path.basename(name)
                    # File pattern: {book_id}_{month}_{day}.json, e.g., ag_01_01.json
                    m = re.match(r'([a-z0-9_-]+)_(\d{2}_\d{2})\.json$', filename, re.IGNORECASE)
                    if m:
                        book_id, day = m.groups()
                        book_id = book_id.lower()
                        try:
                            content = zf.read(name).decode('utf-8')
                            data = json.loads(content)
                            title = data.get('title', '')
                            paragraphs = json.dumps(data.get('paragraphs', []))
                            records.append((profile_id, book_id, day, title, paragraphs))
                        except Exception as e:
                            print(f"Error parsing {name}: {e}")

            if records:
                cursor.executemany('''
                INSERT OR REPLACE INTO devotionals (profile_id, book_id, day, title, paragraphs)
                VALUES (?, ?, ?, ?, ?)
                ''', records)
                conn.commit()
                total_inserted += len(records)
                print(f"  Inserted {len(records)} records from {z}.")

    conn.close()
    elapsed = time.time() - start_time
    size_mb = os.path.getsize(db_path) / (1024 * 1024) if os.path.exists(db_path) else 0
    print(f"Finished building database! Total records: {total_inserted} in {elapsed:.2f}s. Database size: {size_mb:.2f} MB")

if __name__ == '__main__':
    db_file = sys.argv[1] if len(sys.argv) > 1 else 'devotionals.db'
    build_database(db_file)
