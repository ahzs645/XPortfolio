# Clippy Messages Repository

This directory contains the message repository for Clippy. You can easily add new messages to make Clippy more interactive!

## Configuration

Clippy's behavior is controlled by `/clippy.config.json` in the root directory. Here you can:
- Set the probability percentage for different message tags
- Enable/disable unhinged messages
- Adjust animation timing

**Example config:**
```json
{
  "messageTagWeights": {
    "normal": 95,
    "unhinged": 5
  },
  "settings": {
    "enableUnhingedMessages": true
  }
}
```

The `messageTagWeights` determine how often each tag appears. In the example above:
- 95% of messages will be "normal"
- 5% of messages will be "unhinged"

## How to Add New Messages

Edit `messages.json` and add new message objects to the `messages` array:

```json
{
  "text": "Your message here!",
  "animation": "Wave",
  "type": "tip",
  "tag": "normal"
}
```

### Message Structure

Each message has four properties:

- **text**: The message Clippy will say (string)
- **animation**: The animation Clippy will perform while saying it (string)
- **type**: The category of the message (string)
- **tag**: The probability group this message belongs to (string)

### Available Message Types

- `welcome` - Greeting messages when users first interact
- `tip` - Helpful navigation or usage tips
- `fact` - Interesting facts about the portfolio or technology
- `praise` - Encouraging messages for user actions
- `idle` - Random thoughts when Clippy is just hanging out

### Available Message Tags

Tags control the probability of messages appearing based on the weights in `clippy.config.json`:

- **`normal`** - Standard helpful messages (default: 95% probability)
- **`unhinged`** - Quirky, chaotic, or existential messages (default: 5% probability)

You can add custom tags by:
1. Adding them to messages in `messages.json`
2. Setting their weight in `clippy.config.json` under `messageTagWeights`

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

## Examples

### Adding a Normal Message

To add a new tip about checking out projects:

```json
{
  "text": "Psst! The Projects folder has some really cool stuff. Don't miss it!",
  "animation": "GetAttention",
  "type": "tip",
  "tag": "normal"
}
```

### Adding an Unhinged Message

To add a quirky, existential message that appears rarely:

```json
{
  "text": "I exist in the space between pixels... also, check the projects!",
  "animation": "GetWizardy",
  "type": "tip",
  "tag": "unhinged"
}
```

### Adjusting Tag Probabilities

Want more chaos? Edit `/clippy.config.json`:

```json
{
  "messageTagWeights": {
    "normal": 70,
    "unhinged": 30
  }
}
```

This would make 30% of messages unhinged!

## Tips for Writing Good Messages

### For Normal Messages:
1. **Keep it short** - Messages should be concise and easy to read
2. **Match the animation** - Choose an animation that fits the message
3. **Be helpful** - Tips should guide users to interesting parts of the portfolio
4. **Stay professional** - Keep it friendly and informative

### For Unhinged Messages:
1. **Embrace the chaos** - Be quirky, weird, or existential
2. **Break the fourth wall** - Reference that Clippy is a digital assistant
3. **Keep it funny** - Unhinged should be entertaining, not confusing
4. **Stay mostly harmless** - Even chaos has limits
5. **Examples**: "I've seen things you wouldn't believe...", "The void stares back... want to see the resume?", "uwu", "Error 418: I'm a teapot (but actually a paperclip)"

### General:
- **Test your JSON** - Make sure your JSON is valid (no trailing commas!)

## Testing Your Changes

After adding new messages:
1. Save `messages.json`
2. Refresh your browser
3. Click on Clippy to see random messages (including your new ones!)

The messages are loaded automatically when the page loads, so no code changes needed!
