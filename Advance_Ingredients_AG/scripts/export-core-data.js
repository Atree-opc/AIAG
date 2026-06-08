#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const { Pool } = require('pg')
const dotenv = require('dotenv')

const projectRoot = path.resolve(__dirname, '..')
dotenv.config({ path: path.join(projectRoot, '.env.local') })

const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'))

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 5432),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
})

const UPLOAD_ROOT = process.env.UPLOAD_ROOT
const ACCOUNTANT_ROOT = process.env.ACCOUNTANT_ROOT

const TABLES = [
  {
    name: 'users',
    columns: ['user_id', 'name', 'role', 'password_hash', 'company_name', 'address', 'city', 'country', 'created_at'],
    query: `
      SELECT
        user_id::text,
        name,
        role,
        password_hash,
        company_name,
        address,
        city,
        country,
        created_at::text
      FROM users
      ORDER BY role, name, user_id
    `,
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
    query: `
      SELECT
        container_number,
        contract_id,
        customer_id::text,
        supplier_id::text,
        bl,
        brand,
        product,
        price::text,
        quantity::text,
        quantity_unit,
        loading_date::text,
        etd::text,
        ship_on_board_date::text,
        eta::text,
        batch_no,
        production_date::text,
        df_invoice_no,
        df_ai_price::text,
        freight_forwarder,
        freight_forwarder_method,
        lc_number,
        port_of_loading,
        port_of_discharge,
        status,
        remarks,
        belonged_month,
        belonged_quarter,
        parity,
        packing,
        payment_terms,
        origin,
        shelf_life,
        invoice_no,
        lc_issue_date::text,
        lc_bank_name,
        lc_bank_bic,
        lc_bank_address,
        buyer_name,
        buyer_address,
        is_organic,
        tc_contract_no,
        tc_invoice_no,
        tc_seller,
        tc_buyer,
        created_at::text
      FROM orders
      ORDER BY container_number
    `,
  },
  {
    name: 'order_visibility',
    columns: ['container_number', 'role'],
    query: `
      SELECT container_number, role
      FROM order_visibility
      ORDER BY container_number, role
    `,
  },
  {
    name: 'order_file_categories',
    columns: ['category_code', 'label_en', 'label_zh', 'sort_order', 'required', 'created_at'],
    query: `
      SELECT
        category_code,
        label_en,
        label_zh,
        sort_order,
        required,
        created_at::text
      FROM order_file_categories
      ORDER BY sort_order, category_code
    `,
  },
  {
    name: 'order_file_checklist',
    columns: ['container_number', 'category_code', 'status', 'note', 'updated_by', 'updated_at'],
    query: `
      SELECT
        container_number,
        category_code,
        status,
        note,
        updated_by::text,
        updated_at::text
      FROM order_file_checklist
      ORDER BY container_number, category_code
    `,
  },
  {
    name: 'order_files',
    columns: [
      'file_id', 'container_number', 'filename', 'stored_name', 'file_size', 'mime_type',
      'uploaded_by', 'uploaded_at', 'category_code', 'visible_to_customer', 'visible_to_supplier', 'visible_to_accountant',
    ],
    query: `
      SELECT
        file_id::text,
        container_number,
        filename,
        stored_name,
        file_size,
        mime_type,
        uploaded_by::text,
        uploaded_at::text,
        category_code,
        visible_to_customer,
        visible_to_supplier,
        visible_to_accountant
      FROM order_files
      ORDER BY container_number, filename, file_id
    `,
  },
  {
    name: 'role_field_visibility',
    columns: ['role', 'field_key', 'editable'],
    query: `
      SELECT role, field_key, editable
      FROM role_field_visibility
      ORDER BY role, field_key
    `,
  },
  {
    name: 'hard_denied_info',
    columns: ['field_key'],
    query: `
      SELECT field_key
      FROM hard_denied_info
      ORDER BY field_key
    `,
  },
  {
    name: 'order_options',
    columns: ['option_id', 'option_type', 'value', 'sort_order', 'created_at'],
    query: `
      SELECT
        option_id::text,
        option_type,
        value,
        sort_order,
        created_at::text
      FROM order_options
      ORDER BY option_type, sort_order, value, option_id
    `,
  },
  {
    name: 'accountant_files',
    columns: ['file_id', 'year', 'month', 'filename', 'stored_name', 'file_size', 'mime_type', 'uploaded_by', 'uploaded_at'],
    query: `
      SELECT
        file_id::text,
        year,
        month,
        filename,
        stored_name,
        file_size,
        mime_type,
        uploaded_by::text,
        uploaded_at::text
      FROM accountant_files
      ORDER BY year, month, filename, file_id
    `,
  },
  {
    name: 'order_month',
    columns: ['container_number', 'year', 'month', 'updated_by', 'updated_at'],
    query: `
      SELECT
        container_number,
        year,
        month,
        updated_by::text,
        updated_at::text
      FROM order_month
      ORDER BY container_number
    `,
  },
  {
    name: 'order_quarter',
    columns: ['container_number', 'year', 'quarter', 'updated_by', 'updated_at'],
    query: `
      SELECT
        container_number,
        year,
        quarter,
        updated_by::text,
        updated_at::text
      FROM order_quarter
      ORDER BY container_number
    `,
  },
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

function makeTimestamp() {
  return new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
}

function ensureEmptyDir(dirPath) {
  fs.rmSync(dirPath, { recursive: true, force: true })
  fs.mkdirSync(dirPath, { recursive: true })
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

function normalizeRow(row, columns) {
  return Object.fromEntries(columns.map(column => [column, row[column] ?? null]))
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
      const sha256 = sha256File(fullPath)
      totalBytes += stats.size
      files.push({ relativePath, size: stats.size, sha256 })
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

function copySnapshot(srcPath, destPath) {
  fs.mkdirSync(path.dirname(destPath), { recursive: true })
  fs.rmSync(destPath, { recursive: true, force: true })
  if (srcPath && fs.existsSync(srcPath)) {
    copyDirRecursive(srcPath, destPath)
  } else {
    fs.mkdirSync(destPath, { recursive: true })
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

async function exportTables() {
  const client = await pool.connect()
  try {
    const tables = {}
    const summary = []

    for (const table of TABLES) {
      const result = await client.query(table.query)
      const rows = result.rows.map(row => normalizeRow(row, table.columns))
      const canonical = canonicalStringify(rows)
      tables[table.name] = {
        columns: table.columns,
        rowCount: rows.length,
        sha256: sha256String(canonical),
        rows,
      }
      summary.push(`${table.name}: ${rows.length} rows`)
    }

    return { tables, summary }
  } finally {
    client.release()
  }
}

async function main() {
  const timestamp = makeTimestamp()
  const backupBaseDir = path.join(projectRoot, 'backups', 'core-data')
  const backupDir = path.join(backupBaseDir, timestamp)
  const latestDir = path.join(backupBaseDir, 'latest')
  ensureEmptyDir(backupDir)

  const dbExport = await exportTables()
  const dbBundle = {
    format: 'aiag-core-data-bundle',
    version: 1,
    createdAt: new Date().toISOString(),
    source: {
      appName: packageJson.name,
      appVersion: packageJson.version,
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
    },
    tables: dbExport.tables,
  }
  dbBundle.integrity = {
    algorithm: 'sha256',
    bundleSha256: sha256String(canonicalStringify(dbBundle)),
  }

  copySnapshot(UPLOAD_ROOT, path.join(backupDir, 'storage', 'orders'))
  copySnapshot(ACCOUNTANT_ROOT, path.join(backupDir, 'storage', 'accountant'))

  const storageManifest = {
    format: 'aiag-storage-manifest',
    version: 1,
    createdAt: dbBundle.createdAt,
    roots: {
      orders: {
        sourcePath: UPLOAD_ROOT,
        snapshotPath: 'storage/orders',
        ...listFiles(path.join(backupDir, 'storage', 'orders')),
      },
      accountant: {
        sourcePath: ACCOUNTANT_ROOT,
        snapshotPath: 'storage/accountant',
        ...listFiles(path.join(backupDir, 'storage', 'accountant')),
      },
    },
  }
  storageManifest.integrity = {
    algorithm: 'sha256',
    manifestSha256: sha256String(canonicalStringify(storageManifest)),
  }

  const dbBundlePath = path.join(backupDir, 'db.core.bundle.json')
  const storageManifestPath = path.join(backupDir, 'storage.manifest.json')
  writeJson(dbBundlePath, dbBundle)
  writeJson(storageManifestPath, storageManifest)

  const backupManifest = {
    format: 'aiag-backup-manifest',
    version: 1,
    createdAt: dbBundle.createdAt,
    source: dbBundle.source,
    contents: {
      database: {
        file: 'db.core.bundle.json',
        sha256: sha256File(dbBundlePath),
        tables: Object.fromEntries(
          Object.entries(dbBundle.tables).map(([name, meta]) => [name, { rowCount: meta.rowCount, sha256: meta.sha256 }])
        ),
      },
      storage: {
        file: 'storage.manifest.json',
        sha256: sha256File(storageManifestPath),
        roots: Object.fromEntries(
          Object.entries(storageManifest.roots).map(([name, meta]) => [
            name,
            {
              snapshotPath: meta.snapshotPath,
              rootExists: meta.rootExists,
              fileCount: meta.fileCount,
              totalBytes: meta.totalBytes,
            },
          ])
        ),
      },
    },
  }
  backupManifest.integrity = {
    algorithm: 'sha256',
    manifestSha256: sha256String(canonicalStringify(backupManifest)),
  }

  const backupManifestPath = path.join(backupDir, 'backup.manifest.json')
  writeJson(backupManifestPath, backupManifest)
  fs.writeFileSync(
    path.join(backupDir, 'CHECKSUMS.txt'),
    [
      `${sha256File(backupManifestPath)}  backup.manifest.json`,
      `${sha256File(dbBundlePath)}  db.core.bundle.json`,
      `${sha256File(storageManifestPath)}  storage.manifest.json`,
    ].join('\n') + '\n',
    'utf8'
  )

  ensureEmptyDir(latestDir)
  copyDirRecursive(backupDir, latestDir)

  console.log(`Backup created: ${backupDir}`)
  console.log(`Latest snapshot: ${latestDir}`)
  console.log('Database tables:')
  for (const line of dbExport.summary) {
    console.log(`  - ${line}`)
  }
  console.log(`Storage orders files: ${storageManifest.roots.orders.fileCount}`)
  console.log(`Storage accountant files: ${storageManifest.roots.accountant.fileCount}`)
}

main()
  .catch(error => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await pool.end()
  })
