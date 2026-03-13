# Golf Web Application Review

## Overview

**GolfWeb** is a full-featured Angular web application for managing golf rounds, scoring, and competitive play. It's a golf handicap tracking and competition management system designed to record player scores, manage various competition formats, and track performance across courses and time periods. The application supports individual rounds, seasonal cycles, tournaments, and match-play leagues.

## Primary Use Cases

### 1. Player Registration & Authentication
- User login interface (login component)
- New player registration with reCAPTCHA protection
- Authentication with JWT token management stored in localStorage
- Players have roles (ADMIN or PLAYER) to determine access levels

### 2. Round Scoring & Scorecards
- Record scores for individual holes
- Manage and view individual round details
- List all player rounds
- View and manage scorecards with specialized online score card views
- Per-hole data captures strokes, putts, penalties, handicap, gross/net scores

### 3. Course Management
- Browse available courses
- View course details
- Add new courses to system

### 4. Handicap/WHS Tracking
- Player WHS (World Handicap System) tracking
- Score calculations: Brutto (gross), Netto (net), STB (stableford) points
- Handicap calculations incorporated into scorecard scoring

### 5. Seasonal Cycles
- Manage seasonal golf cycles/competitions
- Create new competition cycles
- Cycles can be opened/closed and deleted with confirmation dialogs
- Support for multiple tournament formats within cycles

### 6. Tournament Management
- Browse and manage tournaments
- Display course information for tournament
- View player results and rankings

### 7. Match Play League (MP Leagues)
- Manage match-play leagues
- League-specific operations: add players, record matches, close/delete leagues
- Separate scoring model for match play competitions

### 8. Player Profile Management
- Edit player information
- Social media integration option

### 9. Administration
- Admin dashboard (role-based access via RoleGuard)
- Admin-only operations for system management and player round counts

### 10. System Notifications & Change Log
- System-wide alert/notification display
- Application changelog viewing

## Core Data Models

- **Player** - User accounts with nick, WHS, gender, role, email
- **Round** - Golf round with course, date, players, format (stroke play, match play variants)
- **ScoreCard** - Individual hole scores with gross/net calculations and penalties
- **Course** - Golf course definitions with holes and par
- **Hole** - Individual hole information
- **Format** - Competition format types (stroke play, stableford, etc.)
- **TeeOptions** - Tee selections per player per course

## Technical Architecture

- **Framework**: Angular 21.2.1 with standalone components
- **Routing**: Protected routes with AuthGuard for authentication and RoleGuard for admin access
- **Guards**: Route protection based on authentication status and user role level
- **Security**: CSRF session interceptor, player data interceptor, error handling interceptor
- **UI Components**: Bootstrap 5.3.8, Angular Material, FontAwesome icons, ng2-charts for visualizations
- **State Management**: RxJS for observables and async data handling
- **Real-time**: STOMP WebSocket support via @stomp/rx-stomp for live updates
- **Internationalization**: i18n with Polish locale support (messages.pl.xlf)

## Key Features Summary

| Feature | Purpose |
|---------|---------|
| **Stroke Recording** | Log scores hole-by-hole during/after rounds |
| **Handicap Tracking** | Maintain WHS handicap index |
| **Score Variants** | Support multiple formats (stroke play, stableford, match play) |
| **Competitive Cycles** | Organize seasonal competitions with multiple tournaments |
| **Match Play Leagues** | Manage head-to-head golf competitions |
| **Multi-course Support** | Track scores across multiple golf courses |
| **Player Rankings** | Calculate standings and rankings by format/cycle |
| **Admin Controls** | System administration and player management |
| **Mobile-friendly UI** | Responsive Bootstrap-based design |