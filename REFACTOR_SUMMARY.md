# Match Data Refactoring Summary

## Overview
Refactored the match data model to eliminate stored computed values and ensure original player assignments are properly persisted.

## Changes Made

### 1. Created Shared Utility Functions (`src/utils/matchUtils.ts`)
All computed values are now calculated on-the-fly using these functions:
- `getMatchScore(match)` - Computes score from games (e.g., "2-1")
- `getMatchWinner(match)` - Determines winner from game results
- `isTeamAFlex(match)` - Checks if Team A used flex by comparing players to originals
- `isTeamBFlex(match)` - Checks if Team B used flex by comparing players to originals
- `getFlexStatus(match)` - Returns both flex statuses in one call

### 2. Updated Match Type (`src/types.ts`)
**Removed fields** (now computed):
- `score?: string` - Use `getMatchScore()` instead
- `winner?: string | null` - Use `getMatchWinner()` instead
- `isFlexA?: boolean` - Use `isTeamAFlex()` instead
- `isFlexB?: boolean` - Use `isTeamBFlex()` instead

**Made required** (previously optional):
- `originalPA1: PlayerId` - Always set during seeding
- `originalPA2: PlayerId` - Always set during seeding
- `originalPB1: PlayerId` - Always set during seeding
- `originalPB2: PlayerId` - Always set during seeding

### 3. Updated Components

#### App.tsx (`src/App.tsx`)
- Removed `score`, `winner`, `isFlexA`, `isFlexB` from seed data
- Updated standings calculation to use `getMatchWinner()`, `isTeamAFlex()`, `isTeamBFlex()`
- Added backward compatibility logic to populate original fields for existing data

#### ReportModal (`src/components/modals/ReportModal.tsx`)
- Removed `score`, `isFlexA`, `isFlexB` from save data
- Only stores `games` array - score and winner computed from this
- Updated clear function to only remove `games`, not computed fields
- History tracking still records score/winner changes for audit purposes

#### MatchCard (`src/components/matches/MatchCard.tsx`)
- Uses `getMatchScore()`, `getMatchWinner()`, `isTeamAFlex()`, `isTeamBFlex()`
- Removed fallback logic for original players (now always present)

#### PlayerStandings (`src/components/dashboard/PlayerStandings.tsx`)
- Uses `getMatchWinner()`, `isTeamAFlex()`, `isTeamBFlex()`
- Flex game detection now uses computed functions

### 4. Backward Compatibility
- Existing matches without original fields will have them automatically populated from seed data
- These fields are then saved to Firebase for future loads
- History entries can still track score/winner changes for audit trail

## Benefits

### Data Integrity
- Single source of truth: `games` array
- Score and winner always consistent with game results
- Flex status always consistent with player assignments
- Original player assignments properly persisted

### Reduced Storage
- No redundant data in database
- Easier to maintain and debug
- Less chance of data inconsistencies

### Easier Testing
- Computed values can be tested independently
- No need to mock stored computed values
- Clearer separation of concerns

## Migration Notes

### Existing Data
- Old matches with `score`, `winner`, `isFlexA`, `isFlexB` will continue to work
- These fields are simply ignored now - values are computed on-the-fly
- You may want to clean up the database by removing these fields (optional)

### Database Cleanup (Optional)
If you want to remove the old computed fields from Firebase:
```javascript
// Run this once to clean up old data
matches.forEach(match => {
  updateDoc(matchRef, {
    score: deleteField(),
    winner: deleteField(),
    isFlexA: deleteField(),
    isFlexB: deleteField(),
  });
});
```

## Testing Checklist
- [x] Build succeeds without errors
- [ ] Match scores display correctly
- [ ] Winner highlighting works
- [ ] Flex badges show correctly
- [ ] Player standings calculate properly
- [ ] Flex game counting is accurate
- [ ] History tracking works
- [ ] Backward compatibility with existing data
