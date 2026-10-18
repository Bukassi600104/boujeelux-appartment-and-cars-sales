// Retained only to fail safely when old operating notes invoke this command.
// Production tests must snapshot and restore the persisted catalogue, never seed it.
console.error('Retired: the legacy bootstrap/reseeding QA helper must not run. Use the snapshot-preserving release checks instead.');
process.exitCode = 1;
