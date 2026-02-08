set -e

PROJECT_DIR="/i/Software/Angular/fitnesstracker"
BRANCH="main"
REMOTE="git@github.com:BekirLabjani/fitnesstracking-app.git"

echo "🔧 Wechsel ins Projektverzeichnis..."
cd "$PROJECT_DIR"

echo "🟢 Git-Status:"
git status

echo "📦 Dateien hinzufügen..."
git add .

echo "📝 Commit erstellen..."
git commit -m "Update"

echo "🚀 Push zu GitHub..."
git remote set-url origin "$REMOTE"
git push origin "$BRANCH"

echo "✅ Fertig! Code wurde gepusht."