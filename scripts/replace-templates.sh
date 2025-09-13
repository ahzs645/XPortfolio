#!/bin/bash

# Script to replace template placeholders in index.html with CV.yaml data

RESUME_FILE_PATH='public/CV.yaml'
INDEX_FILE='index.html'

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

echo "📝 Name: $NAME"
echo "📝 First Name: $FIRSTNAME"
echo "📍 Location: $LOCATION"
echo "📧 Email: $EMAIL"
echo "💼 Title: $TITLE"

# Create backup of index.html
if [ -f "$INDEX_FILE" ]; then
    cp "$INDEX_FILE" "${INDEX_FILE}.bak"
    echo "💾 Backup saved as ${INDEX_FILE}.bak"
fi

# Check if index.html has placeholders
if grep -q "{{DEVELOPER_NAME}}" "$INDEX_FILE"; then
    echo "🔍 Found placeholders in $INDEX_FILE, replacing..."

    # Replace placeholders in index.html
    # Using different delimiter for sed to avoid issues with special characters
    sed -i.tmp "s|{{DEVELOPER_NAME}}|$NAME|g" "$INDEX_FILE"
    sed -i.tmp "s|{{DEVELOPER_FIRSTNAME}}|$FIRSTNAME|g" "$INDEX_FILE"
    sed -i.tmp "s|{{DEVELOPER_LOCATION}}|$LOCATION|g" "$INDEX_FILE"
    sed -i.tmp "s|{{DEVELOPER_EMAIL}}|$EMAIL|g" "$INDEX_FILE"
    sed -i.tmp "s|{{DEVELOPER_TITLE}}|$TITLE|g" "$INDEX_FILE"

    # Clean up temp file
    rm -f "${INDEX_FILE}.tmp"

    echo "✅ Template placeholders replaced successfully"
else
    echo "ℹ️  No placeholders found in $INDEX_FILE (already replaced or different format)"
fi

echo "🎉 Template replacement complete!"