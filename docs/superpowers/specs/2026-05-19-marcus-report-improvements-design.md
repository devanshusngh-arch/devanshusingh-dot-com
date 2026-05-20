# Marcus Report — Visual Dashboard + Executive Summary

## Overview

Improve the BrandBoard report with richer visualizations and a scannable executive summary card at the top.

## Changes

### 1. Radar Chart for Aaker Equity

Replace the 5 horizontal equity bars with a pentagon radar/spider chart.

- **Axes**: Awareness, Loyalty, Perceived Quality, Associations, Proprietary Assets
- **Scale**: 0-10 per axis
- **Colors**: Each axis uses its assigned mild purple shade
- **Implementation**: SVG `<polygon>` with calculated coordinates, animated fill
- **Location**: Equity tab, replacing the existing bar list

### 2. Funnel Visualization

Replace horizontal bars with a true funnel shape (trapezoid stages).

- **Stages**: Awareness → Consideration → Preference → Trial → Repeat → Advocacy
- **Shape**: Each stage is a centered trapezoid, width proportional to percentage
- **Leakage**: Stages with >20pp drop get red tint + warning icon
- **Implementation**: SVG with stacked trapezoids or CSS clip-path

### 3. Positioning Map Refinements

- Add dashed grid lines (quadrant dividers)
- Label quadrants (e.g., "Budget", "Aspirational", etc.)
- No structural changes to existing scatter plot

### 4. "At a Glance" Executive Summary Card

Fixed top card in the report with:

- **Brand Grade**: A-F computed as weighted average of equity (40%) + funnel (30%) + availability (30%)
  - A: ≥8.5, B: ≥7.0, C: ≥5.5, D: ≥4.0, F: <4.0
- **Top Risk**: single line from data.top_risk
- **Recommendation**: single line from data.recommendation
- **Quick metrics row**: CBBE level, archetype, lifecycle, mental/physical availability
- Collapsible state persisted per session

### Risk/Recommendation Badges

- Risk: red/orange/green badge based on severity keywords
- Recommendation: blue/info badge

## Files to modify

- `src/components/brand-board/BrandDashboard.tsx` — main changes
- `src/components/brand-board/utils.tsx` — possibly for grade computation helper
- `src/components/brand-board/BrandBoard.tsx` — may need layout adjustments

## Non-goals

- No changes to the API or data flow
- No changes to the hero/search UI
- No PDF export changes (separate concern)
