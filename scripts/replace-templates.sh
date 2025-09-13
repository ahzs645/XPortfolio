#!/bin/bash

# Script to replace template placeholders in index.html with CV.yaml data

RESUME_FILE_PATH='public/CV.yaml'
INDEX_FILE='index.html'
CONFIG_FILE='config.env'

echo "🔄 Starting template replacement..."

# Read the CV YAML file and extract information
if [ -f "$RESUME_FILE_PATH" ]; then
    echo "✓ Using CV file: $RESUME_FILE_PATH"

    # Extract full name
    NAME=$(grep -m 1 "name:" "$RESUME_FILE_PATH" | sed 's/.*name: //' | sed 's/["'\'']//' | xargs)

    # Extract first name only
    FIRSTNAME=$(echo "$NAME" | awk '{print $1}')

    # Extract location
    LOCATION=$(grep -m 1 "location:" "$RESUME_FILE_PATH" | sed 's/.*location: //' | sed 's/["'\'']//' | xargs)

    # Extract email
    EMAIL=$(grep -m 1 "email:" "$RESUME_FILE_PATH" | sed 's/.*email: //' | sed 's/["'\'']//' | xargs)

    # Try to extract title/position from the most recent job or use a default
    TITLE=$(grep -A 5 "experience:" "$RESUME_FILE_PATH" | grep -m 1 "position:" | sed 's/.*position: //' | sed 's/["'\'']//' | xargs)

    # If no title found, use a default
    if [ -z "$TITLE" ]; then
        TITLE="Professional"
    fi

else
    echo "⚠️  CV file not found, using fallback values"
    NAME="Ahmad Jalil"
    FIRSTNAME="Ahmad"
    LOCATION="Prince George, BC"
    EMAIL="me@ahmadjalil.com"
    TITLE="Professional"
fi

# Read HTML preview image from config.env
if [ -f "$CONFIG_FILE" ]; then
    HTML_PREVIEW_IMAGE=$(grep "^HTML_PREVIEW_IMAGE=" "$CONFIG_FILE" | cut -d'=' -f2 | xargs)
    if [ -z "$HTML_PREVIEW_IMAGE" ]; then
        HTML_PREVIEW_IMAGE="link.webp"
    fi
else
    HTML_PREVIEW_IMAGE="link.webp"
fi

# Extract social media URLs from CV.yaml
SOCIAL_LINKEDIN_URL=$(grep -A 5 "network: LinkedIn" "$RESUME_FILE_PATH" | grep "url:" | sed 's/.*url: //' | sed 's/["'\'']//' | xargs)
SOCIAL_GITHUB_URL=$(grep -A 5 "network: GitHub" "$RESUME_FILE_PATH" | grep "url:" | sed 's/.*url: //' | sed 's/["'\'']//' | xargs)
SOCIAL_INSTAGRAM_URL=$(grep -A 5 "network: Instagram" "$RESUME_FILE_PATH" | grep "url:" | sed 's/.*url: //' | sed 's/["'\'']//' | xargs)
DEVELOPER_WEBSITE=$(grep -m 1 "website:" "$RESUME_FILE_PATH" | sed 's/.*website: //' | sed 's/["'\'']//' | xargs)

# Set defaults if not found
[ -z "$SOCIAL_LINKEDIN_URL" ] && SOCIAL_LINKEDIN_URL="https://linkedin.com"
[ -z "$SOCIAL_GITHUB_URL" ] && SOCIAL_GITHUB_URL="https://github.com"
[ -z "$SOCIAL_INSTAGRAM_URL" ] && SOCIAL_INSTAGRAM_URL="https://instagram.com"
[ -z "$DEVELOPER_WEBSITE" ] && DEVELOPER_WEBSITE="https://example.com"

echo "📝 Name: $NAME"
echo "📝 First Name: $FIRSTNAME"
echo "📍 Location: $LOCATION"
echo "📧 Email: $EMAIL"
echo "💼 Title: $TITLE"
echo "🌐 Website: $DEVELOPER_WEBSITE"
echo "🔗 LinkedIn: $SOCIAL_LINKEDIN_URL"
echo "🐱 GitHub: $SOCIAL_GITHUB_URL"
echo "📷 Instagram: $SOCIAL_INSTAGRAM_URL"
echo "🖼️  Preview Image: $HTML_PREVIEW_IMAGE"

# Create backup of index.html
if [ -f "$INDEX_FILE" ]; then
    cp "$INDEX_FILE" "${INDEX_FILE}.bak"
    echo "💾 Backup saved as ${INDEX_FILE}.bak"
fi

# Find and process all HTML and JSON files with placeholders
FILES_TO_PROCESS=$(find . -name "*.html" -o -name "*.json" | grep -v node_modules)
FILES_PROCESSED=0

for FILE in $FILES_TO_PROCESS; do
    if grep -q "{{DEVELOPER_NAME}}\|{{DEVELOPER_FIRSTNAME}}\|{{DEVELOPER_LOCATION}}\|{{DEVELOPER_EMAIL}}\|{{DEVELOPER_TITLE}}\|{{HTML_PREVIEW_IMAGE}}\|{{DEVELOPER_WEBSITE}}\|{{SOCIAL_LINKEDIN_URL}}\|{{SOCIAL_GITHUB_URL}}\|{{SOCIAL_INSTAGRAM_URL}}" "$FILE"; then
        echo "🔍 Found placeholders in $FILE, replacing..."

        # Create backup for main index.html only
        if [ "$FILE" = "./index.html" ]; then
            cp "$FILE" "${FILE}.bak"
            echo "💾 Backup saved as ${FILE}.bak"
        fi

        # Replace placeholders
        sed -i.tmp "s|{{DEVELOPER_NAME}}|$NAME|g" "$FILE"
        sed -i.tmp "s|{{DEVELOPER_FIRSTNAME}}|$FIRSTNAME|g" "$FILE"
        sed -i.tmp "s|{{DEVELOPER_LOCATION}}|$LOCATION|g" "$FILE"
        sed -i.tmp "s|{{DEVELOPER_EMAIL}}|$EMAIL|g" "$FILE"
        sed -i.tmp "s|{{DEVELOPER_TITLE}}|$TITLE|g" "$FILE"
        sed -i.tmp "s|{{DEVELOPER_WEBSITE}}|$DEVELOPER_WEBSITE|g" "$FILE"
        sed -i.tmp "s|{{SOCIAL_LINKEDIN_URL}}|$SOCIAL_LINKEDIN_URL|g" "$FILE"
        sed -i.tmp "s|{{SOCIAL_GITHUB_URL}}|$SOCIAL_GITHUB_URL|g" "$FILE"
        sed -i.tmp "s|{{SOCIAL_INSTAGRAM_URL}}|$SOCIAL_INSTAGRAM_URL|g" "$FILE"
        sed -i.tmp "s|{{HTML_PREVIEW_IMAGE}}|$HTML_PREVIEW_IMAGE|g" "$FILE"

        # Clean up temp file
        rm -f "${FILE}.tmp"

        FILES_PROCESSED=$((FILES_PROCESSED + 1))
    fi
done

if [ $FILES_PROCESSED -gt 0 ]; then
    echo "✅ Template placeholders replaced in $FILES_PROCESSED files"
else
    echo "ℹ️  No placeholders found in any files (already replaced or different format)"
fi

echo "🎉 Template replacement complete!"