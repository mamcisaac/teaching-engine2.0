# Memory Archive Directory

> **Purpose**: Stores historical versions of CLAUDE.md files for future reference
> **Created**: 2025-07-03
> **Auto-maintained**: Yes (via `/prune` command)

---

## 📁 Directory Purpose

This directory serves as an automated archive for CLAUDE.md file versions. When the `/prune` command is used in Claude Code, previous versions of CLAUDE.md are automatically moved here for historical reference.

### File Naming Convention

```
CLAUDE_YYYY-MM-DD_HH-MM-SS.md
```

### Examples

- `CLAUDE_2025-01-15_14-30-00.md` - Archived on January 15, 2025 at 2:30 PM
- `CLAUDE_2025-02-01_09-15-30.md` - Archived on February 1, 2025 at 9:15 AM

---

## 🔄 Automatic Archiving Process

### When Archives Are Created

- Before major CLAUDE.md updates
- When using the `/prune` command
- During project restructuring
- When switching between different project configurations

### What Gets Archived

- Complete CLAUDE.md content
- Timestamp of archival
- Context notes (if available)

---

## 📚 Using Archived Files

### Viewing Historical Configurations

```bash
# List all archived versions
ls -la docs/memory-archive/

# View a specific archived version
cat docs/memory-archive/CLAUDE_2025-01-15_14-30-00.md
```

### Restoring Previous Versions

```bash
# Copy archived version back to active CLAUDE.md
cp docs/memory-archive/CLAUDE_2025-01-15_14-30-00.md CLAUDE.md
```

### Comparing Versions

```bash
# Compare current with archived version
diff CLAUDE.md docs/memory-archive/CLAUDE_2025-01-15_14-30-00.md
```

---

## 🧹 Maintenance

### Cleanup Recommendations

- Keep last 10 versions for quick reference
- Archive older versions to separate storage if needed
- Review quarterly for relevance

### Manual Archiving

If you need to manually archive the current CLAUDE.md:

```bash
# Create timestamp-based archive
cp CLAUDE.md docs/memory-archive/CLAUDE_$(date +%Y-%m-%d_%H-%M-%S).md
```

---

## 📝 Archive Log

This section will be automatically updated as archives are created:

### Current Archives

_No archives yet - this directory was just created_

### Archive Statistics

- **Total Archives**: 0
- **Oldest Archive**: N/A
- **Most Recent**: N/A
- **Storage Used**: ~1KB (README only)

---

## 🔗 Related Documentation

- **CLAUDE.md Documentation**: See main project CLAUDE.md
- **Memory Management**: See [Claude Code Memory Docs](https://docs.anthropic.com/en/docs/claude-code/memory)
- **Project Documentation**: See `../ROADMAP.md`

---

_This archive system ensures that valuable CLAUDE.md configurations are preserved while allowing for easy evolution and experimentation with documentation standards._
