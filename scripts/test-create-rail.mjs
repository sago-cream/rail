import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import {
    existsSync,
    mkdirSync,
    mkdtempSync,
    readFileSync,
    rmSync,
    writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { test } from 'node:test';

import { dependencyVersions } from '../packages/create-rail/bin/dependency-versions.mjs';

const repoRoot = resolve(import.meta.dirname, '..');
const cliPath = join(repoRoot, 'packages/create-rail/bin/create-rail.mjs');
const lockfiles = [
    'bun.lock',
    'package-lock.json',
    'pnpm-lock.yaml',
    'yarn.lock',
];
const managers = {
    bun: { version: '1.4.3', config: 'bunfig.toml', gate: '604800' },
    npm: { version: '12.2.1', config: '.npmrc', gate: 'min-release-age=7' },
    pnpm: {
        version: '12.16.1',
        config: 'pnpm-workspace.yaml',
        gate: '10080',
    },
    yarn: { version: '4.10.0', config: '.yarnrc.yml', gate: '7d' },
};

for (const framework of ['vite', 'next']) {
    for (const [manager, { version, config, gate }] of Object.entries(
        managers
    )) {
        test(`${framework}/${manager} uses ranges without a bundled lockfile`, (t) => {
            const root = mkdtempSync(join(tmpdir(), 'rail-versions-test-'));
            t.after(() => rmSync(root, { recursive: true, force: true }));
            const bin = join(root, 'bin');
            mkdirSync(bin);
            writeFileSync(
                join(bin, manager),
                `#!/bin/sh\n[ "$1" = "--version" ] || exit 1\necho '${version}'\n`,
                { mode: 0o755 }
            );
            const target = join(root, 'app');
            execFileSync(
                process.execPath,
                [
                    cliPath,
                    target,
                    `--${framework}`,
                    `--${manager}`,
                    '--query',
                    '--noInstall',
                    '--noRepo',
                ],
                { env: { ...process.env, PATH: bin }, stdio: 'pipe' }
            );
            const pkg = JSON.parse(readFileSync(join(target, 'package.json')));
            assert.equal(pkg.packageManager, `${manager}@${version}`);
            for (const version of Object.values({
                ...pkg.dependencies,
                ...pkg.devDependencies,
            })) {
                assert.match(version, /^\^\d+\.\d+\.\d+$/);
            }
            assert.equal(
                pkg.dependencies['lucide-react'],
                dependencyVersions['lucide-react']
            );
            assert.equal(
                pkg.dependencies['@tanstack/react-query'],
                dependencyVersions['@tanstack/react-query']
            );
            if (framework === 'next') {
                assert.equal(pkg.dependencies.next, dependencyVersions.next);
                assert.equal(
                    pkg.devDependencies['@next/eslint-plugin-next'],
                    pkg.dependencies.next
                );
                assert.equal(pkg.devDependencies.vite, undefined);
            } else {
                assert.equal(pkg.dependencies.next, undefined);
                assert.ok(pkg.devDependencies.vite);
            }
            for (const lockfile of lockfiles) {
                assert.equal(existsSync(join(target, lockfile)), false);
            }
            assert.ok(
                readFileSync(join(target, config), 'utf8').includes(gate)
            );
        });
    }
}

test('--noInstall works without the selected package manager', (t) => {
    const root = mkdtempSync(join(tmpdir(), 'rail-no-manager-test-'));
    t.after(() => rmSync(root, { recursive: true, force: true }));
    const target = join(root, 'app');
    execFileSync(
        process.execPath,
        [cliPath, target, '--bun', '--noInstall', '--noRepo', '--noLucide'],
        { env: { ...process.env, PATH: root }, stdio: 'pipe' }
    );
    const pkg = JSON.parse(readFileSync(join(target, 'package.json')));
    assert.equal(pkg.packageManager, undefined);
    assert.equal(pkg.dependencies['lucide-react'], undefined);
    assert.equal(pkg.dependencies['@tanstack/react-query'], undefined);
});
