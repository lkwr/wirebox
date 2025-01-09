import { parse } from "@std/semver";

const isVersionAvailable = async (
  name: string,
  version: string,
): Promise<boolean> => {
  const result = await fetch(`https://registry.npmjs.org/${name}`).then((res) =>
    res.json(),
  );

  return !result?.versions?.[version];
};

const determineTag = (version: string): string => {
  const semver = parse(version);

  const prerelease = semver.prerelease?.[0];

  // if the version has no prerelease tag, return "latest"
  if (!prerelease) return "latest";

  // if the first prerelease tag is not a string, throw an error
  if (typeof prerelease !== "string") throw new Error("Invalid prerelease");

  // if the version is a canary, return "canary"
  if (prerelease.startsWith("canary-")) return "canary";

  // else return the prerelease tag
  return prerelease;
};

const publishPackage = async () => {
  const packagePath = `${import.meta.dirname}/../dist`;
  const packageJson = await Bun.file(`${packagePath}/package.json`).json();
  const canPublish = await isVersionAvailable(
    packageJson.name,
    packageJson.version,
  );

  if (!canPublish) {
    console.log(
      `Skipping ${packageJson.name}@${packageJson.version}. Already published.`,
    );
    return;
  }

  const tag = determineTag(packageJson.version);

  console.log(
    `Publishing ${packageJson.name}@${packageJson.version} (tag = ${tag})`,
  );

  const job = Bun.spawnSync({
    cmd: ["npm", "publish", "--tag", tag, "--access", "public", "--dry-run"],
    cwd: `${packagePath}/dist`,
    stdout: "inherit",
    stderr: "inherit",
    stdin: null,
  });

  if (job.exitCode !== 0) process.exit(job.exitCode);
};

await publishPackage();
