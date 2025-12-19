#!/usr/bin/env node

const { exec } = require("child_process");
const { table } = require("table");
const { program } = require("commander");
const os = require("os");
const ora = require("ora");
const chalk = require("chalk");

// Detect OS
const platform = os.platform();
const getOS = () => {
  switch (platform) {
    case "win32": return "Windows";
    case "darwin": return "macOS";
    case "linux": return "Linux";
    default: return "Unknown OS";
  }
};

// Metadata
const metadata = {
  name: "Programming Language Status Checker",
  version: "1.0.1",
  description: "CLI tool to check compilers/interpreters and package managers across platforms.",
  developer: "Mohammad Mahfuz Rahman",
  email: "mahfuzrahman0712@gmail.com",
  os: getOS(),
};

// Cross-platform commands
const commands = {
  python: { win32: "python --version", linux: "python3 --version", darwin: "python3 --version" },
  pip: { win32: "pip --version", linux: "pip3 --version", darwin: "pip3 --version" },
  uv: {win32: "uv --version", linux: "uv --version", darwin: "uv --version"},
  node: { win32: "node --version", linux: "node --version", darwin: "node --version" },
  npm: { win32: "npm -v", linux: "npm -v", darwin: "npm -v" },
  yarn: { win32: "yarn -v", linux: "yarn -v", darwin: "yarn -v" },
  ruby: { win32: "ruby --version", linux: "ruby --version", darwin: "ruby --version" },
  gem: { win32: "gem -v", linux: "gem -v", darwin: "gem -v" },
  java: { win32: "java -version", linux: "java -version", darwin: "java -version" },
  javac: { win32: "javac -version", linux: "javac -version", darwin: "javac -version" },
  gradle: { win32: "gradle -v", linux: "gradle -v", darwin: "gradle -v" },
  maven: { win32: "mvn -v", linux: "mvn -v", darwin: "mvn -v" },
  gcc: { win32: "gcc --version", linux: "gcc --version", darwin: "gcc --version" },
  gpp: { win32: "g++ --version", linux: "g++ --version", darwin: "g++ --version" },
  clang: {win32: "clang --version", linux: "clang --version", darwin: "clang --version"},
  clangPP: {win32: "clang++ --version", linux: "clang++ --version", darwin: "clang++ --version"},
  rustc: { win32: "rustc --version", linux: "rustc --version", darwin: "rustc --version" },
  cargo: { win32: "cargo --version", linux: "cargo --version", darwin: "cargo --version" },
  php: { win32: "php --version", linux: "php --version", darwin: "php --version" },
  composer: { win32: "composer --version", linux: "composer --version", darwin: "composer --version" },
  go: { win32: "go version", linux: "go version", darwin: "go version" },
  perl: { win32: "perl -v", linux: "perl -v", darwin: "perl -v" },
  cpan: { win32: "cpan -v", linux: "cpan -v", darwin: "cpan -v" },
  lua: { win32: "lua -v", linux: "lua -v", darwin: "lua -v" },
  luarocks: { win32: "luarocks --version", linux: "luarocks --version", darwin: "luarocks --version" },
};

// languages/tools list (keep small to fast execution)
const tools = [
  { language: "C", compiler: "GCC", compilerCmd: commands.gcc, pm: "N/A", pmCmd: null },
  { language: "C++", compiler: "G++", compilerCmd: commands.gpp, pm: "N/A", pmCmd: null },
  { language: "C", compiler: "Clang", compilerCmd: commands.clang, pm: "N/A", pmCmd: null},
  { language: "C++", compiler: "Clang++", compilerCmd: commands.clangPP, pm: "N/A", pmCmd: null},
  { language: "Python", compiler: "Python", compilerCmd: commands.python, pm: "pip", pmCmd: commands.pip },
  { language: "JavaScript", compiler: "Node.js", compilerCmd: commands.node, pm: "npm", pmCmd: commands.npm },
  { language: "JavaScript", compiler: "Node.js", compilerCmd: commands.node, pm: "yarn", pmCmd: commands.yarn },
  { language: "Ruby", compiler: "Ruby", compilerCmd: commands.ruby, pm: "Gem", pmCmd: commands.gem },
  { language: "Java", compiler: "Java", compilerCmd: commands.java, pm: "Maven", pmCmd: commands.maven },
  { language: "Java", compiler: "JavaC", compilerCmd: commands.javac, pm: "Gradle", pmCmd: commands.gradle },
  { language: "Rust", compiler: "Rust Compiler", compilerCmd: commands.rustc, pm: "Cargo", pmCmd: commands.cargo },
  { language: "PHP", compiler: "PHP", compilerCmd: commands.php, pm: "Composer", pmCmd: commands.composer },
  { language: "Go", compiler: "Go Compiler", compilerCmd: commands.go, pm: "Go Tools", pmCmd: commands.go },
  { language: "Perl", compiler: "Perl", compilerCmd: commands.perl, pm: "CPAN", pmCmd: commands.cpan },
  { language: "Lua", compiler: "Lua", compilerCmd: commands.lua, pm: "luarocks", pmCmd: commands.luarocks },
];

// version regex patterns
const regexMap = {
  python: /Python (\d+\.\d+\.\d+)/,
  node: /v?(\d+\.\d+\.\d+)/,
  npm: /(\d+\.\d+\.\d+)/,
  ruby: /ruby (\d+\.\d+\.\d+)/,
  java: /version "([\d._]+)"/,
  default: /(\d+\.\d+(\.\d+)?)/,
};

// Version extractor
function extractVersion(toolName, output) {
  if (!output) return "N/A";
  const regex = regexMap[toolName.toLowerCase()] || regexMap.default;
  const match = output.match(regex);
  return match ? match[1] : output.split("\n")[0];
}

// Execute command safely
async function runCmd(cmd, toolName) {
  if (!cmd) return ["N/A", "N/A"];
  if (typeof cmd === "object") cmd = cmd[platform] || null;
  if (!cmd) return ["N/A", "N/A"];

  return new Promise((resolve) => {
    exec(cmd, { timeout: 3000, shell: true }, (err, stdout, stderr) => {
      if (err) resolve([chalk.red("No"), "N/A"]);
      else {
        const raw = stdout.toString().trim() || stderr.toString().trim();
        const version = extractVersion(toolName, raw);
        resolve([chalk.green("Yes"), version]);
      }
    });
  });
}

// Check tool
async function checkTool(tool) {
  const [compilerStatus, compilerVersion] = await runCmd(tool.compilerCmd, tool.compiler);
  const [pmStatus, pmVersion] = await runCmd(tool.pmCmd, tool.pm);

  return [
    tool.language,
    tool.compiler,
    compilerStatus,
    compilerVersion,
    tool.pm,
    pmStatus,
    pmVersion,
  ];
}

// Create table data
async function generateTableData() {
  const header = ["Language", "Compiler", "Installed?", "Version", "Package Manager", "Installed?", "Version"];
  const rows = await Promise.all(tools.map(checkTool));
  return [header, ...rows];
}

// Show table
async function showTable() {
  const spinner = ora("Checking installed languages and tools...").start();
  try {
    const data = await generateTableData();
    spinner.succeed("Check completed!");
    console.log(table(data));
  } catch (err) {
    spinner.fail("Failed to check tools!");
    console.error(err);
  }
}

// CLI options
program.version(metadata.version)
  .option("-l, --list", "List all languages/tools")
  .option("-m, --metadata", "Shows metadata")
  .parse(process.argv);

if (program.opts().list) {
  showTable();
} else if (program.opts().metadata) {
  console.log("Name: " + metadata.name);
  console.log("Version: " + metadata.version);
  console.log("Description: " + metadata.description);
  console.log("Email: " + metadata.email);
  console.log("OS: " + metadata.os);
}
