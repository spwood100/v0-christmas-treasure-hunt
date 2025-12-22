# Christmas Quiz

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/spwood100-7845s-projects/v0-christmas-treasure-hunt)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/oDvxvqBEq4g)

## Overview

A festive Christmas quiz app with team competition, multiple question types (text, photo, music), and a hint system that reduces points. Features include player sign-up with random team assignment, live TV leaderboard, and admin panel for managing questions.

## Features

- **Multiple Question Types**: Text clues, photo rounds, and music rounds
- **Three Answer Modes**: Free text, multiple choice (MCQ), and typeahead autocomplete
- **Hint System**: 3 progressive hints per question with customizable point penalties
- **Team Competition**: Players sign up individually and are randomly assigned to teams
- **Live Leaderboard**: TV-friendly display with auto-refresh for real-time scores
- **Admin Panel**: Password-protected interface for managing questions, teams, and players
- **Bulk Import**: Upload questions via XML file format

## Quick Start

### Prerequisites

- Node.js 20.x or later
- Supabase account (for database)
- Vercel Blob storage (for images/audio)

### Installation

1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/v0-christmas-treasure-hunt.git
cd v0-christmas-treasure-hunt
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables in `.env.local`
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
BLOB_READ_WRITE_TOKEN=your_blob_token
ADMIN_PASSWORD=your_admin_password
```

4. Run database migrations
```bash
# Go to your Supabase SQL Editor and run the scripts in order:
# - scripts/001_create_tables.sql
# - scripts/002_seed_questions.sql
# - scripts/003_add_players.sql
# - scripts/004_add_answer_options.sql
```

5. Start the development server
```bash
npm run dev
```

Visit `http://localhost:3000` to see your app!

## XML Question Format

You can bulk import questions using an XML file. The admin panel has a "Download Template" button, but here's the complete format reference:

### Basic Structure

```xml
<?xml version="1.0" encoding="UTF-8"?>
<questions>
  <question>
    <!-- Question fields go here -->
  </question>
  <question>
    <!-- Another question -->
  </question>
</questions>
```

### Question Fields

#### Required Fields

| Field | Description | Example |
|-------|-------------|---------|
| `<clue>` or `<text>` | The main question/clue text | `<clue>What is the capital of France?</clue>` |
| `<answer>` | The correct answer | `<answer>Paris</answer>` |

#### Question Type Fields

| Field | Values | Default | Description |
|-------|--------|---------|-------------|
| `<type>` | `text`, `photo`, `music` | `text` | Type of question round |
| `<answerMode>` | `freetext`, `mcq`, `typeahead` | `freetext` | How users answer |

#### Hint Fields (all optional)

| Field | Default | Description |
|-------|---------|-------------|
| `<hint1>` or `<clue1>` | "" | First hint text |
| `<hint2>` or `<clue2>` | "" | Second hint text |
| `<hint3>` or `<clue3>` | "" | Third hint text |
| `<maxPoints>` | 100 | Maximum points for correct answer |
| `<hint1Penalty>` | 20 | Points deducted when hint 1 is used |
| `<hint2Penalty>` | 20 | Points deducted when hint 2 is used |
| `<hint3Penalty>` | 20 | Points deducted when hint 3 is used |

#### Media Fields (for photo/music rounds)

| Field | Description | Example |
|-------|-------------|---------|
| `<imageUrl>` or `<image_url>` | URL to image file | `<imageUrl>https://example.com/photo.jpg</imageUrl>` |
| `<audioUrl>` or `<audio_url>` | URL to audio file | `<audioUrl>https://example.com/song.mp3</audioUrl>` |

### Answer Modes

#### 1. Free Text (`freetext`)

Users type their answer freely. No options needed.

```xml
<question>
  <type>text</type>
  <answerMode>freetext</answerMode>
  <clue>I'm cold inside but keep things fresh!</clue>
  <answer>fridge</answer>
  <hint1>I'm in the kitchen</hint1>
  <hint2>I keep food cold</hint2>
  <hint3>I have a freezer section</hint3>
</question>
```

#### 2. Multiple Choice (`mcq`)

Users select from a list of options. **Requires 2+ options with exactly 1 correct.**

```xml
<question>
  <type>text</type>
  <answerMode>mcq</answerMode>
  <clue>What is the capital of France?</clue>
  <answer>Paris</answer>
  <option correct="false">London</option>
  <option correct="true">Paris</option>
  <option correct="false">Berlin</option>
  <option correct="false">Madrid</option>
  <hint1>It's in Western Europe</hint1>
  <maxPoints>80</maxPoints>
  <hint1Penalty>15</hint1Penalty>
</question>
```

#### 3. Typeahead (`typeahead`)

Users type with autocomplete suggestions. **Requires 2+ options with exactly 1 correct.**

```xml
<question>
  <type>text</type>
  <answerMode>typeahead</answerMode>
  <clue>In English criminal law, what describes a person's "guilty mind"?</clue>
  <answer>Mens rea</answer>
  <option correct="false">Actus reus</option>
  <option correct="true">Mens rea</option>
  <option correct="false">Habeas corpus</option>
  <option correct="false">Caveat emptor</option>
  <hint1>It's Latin</hint1>
  <hint2>Opposite of "actus reus"</hint2>
</question>
```

### Option Tags

Options are used for `mcq` and `typeahead` modes:

```xml
<option correct="true">Correct Answer</option>
<option correct="false">Wrong Answer 1</option>
<option correct="false">Wrong Answer 2</option>
```

- **Attribute `correct`**: Set to `"true"` for the correct answer, `"false"` for others
- **Validation**: Must have at least 2 options and exactly 1 with `correct="true"`

### Photo Round Example

```xml
<question>
  <type>photo</type>
  <answerMode>mcq</answerMode>
  <clue>What location is shown in this photo?</clue>
  <answer>fireplace</answer>
  <imageUrl>https://example.com/fireplace-clue.jpg</imageUrl>
  <option correct="false">Kitchen</option>
  <option correct="true">Fireplace</option>
  <option correct="false">Bedroom</option>
  <option correct="false">Bathroom</option>
  <hint1>It's warm here</hint1>
  <hint2>You might roast marshmallows</hint2>
</question>
```

### Music Round Example

```xml
<question>
  <type>music</type>
  <answerMode>freetext</answerMode>
  <clue>Name this Christmas song!</clue>
  <answer>Jingle Bells</answer>
  <audioUrl>https://example.com/jingle-bells.mp3</audioUrl>
  <hint1>It's about a winter activity</hint1>
  <hint2>Mentions a one-horse open sleigh</hint2>
  <hint3>The title repeats twice</hint3>
  <maxPoints>100</maxPoints>
</question>
```

### Complete Example File

```xml
<?xml version="1.0" encoding="UTF-8"?>
<questions>
  <!-- Simple text question with free text answer -->
  <question>
    <type>text</type>
    <answerMode>freetext</answerMode>
    <clue>I'm cold inside but keep things fresh, open my door to find your next quest!</clue>
    <answer>fridge</answer>
    <hint1>I'm in the kitchen</hint1>
    <hint2>I keep food cold</hint2>
    <hint3>I have a freezer section</hint3>
  </question>

  <!-- Multiple choice question -->
  <question>
    <type>text</type>
    <answerMode>mcq</answerMode>
    <clue>What is the capital of France?</clue>
    <answer>Paris</answer>
    <option correct="false">London</option>
    <option correct="true">Paris</option>
    <option correct="false">Berlin</option>
    <option correct="false">Madrid</option>
    <hint1>It's in Western Europe</hint1>
  </question>

  <!-- Typeahead question -->
  <question>
    <type>text</type>
    <answerMode>typeahead</answerMode>
    <clue>In English criminal law, what word describes a person's "guilty mind"?</clue>
    <answer>Mens rea</answer>
    <option correct="false">Actus reus</option>
    <option correct="true">Mens rea</option>
    <option correct="false">Habeas corpus</option>
    <hint1>It's Latin</hint1>
    <hint2>Opposite of "actus reus"</hint2>
  </question>

  <!-- Photo round with MCQ -->
  <question>
    <type>photo</type>
    <answerMode>mcq</answerMode>
    <clue>What room is shown in this photo?</clue>
    <answer>bathroom</answer>
    <imageUrl>https://example.com/bathroom.jpg</imageUrl>
    <option correct="false">Kitchen</option>
    <option correct="false">Bedroom</option>
    <option correct="true">Bathroom</option>
    <option correct="false">Living Room</option>
  </question>

  <!-- Music round -->
  <question>
    <type>music</type>
    <answerMode>freetext</answerMode>
    <clue>Name this Christmas classic!</clue>
    <answer>Jingle Bells</answer>
    <audioUrl>https://example.com/jingle-bells.mp3</audioUrl>
    <hint1>It's about a winter activity</hint1>
    <hint2>Mentions a one-horse open sleigh</hint2>
    <maxPoints>100</maxPoints>
  </question>
</questions>
```

## Deployment

Your project is live at:

**[https://vercel.com/spwood100-7845s-projects/v0-christmas-treasure-hunt](https://vercel.com/spwood100-7845s-projects/v0-christmas-treasure-hunt)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/oDvxvqBEq4g](https://v0.app/chat/oDvxvqBEq4g)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## Key URLs

- **Home**: `/` - Team registration
- **Players**: `/players` - Individual player sign-up
- **Play**: `/play` - Game interface
- **Admin**: `/admin` - Question & team management (password protected)
- **TV Leaderboard**: `/tv` - Large display for showing live scores
- **Leaderboard**: `/leaderboard` - Standard leaderboard view

## Raspberry Pi Hosting

To host locally on a Raspberry Pi:

1. Clone this repo on your Pi
2. Create `.env.local` with your credentials
3. Run `npm install && npm run build`
4. Start with `npm start` or use PM2 for auto-restart
5. Access at `http://[PI_IP]:3000` from any device on your network
