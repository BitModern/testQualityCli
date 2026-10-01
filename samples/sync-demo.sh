#!/usr/bin/env bash
#
# Try Gherkin sync (Plan ENG-112) by hand, against a TestQuality server.
#
# Builds a throwaway git repo of .feature files and walks through the plan's
# release-gate sequence, one commit at a time: first import, --write_tags,
# step edits, a rename, a file move, a Feature rename, a delete, a restore
# and a narrowed glob. After each step it pauses and tells you what to look
# for in TestQuality.
#
# Needs:
#   - a server with testQuality#310, e.g. from its worktree:
#       cd ~/Code/testQuality-eng-115 && MAIL_DRIVER=log php artisan serve --port=8002
#   - this CLI built (yarn build), and curl and jq.
#
# Usage:
#   TQ_HOST=http://localhost:8002 TQ_USERNAME=you@example.com TQ_PASSWORD=... samples/sync-demo.sh
#   NONINTERACTIVE=1 ...   to run straight through without pausing
#   KEEP=1 ...             to keep the demo project afterwards (default: asks)
set -euo pipefail

CLI="node $(cd "$(dirname "$0")/.." && pwd)/dist/index.js"
TQ_HOST="${TQ_HOST:-http://localhost:8002}"
API="$TQ_HOST/api"
DEMO="$(mktemp -d "${TMPDIR:-/tmp}/tq-sync-demo.XXXXXX")"
export TQ_HOST

say() { printf '\n\033[1m== %s\033[0m\n' "$*"; }
look() {
  printf '\033[36mCheck in TestQuality:\033[0m %s\n' "$*"
  if [ -z "${NONINTERACTIVE:-}" ]; then read -r -p 'Press Enter to continue... ' _; fi
}
api() { # api METHOD PATH [JSON]
  curl -sS -X "$1" "$API/$2" -H "Authorization: Bearer $TOKEN" -H 'Accept: application/json' \
    -H 'Content-Type: application/json' ${3:+-d "$3"}
}
sync() { $CLI upload_feature 'features/**/*.feature' --project_id="$PROJECT" --folder_id="$FOLDER" --sync "$@"; }
commit() { git add -A && git commit -qm "$1"; }

[ -f "$(dirname "$0")/../dist/index.js" ] || { echo 'Build the CLI first: yarn build'; exit 1; }
: "${TQ_USERNAME:?set TQ_USERNAME}" "${TQ_PASSWORD:?set TQ_PASSWORD}"
curl -sS -o /dev/null "$API" || { echo "No server at $TQ_HOST"; exit 1; }

cd "$DEMO" && git init -q && git config user.email demo@example.com && git config user.name Demo
mkdir -p features

say "Log in to $TQ_HOST"
# login prints the tokens, so keep its output off the screen.
$CLI login "$TQ_USERNAME" "$TQ_PASSWORD" --save >/dev/null 2>&1 || true
# TQ_TOKEN holds the whole token response as JSON.
TOKEN="$(grep '^TQ_TOKEN=' .testquality 2>/dev/null | cut -d= -f2- | jq -r '.access_token // empty' 2>/dev/null || true)"
[ -n "$TOKEN" ] || { echo "Login to $TQ_HOST failed; check TQ_USERNAME and TQ_PASSWORD."; exit 1; }
echo '.testquality' > .gitignore

say 'Create a demo project and a sync folder'
NAME="Sync demo $(date +%H%M%S)"
PROJECT="$(api POST project "{\"name\":\"$NAME\"}" | jq -r '.id')"
ROOT_PLAN="$(api GET "plan?project_id=$PROJECT&per_page=100" | jq -r '[.data[] | select(.is_root)][0].id')"
# A sync needs a folder of its own, as a child of the project's root folder
# (the UI creates folders there too; a folder with no parent is not shown).
ROOT_FOLDER="$(api GET "suite?project_id=$PROJECT&per_page=100" | jq -r '[.data[] | select(.is_root)][0].id')"
FOLDER="$(api POST suite "{\"project_id\":$PROJECT,\"plan_id\":$ROOT_PLAN,\"name\":\"Synced features\",\"plan_suite\":{\"parent_id\":$ROOT_FOLDER}}" | jq -r '.id')"
echo "project $PROJECT \"$NAME\", folder $FOLDER \"Synced features\""

cat > features/checkout.feature <<'EOF'
Feature: Checkout

  Scenario: Pay by card
    When I pay by card
    Then the order is paid

  Scenario: Refund
    When I ask for a refund
    Then the refund is issued
EOF
cat > features/login.feature <<'EOF'
Feature: Login

  Scenario: Sign in
    When I enter my password
    Then I am signed in
    When I open my account
    Then I see my orders

  Scenario: Sign out
    When I sign out
    Then I am signed out

  Scenario: Reset password
    When I reset my password
    Then I get an email
EOF
cat > features/search.feature <<'EOF'
Feature: Search

  Scenario: Find a product
    When I search for "board"
    Then I see boards
    When I open the first result
    Then I see its price

  Scenario: No results
    When I search for "zzz"
    Then I see no results

  Scenario: Filter by price
    When I filter under 10
    Then I see cheap items

  Scenario: Sort by name
    When I sort by name
    Then the items are in order

  Scenario: Suggestions
    When I type "bo"
    Then I see "board" suggested

  Scenario: Recent searches
    When I open search
    Then I see my recent searches
EOF
commit 'first version'

say '1. First sync: every scenario becomes a test'
sync
look "project \"$NAME\" > folder \"Synced features\": folders Feature: Checkout, Login, Search with 11 tests."

say '2. Same files again: nothing is created or changed'
sync
look 'still 11 tests, same ids (TC numbers).'

say '3. --write_tags, locally: preview, then write, then commit'
$CLI upload_feature 'features/**/*.feature' --project_id="$PROJECT" --folder_id="$FOLDER" --write_tags --dry-run
$CLI upload_feature 'features/**/*.feature' --project_id="$PROJECT" --folder_id="$FOLDER" --write_tags
git --no-pager diff --stat && git --no-pager diff features/checkout.feature
commit 'add TestQuality keys'
look 'each file now has @TC<key> above each scenario; the keys match the TC numbers in TestQuality.'

say '4. Edit a step, insert a step, reorder steps'
sed -i.bak 's/Then the order is paid/Then the order is paid and receipted/' features/checkout.feature
perl -0pi -e 's/(    Then I am signed in\n)/$1    When I confirm with a code\n    Then I am verified\n/' features/login.feature
perl -0pi -e 's/(    When I search for "board"\n    Then I see boards\n)(    When I open the first result\n    Then I see its price\n)/$2$1/' features/search.feature
rm -f features/*.bak && commit 'edit, insert, reorder steps'
sync
look 'Pay by card shows the new expected result; Sign in has a new middle step; Find a product has its steps reversed. Same test ids.'

say '5. Rename a scenario, move a file, rename a Feature'
sed -i.bak 's/Scenario: Refund$/Scenario: Refund an order/' features/checkout.feature
mkdir -p features/auth && git mv features/login.feature features/auth/login.feature
sed -i.bak 's/^Feature: Search$/Feature: Product search/' features/search.feature
rm -f features/*.bak && commit 'rename, move, rename Feature'
sync
look '"Refund an order" is the same TC as "Refund"; Login unchanged after the file move; the Search scenarios moved to "Feature: Product search", and the empty "Feature: Search" folder is kept.'

say '6. Delete a scenario: archived, not deleted'
cp features/auth/login.feature /tmp/tq-sync-demo-login.feature
perl -0pi -e 's/\n  \@TC\d+\n  Scenario: Sign out\n    When I sign out\n    Then I am signed out\n//' features/auth/login.feature
commit 'remove Sign out'
sync
look '"Sign out" is in an "Archived" folder under "Synced features", labelled removed-from-source.'

say '7. Put it back with its tag: restored'
cp /tmp/tq-sync-demo-login.feature features/auth/login.feature && commit 'restore Sign out'
sync
look '"Sign out" is back in "Feature: Login" and the removed-from-source label is gone.'

say '8. A narrowed glob (only checkout.feature) would archive 9 of 11 tests: refused'
set +e
$CLI upload_feature 'features/checkout.feature' --project_id="$PROJECT" --folder_id="$FOLDER" --sync --dry-run
$CLI upload_feature 'features/checkout.feature' --project_id="$PROJECT" --folder_id="$FOLDER" --sync
set -e
look 'the dry run lists what would be archived; the real run is refused (409) with the same list and a hint to use --force. Nothing moved.'

say 'Done'
echo "Demo repo: $DEMO"
if [ -z "${KEEP:-}" ] && [ -z "${NONINTERACTIVE:-}" ]; then
  read -r -p "Delete the demo project \"$NAME\"? [y/N] " answer
  if [ "$answer" = y ]; then api DELETE "project/$PROJECT" >/dev/null && echo 'deleted'; fi
fi
