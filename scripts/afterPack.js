const asarmor = require("asarmor");
const path = require("path");
const fs = require("fs");

exports.default = async function afterPack(context) {
  try {
    const asarPath = path.join(context.appOutDir, "resources", "app.asar");
    if (!fs.existsSync(asarPath)) {
      console.log("[asarmor] app.asar not found, skipping...");
      return;
    }
    console.log("[asarmor] Applying protection to:", asarPath);
    const archive = await asarmor.open(asarPath);
    archive.patch(asarmor.createBloatPatch(1314));
    await archive.write(asarPath);
    console.log("[asarmor] Protection applied!");
  } catch (error) {
    console.error("[asarmor] Error:", error.message);
  }
};
