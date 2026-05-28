This is a place for me to jot down fixes and a "Wishlist" for things I'd like to do in the future. Organized by Short, Medium, and Long term.

# Short Term

## Fixes

- [x] Edit entries screen needs to have a duration editing box, not just a start & end time - Added in Version 0.22.5
- [ ] Edit entries screen displays full UUID when one is selected for editing; need a friendly name for that

## Tweaks

- [ ] Add table of contents to top of README.md
- [ ] Put astericks next to required fields in forms
- [ ] Add timezone to Organization and Client settings
- [ ] Add timezone to User settings
- [ ] Store all dates as UTC

# Medium Term

- [ ] Start developing administration documentation

- [ ] Add geolocation settings

- [ ] Make UI "nicer" looking (also, fix the awful colors on the dark mode)

- [ ] Add toast and notification system
    - [ ] Warn about running timers (once DB timer persistence exists)
    - Eventually:
    - [ ] Task notifications
    - [ ] Task reminders
    - [ ] Future integrations (Slack, Discord, Teams, etc.)

- [ ] Auto-create a client with the organization name for internal needs/tasks during setup, but allow this to be selectable
    - Should be marked as non-billable by default
    - [ ] Auto-create some template projects (selectable)
        - Administrative work
        - Sales/prospecting
        - Bookkeeping
        - Internal Maintenance
        - Website work
        - Tooling/dev work
        - Agency notes
        - Internal SOPs

## Team tools

- [ ] Create group/team permissions
    - Allow org, client, and project admins to create groups, assign permissions, and add/remove users
    - This will simplify administrative overhead of permission granting while adding users to clients/projects

- What other team tools would be beneficial?

## Module-ize the different components

- [ ] Make time-tracking/billing/invoicing its own module that can be installed independently during setup
- [ ] Make notes/knowledge base its own module
- [ ] Make support tickets its own module

# Long Term

- [ ] Personal edition
    - 

- [ ] Family edition
    - 


## Dashboard Tweaks

- [ ] Dashboard should become the hub for managing clients/projects
    - [ ] Add "Past Due/Due Soon" section that shows past due and upcoming tasks sorted by client and project
    - [ ] Add "Latest Updates" section which shows newest clients, newest projects, newest notes, newest support tickets
    - Initial dashboard should be the organization dashboard with Activity Feed/To Do/Tickets
        - Should also include Organization Knowledge Base

## Search

- [ ] Possibly build a search engine with elastic search or something else that does fast, full text searching

## Tasks

### Phase 1 - Basic tasks

- [ ] Task title
- [ ] Task description
- [ ] Organization link
- [ ] Client link
- [ ] Optional project link
- [ ] Creator user ID
- [ ] Status
    - open
    - in_progress
    - blocked
    - completed
    - archived
- [ ] Optional due date
- [ ] Optional due time
- [ ] Parent task ID
    - Giving the task a parent task ID gives the parent task a progress bar
    - Task progress bars can be turned off in the parent task's details or project/client/org-wide
    - Prevent loops by disallowing tasks to become a child of themselves or descendants
- [ ] Sort order
- [ ] Tags
- [ ] Basic recurrence fields
    - [ ] recurrence_enabled
    - [ ] recurrence_rule
    - [ ] recurrence_anchor_date
    - [ ] recurrence_next_due_at
    - [ ] recurrence_end_date
    - [ ] recurrence_task_template_id

### Phase 2 - Task Expansion

- [ ] Create join table for potential multiple person task assignment
- [ ] Add reminders (in addition to showing up on the app calendar/notifications)
- [ ] Recurrence task templates (separate table)
    - This will create a template of the original task, keeping the original task intact
    - Templates create a new standard task once a task is completed

## Knowledge Base/Notes

### Phase 1 - Basic Functionality

- [ ] Markdown body
- [ ] Title
- [ ] Org/Client/Project assignment
- [ ] Internal/public/client visibility field, even if public rendering does not exist yet
- [ ] Draft/published/archived status
- [ ] Basic editor
- [ ] Hideable Markdown cheat sheet
- [ ] Note list by Organization, Client, Project

### Phase 2 - Automatic internal knowledge base pages

Add auto-generated pages for:
- [ ] Organization Home
- [ ] Client home
- [ ] Project home
- [ ] Org-wide notes list
- [ ] Client notes list
- [ ] Project notes list

### Phase 3 - Manual knowledge base pages

Let users create manual pages and place them:
- [ ] Under organization
- [ ] Under client
- [ ] Under project
- [ ] Under another manual page

Give them:
- [ ] Title
- [ ] Slug
- [ ] Markdown body
- [ ] Parent page
- [ ] Sort order
- [ ] Visibility
- [ ] Status

### Phase 4 - Wiki links and backlinks

Add:
- [ ] [[Page Title]]
- [ ] [[Page Title|label]]
- [ ] Broken-link detection
- [ ] Backlinks
- [ ] Maybe tags

### Phase 5 - Activity-aware home pages

Make org/client/project pages show:
- [ ] Latest notes
- [ ] Latest tasks
- [ ] Latest tickets
- [ ] Latest project changes
- [ ] To do list
- [ ] Open tickets

This should use a friendly activity feed, not raw audit JSON.

### Phase 6 - Public Knowledge Base

Add public routes like:
/kb/:organizationSlug
/kb/:organizationSlug/:pageSlug

Or, eventually, custom domains/subdomains.

Add:
- [ ] Public/private visibility checks
- [ ] Public page renderer
- [ ] SEO fields
- [ ] Search
- [ ] Sitemap
- [ ] Public-safe attachments

### Phase 7 - External publishing/plugins

Only after public API/auth/scopes are in good shape:
- [ ] WordPress KB plugin
- [ ] Shopify KB/product-support plugin
- [ ] Public API access
- [ ] Sync by API key
- [ ] Optional embeddable widgets

## Support Tickets

- [ ] Research what's really needed for support tickets

- [ ] Include some sort of CAPTCHA for public-facing forms

## Integrations

- [ ] Create public-facing APIs with keys to allow the app to be integrated with existing solutions
- [ ] Google Calendar
    - For scheduling tasks
- [ ] Outlook Calendar
    - For scheduling tasks
- [ ] ZenDesk (?)
    - Definitely should have an import from ZenDesk
- [ ] Google Tasks
    - Need an import
    - Possible syncing??
- [ ] Micrsoft To Do
    - Need an import
    - Possible syncing??
- [ ] Microsoft SharePoint (?)
- [ ] WordPress/WooCommerce
    - [ ] Support Ticket plugin
        - Support tickets would need a form for the front end
    - [ ] Knowledge Base plugin
        - Product support and information
- [ ] Shopify
    - Same as WordPress
- [ ] Big Commerce
    - Same as WordPress
- [ ] Magento
    - Same as WordPress
- [ ] Slack
    - Task reminders
    - Support ticket Notifications
- [ ] Discord
    - Same as Slack
- [ ] Microsoft Teams
    - Same as Slack
- [ ] Quickbooks
    - For bringing in invoice details
- [ ] Other accounting software