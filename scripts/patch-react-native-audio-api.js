const fs = require('node:fs');
const path = require('node:path');

if (process.platform !== 'win32') {
  process.exit(0);
}

const gitBashCandidates = [
  path.join(process.env.ProgramFiles ?? '', 'Git', 'bin', 'bash.exe'),
  path.join(
    process.env['ProgramFiles(x86)'] ?? '',
    'Git',
    'bin',
    'bash.exe',
  ),
  path.join(
    process.env.LOCALAPPDATA ?? '',
    'Programs',
    'Git',
    'bin',
    'bash.exe',
  ),
];
const gitBashPath = gitBashCandidates.find(
  (candidate) => candidate && fs.existsSync(candidate),
);

if (!gitBashPath) {
  console.warn(
    '[react-native-audio-api] Git Bash was not found; local Android builds may fail.',
  );
  process.exit(0);
}

const buildGradlePath = path.join(
  __dirname,
  '..',
  'node_modules',
  'react-native-audio-api',
  'android',
  'build.gradle',
);

if (!fs.existsSync(buildGradlePath)) {
  process.exit(0);
}

const originalCommand =
  "commandLine 'bash', '../scripts/download-prebuilt-binaries.sh'";
const normalizedGitBashPath = gitBashPath.replaceAll('\\', '/');
const patchedCommand = `commandLine '${normalizedGitBashPath}', '../scripts/download-prebuilt-binaries.sh'`;
const buildGradle = fs.readFileSync(buildGradlePath, 'utf8');

if (buildGradle.includes(patchedCommand)) {
  process.exit(0);
}

if (!buildGradle.includes(originalCommand)) {
  console.warn(
    '[react-native-audio-api] The download task changed; the Windows Git Bash patch was not applied.',
  );
  process.exit(0);
}

fs.writeFileSync(
  buildGradlePath,
  buildGradle.replace(originalCommand, patchedCommand),
);
console.log('[react-native-audio-api] Configured Git Bash for Windows builds.');
