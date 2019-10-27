const fs = require("fs");
const path = require("path");

const artifacts = ["LICENSE", "README.md"];
artifacts.forEach(artifact => {
  const fromPath = path.resolve(__dirname, artifact);
  const toPath = path.resolve(__dirname, "dist/ng-feedback", artifact);

  fs.readFile(fromPath, "utf-8", (err, data) => {
    if (err) {
      console.log("an error occured while reading file ", fromPath);
      return;
    }
    fs.writeFile(toPath, data, err => {
      if (err) {
        console.log("an error occured while writing file ", toPath);
        return;
      }
      console.log(`${artifact} copied`);
    });
  });
});
