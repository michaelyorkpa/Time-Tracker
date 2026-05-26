import fs from "node:fs/promises";
import path from "node:path";
import { config } from "../config.js";

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

async function read(requestUrl) {
  const requestPath = new URL(requestUrl, `http://${config.host}:${config.port}`).pathname;
  const filePath = resolveRequestPath(requestPath);

  if (!filePath) {
    return {
      statusCode: 403,
      contents: "Forbidden",
      contentType: "text/plain; charset=utf-8",
    };
  }

  try {
    const contents = await fs.readFile(filePath);
    const extension = path.extname(filePath).toLowerCase();

    return {
      statusCode: 200,
      contents,
      contentType: contentTypes[extension] || "application/octet-stream",
    };
  } catch (error) {
    if (error.code === "ENOENT") {
      return {
        statusCode: 404,
        contents: "Not found",
        contentType: "text/plain; charset=utf-8",
      };
    }

    throw error;
  }
}

function resolveRequestPath(requestPath) {
  if (requestPath === "/") {
    return path.join(config.viewsDir, "public", "index.html");
  }

  if (!requestPath.endsWith(".html")) {
    return resolvePublicAssetPath(requestPath);
  }

  const pageName = path.basename(requestPath);
  const publicPages = new Set(["index.html", "login.html"]);
  const viewGroup = publicPages.has(pageName) ? "public" : "protected";
  const filePath = path.resolve(config.viewsDir, viewGroup, pageName);
  const viewRoot = path.resolve(config.viewsDir, viewGroup);

  return filePath.startsWith(`${viewRoot}${path.sep}`) ? filePath : null;
}

function resolvePublicAssetPath(requestPath) {
  const relativePath = requestPath.startsWith("/") ? requestPath.slice(1) : requestPath;
  const filePath = path.resolve(config.publicDir, relativePath);
  const publicRoot = path.resolve(config.publicDir);

  return filePath.startsWith(`${publicRoot}${path.sep}`) ? filePath : null;
}

export const staticService = {
  read,
};
