# Clippy Messages Repository

This directory contains the message repository for Clippy. You can easily add new messages to make Clippy more interactive!

## How to Add New Messages

Edit `messages.json` and add new message objects to the `messages` array:

```json
{
  "text": "Your message here!",
  "animation": "Wave",
  "type": "tip"
}
```

### Message Structure

Each message has three properties:

- **text**: The message Clippy will say (string)
- **animation**: The animation Clippy will perform while saying it (string)
- **type**: The category of the message (string)

### Available Message Types

- `welcome` - Greeting messages when users first interact
- `tip` - Helpful navigation or usage tips
- `fact` - Interesting facts about the portfolio or technology
- `praise` - Encouraging messages for user actions
- `idle` - Random thoughts when Clippy is just hanging out

### Available Animations

Choose from these animations for `"animation"`:

**Gestures & Communication:**
- `Wave` - Friendly wave
- `GestureLeft` - Points left
- `GestureRight` - Points right
- `Explain` - Explaining something
- `GetAttention` - Trying to get attention

**Reactions:**
- `Congratulate` - Celebrating
- `Thinking` - Thinking pose
- `GetWizardy` - Magical/excited
- `Alert` - Alert stance

**Idle Animations:**
- `IdleFingerTap` - Tapping fingers
- `IdleHeadScratch` - Scratching head
- `LookDown`, `LookLeft`, `LookRight`, `LookUp` - Looking around

**Actions:**
- `Processing` - Processing something
- `Searching` - Searching
- `GetTechy` - Technical work
- `Print` - Printing action
- `Save` - Saving action
- `SendMail` - Sending mail

## Example: Adding a New Message

To add a new tip about checking out projects, add this to the messages array:

```json
{
  "text": "Psst! The Projects folder has some really cool stuff. Don't miss it!",
  "animation": "GetAttention",
  "type": "tip"
}
```

## Tips for Writing Good Messages

1. **Keep it short** - Messages should be concise and easy to read
2. **Match the animation** - Choose an animation that fits the message
3. **Be helpful** - Tips should guide users to interesting parts of the portfolio
4. **Stay in character** - Clippy is friendly, helpful, and a bit quirky
5. **Test your JSON** - Make sure your JSON is valid (no trailing commas!)

## Testing Your Changes

After adding new messages:
1. Save `messages.json`
2. Refresh your browser
3. Click on Clippy to see random messages (including your new ones!)

The messages are loaded automatically when the page loads, so no code changes needed!
