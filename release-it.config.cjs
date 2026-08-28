module.exports = {
    git: {
        commitMessage: 'chore: release Rail v${version}',
        tagName: 'v${version}',
    },
    github: {
        autoGenerate: true,
        release: true,
    },
    hooks: {
        'before:bump': 'bun run check',
        'after:bump': 'node scripts/sync-release-version.mjs',
        'before:git:release':
            'git add packages/create-rail/package.json',
        'after:git:release':
            'npm publish ./packages/create-rail --registry=https://registry.npmjs.org',
    },
    npm: {
        publish: false,
    },
};
