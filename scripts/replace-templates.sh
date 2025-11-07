#!/bin/bash

# Script to replace template placeholders in index.html with CV.yaml data

RESUME_FILE_PATH='public/CV.yaml'
TEMPLATE_FILE='index.template.html'
INDEX_FILE='index.html'
CONFIG_FILE='config.env'

trim_value() {
    local value="$1"
    value="${value//\"/}"
    value="${value//\'/}"
    value="${value//$'\r'/}"
    value="${value//$'\n'/}"
    value="${value#"${value%%[![:space:]]*}"}"
    value="${value%"${value##*[![:space:]]}"}"
    printf '%s' "$value"
}

get_config_value() {
    local key="$1"
    [ -f "$CONFIG_FILE" ] || { printf ''; return; }
    local raw
    raw=$(grep "^${key}=" "$CONFIG_FILE" | tail -n 1 | cut -d'=' -f2-)
    trim_value "$raw"
}

echo "🔄 Starting template replacement..."

# Read the CV YAML file and extract information
if [ -f "$RESUME_FILE_PATH" ]; then
    echo "✓ Using CV file: $RESUME_FILE_PATH"

    # Extract full name
    NAME=$(trim_value "$(grep -m 1 "name:" "$RESUME_FILE_PATH" | sed 's/.*name:[[:space:]]*//')")

    # Extract first name only
    FIRSTNAME=${NAME%% *}
    [ -z "$FIRSTNAME" ] && FIRSTNAME="$NAME"

    # Extract location
    LOCATION=$(trim_value "$(grep -m 1 "location:" "$RESUME_FILE_PATH" | sed 's/.*location:[[:space:]]*//')")

    # Extract email
    EMAIL=$(trim_value "$(grep -m 1 "email:" "$RESUME_FILE_PATH" | sed 's/.*email:[[:space:]]*//')")

    # Try to extract title/position from the most recent job or use a default
    TITLE=$(trim_value "$(grep -A 5 "experience:" "$RESUME_FILE_PATH" | grep -m 1 "position:" | sed 's/.*position:[[:space:]]*//')")

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
HTML_PREVIEW_IMAGE=$(get_config_value "HTML_PREVIEW_IMAGE")
[ -z "$HTML_PREVIEW_IMAGE" ] && HTML_PREVIEW_IMAGE="link.webp"

NAME_DISPLAY_MODE=$(get_config_value "NAME_DISPLAY_MODE")
CUSTOM_NAME=$(get_config_value "CUSTOM_NAME")
OS_SUFFIX=$(get_config_value "OS_SUFFIX")
[ -z "$OS_SUFFIX" ] && OS_SUFFIX="XP"

NAME_DISPLAY_MODE_LOWER=$(echo "$NAME_DISPLAY_MODE" | tr '[:upper:]' '[:lower:]')
DISPLAY_NAME="$NAME"

case "$NAME_DISPLAY_MODE_LOWER" in
    first)
        DISPLAY_NAME="$FIRSTNAME"
        ;;
    last)
        LASTNAME="${NAME##* }"
        if [ -n "$LASTNAME" ] && [ "$LASTNAME" != "$NAME" ]; then
            DISPLAY_NAME="$LASTNAME"
        fi
        ;;
    custom)
        if [ -n "$CUSTOM_NAME" ]; then
            DISPLAY_NAME="$CUSTOM_NAME"
        fi
        ;;
    full|"")
        DISPLAY_NAME="$NAME"
        ;;
    *)
        DISPLAY_NAME="$NAME"
        ;;
esac

[ -z "$DISPLAY_NAME" ] && DISPLAY_NAME="$FIRSTNAME"
[ -z "$DISPLAY_NAME" ] && DISPLAY_NAME="$NAME"
[ -z "$DISPLAY_NAME" ] && DISPLAY_NAME="User"
DISPLAY_NAME=$(trim_value "$DISPLAY_NAME")

DEVELOPER_OS_NAME="$DISPLAY_NAME"
if [ -n "$OS_SUFFIX" ]; then
    DEVELOPER_OS_NAME="$DEVELOPER_OS_NAME $OS_SUFFIX"
fi
DEVELOPER_OS_NAME=$(trim_value "$DEVELOPER_OS_NAME")

# Extract social media URLs from CV.yaml
SOCIAL_LINKEDIN_URL=$(trim_value "$(grep -A 5 "network: LinkedIn" "$RESUME_FILE_PATH" | grep "url:" | head -n 1 | sed 's/.*url:[[:space:]]*//')")
SOCIAL_GITHUB_URL=$(trim_value "$(grep -A 5 "network: GitHub" "$RESUME_FILE_PATH" | grep "url:" | head -n 1 | sed 's/.*url:[[:space:]]*//')")
SOCIAL_INSTAGRAM_URL=$(trim_value "$(grep -A 5 "network: Instagram" "$RESUME_FILE_PATH" | grep "url:" | head -n 1 | sed 's/.*url:[[:space:]]*//')")
DEVELOPER_WEBSITE=$(trim_value "$(grep -m 1 "website:" "$RESUME_FILE_PATH" | sed 's/.*website:[[:space:]]*//')")

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
echo "💻 Display Name: $DISPLAY_NAME"
echo "🪟 OS Name: $DEVELOPER_OS_NAME"
echo "🌐 Website: $DEVELOPER_WEBSITE"
echo "🔗 LinkedIn: $SOCIAL_LINKEDIN_URL"
echo "🐱 GitHub: $SOCIAL_GITHUB_URL"
echo "📷 Instagram: $SOCIAL_INSTAGRAM_URL"
echo "🖼️  Preview Image: $HTML_PREVIEW_IMAGE"

# Prepare index.html from template
if [ ! -f "$TEMPLATE_FILE" ]; then
    echo "❌ Template file not found: $TEMPLATE_FILE"
    exit 1
fi

cp "$TEMPLATE_FILE" "$INDEX_FILE"
echo "📝 Generated $INDEX_FILE from $TEMPLATE_FILE"

# Find and process all HTML and JSON files with placeholders (excluding template + node_modules)
FILES_TO_PROCESS=$(find . -type f \( -name "*.html" -o -name "*.json" \) ! -path "./node_modules/*" ! -name "index.template.html")
FILES_PROCESSED=0

for FILE in $FILES_TO_PROCESS; do
    if grep -q "{{DEVELOPER_NAME}}\|{{DEVELOPER_FIRSTNAME}}\|{{DEVELOPER_LOCATION}}\|{{DEVELOPER_EMAIL}}\|{{DEVELOPER_TITLE}}\|{{DEVELOPER_DISPLAY_NAME}}\|{{DEVELOPER_OS_NAME}}\|{{HTML_PREVIEW_IMAGE}}\|{{DEVELOPER_WEBSITE}}\|{{SOCIAL_LINKEDIN_URL}}\|{{SOCIAL_GITHUB_URL}}\|{{SOCIAL_INSTAGRAM_URL}}" "$FILE"; then
        echo "🔍 Found placeholders in $FILE, replacing..."

        # Replace placeholders
        sed -i.tmp "s|{{DEVELOPER_NAME}}|$NAME|g" "$FILE"
        sed -i.tmp "s|{{DEVELOPER_FIRSTNAME}}|$FIRSTNAME|g" "$FILE"
        sed -i.tmp "s|{{DEVELOPER_DISPLAY_NAME}}|$DISPLAY_NAME|g" "$FILE"
        sed -i.tmp "s|{{DEVELOPER_LOCATION}}|$LOCATION|g" "$FILE"
        sed -i.tmp "s|{{DEVELOPER_EMAIL}}|$EMAIL|g" "$FILE"
        sed -i.tmp "s|{{DEVELOPER_TITLE}}|$TITLE|g" "$FILE"
        sed -i.tmp "s|{{DEVELOPER_OS_NAME}}|$DEVELOPER_OS_NAME|g" "$FILE"
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
