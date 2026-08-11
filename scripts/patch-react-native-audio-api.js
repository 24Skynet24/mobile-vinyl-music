const fs = require('node:fs');
const path = require('node:path');

const baseDir = path.join(__dirname, '..', 'node_modules', 'react-native-audio-api', 'android');

// 1. Windows Git Bash Patch for build.gradle
if (process.platform === 'win32') {
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

  if (gitBashPath) {
    const buildGradlePath = path.join(baseDir, 'build.gradle');
    if (fs.existsSync(buildGradlePath)) {
      const originalCommand =
        "commandLine 'bash', '../scripts/download-prebuilt-binaries.sh'";
      const normalizedGitBashPath = gitBashPath.replaceAll('\\', '/');
      const patchedCommand = `commandLine '${normalizedGitBashPath}', '../scripts/download-prebuilt-binaries.sh'`;
      const buildGradle = fs.readFileSync(buildGradlePath, 'utf8');

      if (buildGradle.includes(originalCommand)) {
        fs.writeFileSync(
          buildGradlePath,
          buildGradle.replace(originalCommand, patchedCommand),
        );
        console.log('[react-native-audio-api] Configured Git Bash for Windows builds.');
      }
    }
  }
}

console.log('[react-native-audio-api] Postinstall patches applied successfully.');
