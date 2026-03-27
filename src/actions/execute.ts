"use server";

import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const execAsync = promisify(exec);

export async function executeCodeAction(language: string, code: string) {
  try {
    // 1. Ensure tmp directory exists
    const tmpDir = path.join(process.cwd(), "tmp");
    await fs.mkdir(tmpDir, { recursive: true });

    // 2. Generate unique filename
    const uuid = crypto.randomUUID();
    let filename = "";
    let runCommand = "";

    switch (language) {
      case "javascript":
        filename = `${uuid}.js`;
        runCommand = `node ${path.join(tmpDir, filename)}`;
        break;
      case "typescript":
        filename = `${uuid}.ts`;
        runCommand = `npx tsx ${path.join(tmpDir, filename)}`;
        break;
      case "python":
        filename = `${uuid}.py`;
        runCommand = `python3 ${path.join(tmpDir, filename)}`;
        break;
      case "java":
        // Java requires filename to match public class, or just a generic class name.
        // We'll replace the public class name with a unique one, or just assume no public class
        // To be safe, let's just create a folder, name it Solution.java, and hope they named their class Solution.
        const javaDir = path.join(tmpDir, uuid);
        await fs.mkdir(javaDir, { recursive: true });
        filename = path.join(uuid, "Solution.java");
        runCommand = `javac ${path.join(tmpDir, filename)} && cd ${javaDir} && java Solution`;
        break;
      case "cpp":
        filename = `${uuid}.cpp`;
        const binPath = path.join(tmpDir, uuid);
        runCommand = `g++ ${path.join(tmpDir, filename)} -o ${binPath} && ${binPath}`;
        break;
      default:
        return { success: false, output: `Unsupported language: ${language}` };
    }

    const filepath = path.join(tmpDir, filename);

    // 3. Write code to file
    await fs.writeFile(filepath, code, "utf-8");

    // 4. Execute the code
    try {
      const { stdout, stderr } = await execAsync(runCommand, {
        timeout: 5000, // 5 seconds timeout to prevent infinite loops
        maxBuffer: 1024 * 1024, // 1MB output limit
      });

      return {
        success: true,
        output: stdout || stderr || "Execution finished with no output.",
        error: stderr ? true : false,
      };
    } catch (e: any) {
      // If it times out or throws error (compilation error, runtime text)
      return {
        success: false,
        output: e.stderr || e.stdout || e.message || "Unknown error occurred",
        error: true,
      };
    } finally {
      // 5. Cleanup
      try {
        if (language === "java") {
          await fs.rm(path.join(tmpDir, uuid), { recursive: true, force: true });
        } else if (language === "cpp") {
          await fs.unlink(filepath).catch(() => {});
          await fs.unlink(path.join(tmpDir, uuid)).catch(() => {});
        } else {
          await fs.unlink(filepath).catch(() => {});
        }
      } catch (cleanupError) {
        console.error("Cleanup failed:", cleanupError);
      }
    }
  } catch (err: any) {
    return { success: false, output: err.message, error: true };
  }
}
