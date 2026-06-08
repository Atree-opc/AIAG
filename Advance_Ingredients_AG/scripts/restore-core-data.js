#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const { Pool } = require('pg')
const dotenv = require('dotenv')

const projectRoot = path.resolve(__dirname, '..')
dotenv.config({ path: path.join(projectRoot, '.env.local') })

const backupArg = process.argv.find(arg => !arg.startsWith('--') && arg !== process.argv[0] && arg !== process.argv[1])
const verifyOnly = process.argv.includes('--verify-only')
const skipStorage = process.argv.includes('--skip-storage')

const backupDir = path.resolve(projectRoot, backupArg ?? path.join('backups', 'core-data', 'latest'))

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 5432),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
})

const UPLOAD_ROOT = process.env.UPLOAD_ROOT
const ACCOUNTANT_ROOT = process.env.ACCOUNTANT_ROOT

const DB_INSERT_ORDER = [
  {
    name: 'users',
    columns: ['user_id', 'name', 'role', 'password_hash', 'company_name', 'address', 'city', 'country', 'created_at'],
  },
  {
    name: 'orders',
    columns: [
      'container_number', 'contract_id', 'customer_id', 'supplier_id', 'bl', 'brand', 'product', 'price', 'quantity',
      'quantity_unit', 'loading_date', 'etd', 'ship_on_board_date', 'eta', 'batch_no', 'production_date',
      'df_invoice_no', 'df_ai_price', 'freight_forwarder', 'freight_forwarder_method', 'lc_number',
      'port_of_loading', 'port_of_discharge', 'status', 'remarks', 'belonged_month', 'belonged_quarter', 'parity',
      'packing', 'payment_terms', 'origin', 'shelf_life', 'invoice_no', 'lc_issue_date', 'lc_bank_name',
      'lc_bank_bic', 'lc_bank_address', 'buyer_name', 'buyer_address', 'is_organic', 'tc_contract_no',
      'tc_invoice_no', 'tc_seller', 'tc_buyer', 'created_at',
    ],
  },
  {
    name: 'order_visibility',
    columns: ['container_number', 'role'],
  },
  {
    name: 'order_file_categories',
    columns: ['category_code', 'label_en', 'label_zh', 'sort_order', 'required', 'created_at'],
  },
  {
    name: 'order_file_checklist',
    columns: ['container_number', 'category_code', 'status', 'note', 'updated_by', 'updated_at'],
  },
  {
    name: 'order_files',
    columns: [
      'file_id', 'container_number', 'filename', 'stored_name', 'file_size', 'mime_type',
      'uploaded_by', 'uploaded_at', 'category_code', 'visible_to_customer', 'visible_to_supplier', 'visible_to_accountant',
    ],
  },
  {
    name: 'role_field_visibility',
    columns: ['role', 'field_key', 'editable'],
  },
  {
    name: 'hard_denied_info',
    columns: ['field_key'],
  },
  {
    name: 'order_options',
    columns: ['option_id', 'option_type', 'value', 'sort_order', 'created_at'],
  },
  {
    name: 'accountant_files',
    columns: ['file_id', 'year', 'month', 'filename', 'stored_name', 'file_size', 'mime_type', 'uploaded_by', 'uploaded_at'],
  },
  {
    name: 'order_month',
    columns: ['container_number', 'year', 'month', 'updated_by', 'updated_at'],
  },
  {
    name: 'order_quarter',
    columns: ['container_number', 'year', 'quarter', 'updated_by', 'updated_at'],
  },
]

const DB_TRUNCATE_ORDER = [
  'order_visibility',
  'order_file_checklist',
  'order_file_categories',
  'order_files',
  'accountant_files',
  'order_month',
  'order_quarter',
  'orders',
  'role_field_visibility',
  'hard_denied_info',
  'order_options',
  'users',
]

function canonicalStringify(value) {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value)
  }

  if (Array.isArray(value)) {
    return `[${value.map(canonicalStringify).join(',')}]`
  }

  const keys = Object.keys(value).sort()
  return `{${keys.map(key => `${JSON.stringify(key)}:${canonicalStringify(value[key])}`).join(',')}}`
}

function sha256String(value) {
  return crypto.createHash('sha256').update(value).digest('hex')
}

function sha256File(filePath) {
  const hash = crypto.createHash('sha256')
  hash.update(fs.readFileSync(filePath))
  return hash.digest('hex')
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function listFiles(rootPath) {
  if (!rootPath || !fs.existsSync(rootPath)) {
    return { rootExists: false, totalBytes: 0, fileCount: 0, files: [] }
  }

  const files = []
  let totalBytes = 0

  function walk(currentPath) {
    for (const entry of fs.readdirSync(currentPath, { withFileTypes: true })) {
      const fullPath = path.join(currentPath, entry.name)
      if (entry.isDirectory()) {
        walk(fullPath)
        continue
      }

      const stats = fs.statSync(fullPath)
      const relativePath = path.relative(rootPath, fullPath).split(path.sep).join('/')
      totalBytes += stats.size
      files.push({
        relativePath,
        size: stats.size,
        sha256: sha256File(fullPath),
      })
    }
  }

  walk(rootPath)
  files.sort((a, b) => a.relativePath.localeCompare(b.relativePath))
  return {
    rootExists: true,
    totalBytes,
    fileCount: files.length,
    files,
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

function verifyBundle(dbBundle) {
  assert(dbBundle.format === 'aiag-core-data-bundle', 'Invalid database bundle format')
  assert(dbBundle.version === 1, 'Unsupported database bundle version')
  for (const table of DB_INSERT_ORDER) {
    const meta = dbBundle.tables[table.name]
    assert(meta, `Missing table ${table.name} in bundle`)
    assert(Array.isArray(meta.rows), `Table ${table.name} rows must be an array`)
    assert(Array.isArray(meta.columns), `Table ${table.name} columns must be an array`)
    assert(canonicalStringify(meta.columns) === canonicalStringify(table.columns), `Table ${table.name} columns mismatch`)
    assert(meta.rowCount === meta.rows.length, `Table ${table.name} rowCount mismatch`)
    const computedTableHash = sha256String(canonicalStringify(meta.rows))
    assert(computedTableHash === meta.sha256, `Table ${table.name} hash mismatch`)
  }

  const bundleForHash = {
    format: dbBundle.format,
    version: dbBundle.version,
    createdAt: dbBundle.createdAt,
    source: dbBundle.source,
    tables: dbBundle.tables,
  }
  const bundleHash = sha256String(canonicalStringify(bundleForHash))
  assert(bundleHash === dbBundle.integrity?.bundleSha256, 'Database bundle integrity hash mismatch')
}

function verifyStorageManifest(storageManifest, backupDirPath) {
  assert(storageManifest.format === 'aiag-storage-manifest', 'Invalid storage manifest format')
  assert(storageManifest.version === 1, 'Unsupported storage manifest version')

  for (const [rootName, rootMeta] of Object.entries(storageManifest.roots)) {
    const snapshotRoot = path.join(backupDirPath, rootMeta.snapshotPath)
    const actual = listFiles(snapshotRoot)
    assert(actual.fileCount === rootMeta.fileCount, `Storage ${rootName} file count mismatch`)
    assert(actual.totalBytes === rootMeta.totalBytes, `Storage ${rootName} byte count mismatch`)
    assert(canonicalStringify(actual.files) === canonicalStringify(rootMeta.files), `Storage ${rootName} file manifest mismatch`)
  }

  const manifestForHash = {
    format: storageManifest.format,
    version: storageManifest.version,
    createdAt: storageManifest.createdAt,
    roots: storageManifest.roots,
  }
  const manifestHash = sha256String(canonicalStringify(manifestForHash))
  assert(manifestHash === storageManifest.integrity?.manifestSha256, 'Storage manifest integrity hash mismatch')
}

function prepareStorageRestore(snapshotRoot, targetRoot, label) {
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
  const existingBackup = fs.existsSync(targetRoot) ? `${targetRoot}.pre-restore-${timestamp}` : null

  fs.mkdirSync(path.dirname(targetRoot), { recursive: true })
  if (existingBackup) {
    fs.renameSync(targetRoot, existingBackup)
  }

  fs.rmSync(targetRoot, { recursive: true, force: true })
  if (fs.existsSync(snapshotRoot)) {
    copyDirRecursive(snapshotRoot, targetRoot)
  } else {
    fs.mkdirSync(targetRoot, { recursive: true })
  }

  return { label, targetRoot, existingBackup }
}

function rollbackStorageRestores(restores) {
  for (const restore of restores.slice().reverse()) {
    fs.rmSync(restore.targetRoot, { recursive: true, force: true })
    if (restore.existingBackup && fs.existsSync(restore.existingBackup)) {
      fs.renameSync(restore.existingBackup, restore.targetRoot)
    }
  }
}

function copyDirRecursive(srcPath, destPath) {
  const stats = fs.statSync(srcPath)
  if (!stats.isDirectory()) {
    fs.mkdirSync(path.dirname(destPath), { recursive: true })
    fs.copyFileSync(srcPath, destPath)
    return
  }

  fs.mkdirSync(destPath, { recursive: true })
  for (const entry of fs.readdirSync(srcPath, { withFileTypes: true })) {
    const srcEntry = path.join(srcPath, entry.name)
    const destEntry = path.join(destPath, entry.name)
    if (entry.isDirectory()) {
      copyDirRecursive(srcEntry, destEntry)
    } else {
      fs.mkdirSync(path.dirname(destEntry), { recursive: true })
      fs.copyFileSync(srcEntry, destEntry)
    }
  }
}

async function restoreDatabase(dbBundle) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query(`TRUNCATE TABLE ${DB_TRUNCATE_ORDER.join(', ')} RESTART IDENTITY CASCADE`)

    for (const table of DB_INSERT_ORDER) {
      const rows = dbBundle.tables[table.name].rows
      if (!rows.length) continue

      const placeholders = table.columns.map((_, index) => `$${index + 1}`).join(', ')
      const sql = `INSERT INTO ${table.name} (${table.columns.join(', ')}) VALUES (${placeholders})`

      for (const row of rows) {
        await client.query(sql, table.columns.map(column => row[column]))
      }
    }

    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

async function main() {
  assert(fs.existsSync(backupDir), `Backup directory not found: ${backupDir}`)

  const backupManifestPath = path.join(backupDir, 'backup.manifest.json')
  const dbBundlePath = path.join(backupDir, 'db.core.bundle.json')
  const storageManifestPath = path.join(backupDir, 'storage.manifest.json')

  assert(fs.existsSync(backupManifestPath), 'backup.manifest.json not found')
  assert(fs.existsSync(dbBundlePath), 'db.core.bundle.json not found')
  assert(fs.existsSync(storageManifestPath), 'storage.manifest.json not found')

  const backupManifest = readJson(backupManifestPath)
  const dbBundle = readJson(dbBundlePath)
  const storageManifest = readJson(storageManifestPath)

  assert(backupManifest.format === 'aiag-backup-manifest', 'Invalid backup manifest format')
  assert(backupManifest.version === 1, 'Unsupported backup manifest version')
  assert(backupManifest.contents.database.sha256 === sha256File(dbBundlePath), 'Database bundle file checksum mismatch')
  assert(backupManifest.contents.storage.sha256 === sha256File(storageManifestPath), 'Storage manifest file checksum mismatch')

  const manifestForHash = {
    format: backupManifest.format,
    version: backupManifest.version,
    createdAt: backupManifest.createdAt,
    source: backupManifest.source,
    contents: backupManifest.contents,
  }
  const manifestHash = sha256String(canonicalStringify(manifestForHash))
  assert(manifestHash === backupManifest.integrity?.manifestSha256, 'Backup manifest integrity hash mismatch')

  verifyBundle(dbBundle)
  verifyStorageManifest(storageManifest, backupDir)

  if (verifyOnly) {
    console.log(`Backup verification successful: ${backupDir}`)
    return
  }

  const storageRestores = []
  try {
    if (!skipStorage) {
      storageRestores.push(
        prepareStorageRestore(path.join(backupDir, 'storage', 'orders'), UPLOAD_ROOT, 'orders'),
        prepareStorageRestore(path.join(backupDir, 'storage', 'accountant'), ACCOUNTANT_ROOT, 'accountant')
      )
    }

    await restoreDatabase(dbBundle)

    console.log(`Restore completed: ${backupDir}`)
    for (const restore of storageRestores) {
      if (restore.existingBackup) {
        console.log(`Pre-restore snapshot kept at: ${restore.existingBackup}`)
      }
    }
  } catch (error) {
    if (storageRestores.length) {
      rollbackStorageRestores(storageRestores)
    }
    throw error
  }
}

main()
  .catch(error => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await pool.end()
  })
