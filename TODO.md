This is a place for me to jot down fixes and a "Wishlist" for things I'd like to do in the future. Organized by Short, Medium, and Long term.

# Short Term

## Fixes

- [x] Edit entries screen needs to have a duration editing box, not just a start & end time - Added in Version 0.22.5

## Tweaks

- [ ] Add table of contents to top of README.md
- [ ] Put astericks next to required fields in forms

# Medium Term

- [ ] Start developing administration documentation

# Long Term

## Module-ize the different components

- [ ] Make time-tracking/billing/invoicing its own module that can be installed independently during setup
- [ ] Make notes/knowledge base its own module
- [ ] Make support tickets its own module

## Dashboard Tweaks

- [ ] Dashboard should become the hub for managing clients/projects
    - [ ] Add "Past Due/Due Soon" section that shows past due and upcoming tasks sorted by client and project
    - [ ] Add "Latest Updates" section which shows newest clients, newest projects, newest notes, newest support tickets
    - Initial dashboard should be the organization dashboard with Activity Feed/To Do/Tickets
        - Should also include Organization Knowledge Base

## Tasks

### Phase 1 - 

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

## Integrations

- [ ] Create public-facing APIs with keys to allow the app to be integrated with existing solutions
- [ ] Google Calendar
- [ ] Outlook Calendar
- [ ] ZenDesk (?)
    - Definitely should have an import from ZenDesk
- [ ] Google Tasks
    - Need an import
- [ ] Micrsoft To Do
    - Need an import
- [ ] Microsoft SharePoint (?)
- [ ] WordPress
    - [ ] Support Ticket plugin
        - Support tickets would need a form for the front end
    - [ ] Knowledge Base plugin
- [ ] Shopify
    - [ ] Knowledge Base plugin
    - [ ] Support ticket plugin
        - Support tickets would need a form for the front end    
- [ ] Slack
- [ ] Discord