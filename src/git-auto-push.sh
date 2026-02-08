#!/usr/bin/env bash
set -e

PROJECT_DIR="/i/Software/Angular/fitnesstracker"
BRANCH="main"
REMOTE="git@github.com:BekirLabjani/fitnesstracking-app.git"

echo "🔧 Wechsel ins Projektverzeichnis..."
cd "$PROJECT_DIR"

echo "📦 Aktuelle Version lesen..."
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "➡️ Aktuelle Version: $CURRENT_VERSION"

echo "📈 Version um 0.01 erhöhen..."
NEW_VERSION=$(node -e "
const fs = require('fs');
const pkg = require('./package.json');

let v = parseFloat(pkg.version);
v = Math.round((v + 0.01) * 100) / 100;
pkg.version = v.toFixed(2);

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
console.log(pkg.version);
")

echo "🆕 Neue Version: $NEW_VERSION"

echo "🔧 Starte Angular Build..."
ng build --configuration=production

echo "🟢 Build abgeschlossen. Git Push startet..."

git remote set-url origin "$REMOTE"
git add package.json dist/

if git diff --cached --quiet; then
  echo "⚠️ Keine Änderungen zum Committen."
else
  git commit -m "Release v$NEW_VERSION"
  git push origin "$BRANCH"
fi

echo "✅ Fertig! Version $NEW_VERSION veröffentlicht."
