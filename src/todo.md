# SMITE 2 Tool - TODO List

## High Priority

### [x] Update Builds with New Items
- [x] Review current builds for accuracy
- [x] Add latest items from recent patches
- [x] Add reasoning/explanation for each item choice
- [x] Include situational alternatives
- [x] Add build notes explaining win conditions

### [ ] Fix Scrapers - Remove Unnecessary Data
- [ ] Stop downloading item images during scraping (images should be downloaded separately)
- [ ] Remove any redundant data collection
- [ ] Optimize scraper to only fetch needed fields
- [ ] Update scrape-item-enhanced.js to skip image downloads
- [ ] Update scrape-god-enhanced.js to skip image downloads

### [ ] Fix Item Cost Calculation
- [ ] Change scrapers to capture total item cost (not just final upgrade cost)
- [ ] Calculate build path total cost correctly
- [ ] Update items.json with accurate total costs
- [ ] Verify cost calculations on item detail pages
- [ ] Update BuildsList to show accurate total build costs

### [ ] Implement Patch/Update System
- [ ] Design patch data structure (patch version, date, changes)
- [ ] Create scraper for patch notes from wiki
- [ ] Implement incremental scraping:
  - [ ] Track last scraped version/date
  - [ ] Only scrape new items added since last update
  - [ ] Only update changed items (detect changes via hash/timestamp)
  - [ ] Skip unchanged items to save time and resources
- [ ] Add patch version metadata to gods.json and items.json
- [ ] Create "diff" system to identify what changed between patches
- [ ] Add UI to show current patch version
- [ ] Add changelog/patch notes display on homepage
- [ ] Create update script that:
  - [ ] Fetches latest patch info
  - [ ] Compares with current data
  - [ ] Only scrapes new/modified content
  - [ ] Merges updates into existing data files
- [ ] Handle removed items/gods gracefully
- [ ] Add backup system before applying updates

## Medium Priority

### [ ] Complete UI Overhaul
- [ ] Reduce visual bulk/clutter on all pages
- [ ] Improve spacing and whitespace
- [ ] Modernize color scheme
- [ ] Make item/god cards more compact
- [ ] Improve mobile responsiveness
- [ ] Add smooth transitions and animations
- [ ] Consider using a proper CSS solution (Tailwind, CSS modules, etc.)
- [ ] Simplify navigation

#### Specific Page Improvements:
- [ ] GodsList - Make cards more compact
- [ ] GodDetail - Reduce padding, better layout
- [ ] ItemsList - Streamline filters and cards
- [ ] ItemDetail - Better information hierarchy
- [ ] BuildsList - More visual build path representation
- [ ] Home page - Create engaging landing experience

## Lower Priority

### [ ] Beginner's Guide - How to Build
- [ ] Create step-by-step build guide page
- [ ] Design PPT-style flow/slides
- [ ] Gather in-game screenshots:
  - [ ] Item shop interface
  - [ ] Build screen
  - [ ] Stats overview
  - [ ] Gold economy examples
- [ ] Explain build fundamentals:
  - [ ] Early game vs late game items
  - [ ] Power spikes
  - [ ] Counter-building
  - [ ] Role-specific considerations
- [ ] Create interactive elements (if possible)
- [ ] Add navigation between guide steps

## Future Enhancements

### [ ] Data Management
- [ ] Set up automatic data updates
- [ ] Add patch version tracking
- [ ] Create data validation scripts

### [ ] Features
- [ ] Add god-specific build recommendations
- [ ] Create build comparison tool
- [ ] Add favorites/saved builds
- [ ] Community builds submission

### [ ] Technical Debt
- [ ] Convert inline styles to proper CSS solution
- [ ] Add TypeScript strict mode
- [ ] Improve error handling
- [ ] Add loading states
- [ ] Implement proper state management (if needed)

---

**Notes:**
- Image downloads should remain separate from data scraping
- Keep scraper utils (fetchWithRetry, sanitizeId) as they work well
- Consider user feedback before major UI changes
