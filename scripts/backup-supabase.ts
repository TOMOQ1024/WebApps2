/**
 * リモート Supabase バックアップ
 *
 * 使用方法:
 *   pnpm backup:supabase
 *
 * 必要な環境変数 (.env.local):
 *   SUPABASE_DB_PASSWORD
 *   SUPABASE_SERVICE_ROLE_KEY (Storage fallback 用)
 *   NEXT_PUBLIC_SUPABASE_URL (Storage fallback 用)
 */

import { createClient } from "@supabase/supabase-js";
import { execSync } from "node:child_process";
import {
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { config } from "dotenv";

const projectRoot = resolve(__dirname, "..");
config({ path: join(projectRoot, ".env.local") });

type ManifestEntry = {
  path: string;
  bytes: number;
  success: boolean;
  error?: string;
};

type Manifest = {
  createdAt: string;
  projectRef: string;
  database: {
    schema: ManifestEntry;
    data: ManifestEntry;
  };
  storage: {
    method: "cli" | "api" | "skipped";
    success: boolean;
    fileCount: number;
    path: string;
    error?: string;
  };
};

function readTempFile(name: string): string {
  const path = join(projectRoot, "supabase", ".temp", name);
  try {
    return readFileSync(path, "utf8").trim();
  } catch {
    throw new Error(
      `supabase/.temp/${name} が見つかりません．npx supabase link を実行してください．`,
    );
  }
}

function buildDbUrl(poolerUrl: string, password: string): string {
  const match = poolerUrl.match(/^(postgresql:\/\/)([^@]+)(@.+)$/);
  if (!match) {
    throw new Error(`pooler URL の形式が不正です: ${poolerUrl}`);
  }
  const encodedPassword = encodeURIComponent(password);
  return `${match[1]}${match[2]}:${encodedPassword}${match[3]}`;
}

function formatTimestamp(date: Date): string {
  return date
    .toISOString()
    .replace(/[:.]/g, "-")
    .slice(0, 19);
}

function fileEntry(
  absolutePath: string,
  success: boolean,
  error?: string,
): ManifestEntry {
  const path = absolutePath.replace(`${projectRoot}/`, "");
  let bytes = 0;
  if (success) {
    try {
      bytes = statSync(absolutePath).size;
    } catch {
      // empty or missing
    }
  }
  return { path, bytes, success, error };
}

function runDbDump(dbUrl: string, outputPath: string, dataOnly: boolean): void {
  mkdirSync(dirname(outputPath), { recursive: true });
  const dataFlags = dataOnly ? " --data-only --use-copy" : "";
  execSync(
    `npx supabase db dump --db-url "${dbUrl}"${dataFlags} -f "${outputPath}"`,
    { stdio: "inherit", cwd: projectRoot },
  );
}

async function backupStorageViaCli(outputDir: string): Promise<boolean> {
  mkdirSync(outputDir, { recursive: true });
  try {
    execSync(
      `npx supabase storage cp -r --linked ss:/// "${outputDir}"`,
      { stdio: "pipe", cwd: projectRoot },
    );
    return true;
  } catch {
    return false;
  }
}

async function saveBlob(
  data: Blob,
  filePath: string,
): Promise<void> {
  mkdirSync(dirname(filePath), { recursive: true });
  await writeFile(filePath, Buffer.from(await data.arrayBuffer()));
}

async function backupStorageViaApi(
  supabaseUrl: string,
  serviceRoleKey: string,
  outputDir: string,
): Promise<number> {
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: buckets, error: bucketsError } =
    await supabase.storage.listBuckets();
  if (bucketsError) {
    throw bucketsError;
  }
  if (!buckets?.length) {
    return 0;
  }

  let fileCount = 0;

  async function downloadPrefix(bucket: string, prefix: string): Promise<void> {
    const { data: items, error } = await supabase.storage
      .from(bucket)
      .list(prefix || undefined, { limit: 1000 });

    if (error) {
      throw error;
    }

    for (const item of items ?? []) {
      const itemPath = prefix ? `${prefix}/${item.name}` : item.name;

      if (item.id) {
        const { data, error: downloadError } = await supabase.storage
          .from(bucket)
          .download(itemPath);
        if (downloadError) {
          throw downloadError;
        }
        const localPath = join(outputDir, bucket, itemPath);
        await saveBlob(data, localPath);
        fileCount += 1;
      } else {
        await downloadPrefix(bucket, itemPath);
      }
    }
  }

  for (const bucket of buckets) {
    await downloadPrefix(bucket.name, "");
  }

  return fileCount;
}

function countFilesRecursively(dir: string): number {
  try {
    let count = 0;
    const walk = (current: string) => {
      for (const entry of readdirSync(current, { withFileTypes: true })) {
        const full = join(current, entry.name);
        if (entry.isDirectory()) {
          walk(full);
        } else {
          count += 1;
        }
      }
    };
    walk(dir);
    return count;
  } catch {
    return 0;
  }
}

async function main(): Promise<void> {
  const dbPassword = process.env.SUPABASE_DB_PASSWORD;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!dbPassword) {
    console.error("SUPABASE_DB_PASSWORD が .env.local に設定されていません．");
    console.error("Dashboard > Project Settings > Database から取得してください．");
    process.exit(1);
  }

  const projectRef = readTempFile("project-ref");
  const poolerUrl = readTempFile("pooler-url");
  const dbUrl = buildDbUrl(poolerUrl, dbPassword);

  const backupDir = join(
    projectRoot,
    "supabase",
    "backups",
    formatTimestamp(new Date()),
  );
  mkdirSync(backupDir, { recursive: true });

  const schemaPath = join(backupDir, "schema.sql");
  const dataPath = join(backupDir, "data.sql");
  const storagePath = join(backupDir, "storage");
  const manifestPath = join(backupDir, "manifest.json");

  console.log(`バックアップ先: ${backupDir}`);
  console.log(`プロジェクト: ${projectRef}`);

  let schemaSuccess = false;
  let dataSuccess = false;
  let schemaError: string | undefined;
  let dataError: string | undefined;

  console.log("\n[1/3] スキーマをダンプ中...");
  try {
    runDbDump(dbUrl, schemaPath, false);
    schemaSuccess = true;
    console.log("  完了");
  } catch (err) {
    schemaError = err instanceof Error ? err.message : String(err);
    console.error("  失敗:", schemaError);
  }

  console.log("\n[2/3] データをダンプ中...");
  try {
    runDbDump(dbUrl, dataPath, true);
    dataSuccess = true;
    console.log("  完了");
  } catch (err) {
    dataError = err instanceof Error ? err.message : String(err);
    console.error("  失敗:", dataError);
  }

  console.log("\n[3/3] Storage をバックアップ中...");
  let storageMethod: Manifest["storage"]["method"] = "skipped";
  let storageSuccess = false;
  let storageFileCount = 0;
  let storageError: string | undefined;

  const cliOk = await backupStorageViaCli(storagePath);
  if (cliOk) {
    storageMethod = "cli";
    storageSuccess = true;
    storageFileCount = countFilesRecursively(storagePath);
    console.log(`  完了 (CLI, ${storageFileCount} ファイル)`);
  } else if (supabaseUrl && serviceRoleKey) {
    try {
      storageFileCount = await backupStorageViaApi(
        supabaseUrl,
        serviceRoleKey,
        storagePath,
      );
      storageMethod = "api";
      storageSuccess = true;
      console.log(`  完了 (API, ${storageFileCount} ファイル)`);
    } catch (err) {
      storageError = err instanceof Error ? err.message : String(err);
      storageMethod = "api";
      console.warn("  Storage バックアップをスキップ:", storageError);
    }
  } else {
    console.warn(
      "  Storage バックアップをスキップ (CLI 失敗，かつ NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 未設定)",
    );
  }

  const manifest: Manifest = {
    createdAt: new Date().toISOString(),
    projectRef,
    database: {
      schema: fileEntry(
        schemaPath,
        schemaSuccess,
        schemaError,
      ),
      data: fileEntry(dataPath, dataSuccess, dataError),
    },
    storage: {
      method: storageMethod,
      success: storageSuccess,
      fileCount: storageFileCount,
      path: "storage/",
      error: storageError,
    },
  };

  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

  console.log(`\nmanifest: ${manifestPath}`);

  if (!schemaSuccess || !dataSuccess) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
