# Changelog

All notable changes to Alchemist's Compass will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2025-10-14

### Added
- **Guide Mode AI Chat**: AI chat interface available during task planning phase
  - Ask questions before starting tasks
  - Get feedback on approach and steps
  - Better preparation for execution
  - Auto-scroll chat to latest messages
- **Bulk Delete**: One-click deletion for entire WANT/SHOULD boards
  - Trash icon next to tab navigation
  - Confirmation dialog for safety
  - Quick project switching
- **Log Editing**: Edit completed task logs
  - Modify task title, pre-action notes, post-action notes
  - Save/Cancel buttons for editing mode
  - Better reflection and continuous improvement
- **Log Deletion**: Remove unnecessary action logs
  - Individual log deletion with confirmation
  - Maintain clean history

### Changed
- Improved chat interface UX with auto-scroll
- Enhanced chat message persistence during task execution
- Updated version number in Settings page (1.3.0)

### Fixed
- Chat scroll behavior improved
- Better message history management

## [1.2.0] - 2025-10-07

### Added
- **Bulk Task Input**: Add multiple tasks at once from Notion/Obsidian
  - AI auto-classification (Want/Should)
  - Batch evaluation for up to 20 tasks
  - One-click paste workflow
- **Customizable Timer**: Choose from 5 duration options (5/10/15/25/30min)
  - Pomodoro-compatible (25min setting)
  - Flexible time management
- **Action Log System**: Dedicated tab for completed tasks
  - Completion history tracking
  - Visual timeline
  - Performance insights
- **Sticky Notes**: Pre and post-action note capture
  - Pre-action: Intentions and goals
  - Post-action: Learnings and insights
  - Integrated with action log

### Changed
- Enhanced analytics with action log data
- Improved task management workflow

## [1.1.0] - 2025-09-28

### Added
- **Personalization Features**:
  - User name and context input
  - Custom AI instructions
  - File upload support (.md, .txt)
  - Context-aware AI evaluation and chat
- **Theme System**: 4 design themes
  - Dashboard (blue/cyan)
  - Ember (gray/pink)
  - Neon (purple/pink)
  - Forest (green/emerald)
- Settings panel with organized sections
- Version info display

### Changed
- Enhanced AI responses with personalization context
- Improved settings page layout

## [1.0.0] - 2025-09-20

### Added
- Initial release
- Core task management (Want/Should)
- AI-powered task evaluation (Gemini API)
- AI-generated execution guides
- Timer functionality (5 minutes)
- Real-time AI chat during execution
- Analytics dashboard
- Bottom navigation
- localStorage persistence
- PWA manifest
- Modern dashboard UI design

[1.3.0]: https://github.com/I1031-h/alchemist-compass/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/I1031-h/alchemist-compass/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/I1031-h/alchemist-compass/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/I1031-h/alchemist-compass/releases/tag/v1.0.0
