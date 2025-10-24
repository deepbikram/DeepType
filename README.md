# DeepType

<img width="1000" alt="Screen Shot 2022-08-28 at 9 15 36 AM" src="https://user-images.githubusercontent.com/39578778/187084111-97d69aa7-53e4-46b9-b156-3ecc4d180d08.png">

## DeepType - Elegant Typing Test

An elegant typing test tool.

> Typing rule and interactions inspired by the famous [monkeytype.com](www.monkeytype.com)


## Feature Requests / Issues / Bug Reports

Please submit any issues or feature requests through GitHub issues.

## Current Features:

#### 1. Typing Test (words, sentence)

  - words mode
    - English Hard: Random blog words data source
    - English Normal: Top 1000 most frequently used English words
    - Support four test durations: 90s, 60s, 30s, 15s
    - + Numbers: add random numbers from 0-99 at the end of the regenerated word
    - + Symbols: add random symbols at the end of the regenerated words
  - Sentence mode
    - English: Random English short sentences
    - Support three sentence count settings: 5, 10, 15
  - Stats:
    - WPM
    - KPM
    - Accuracy
    - Error analysis (correct/error/missing/extra chars count)
    - Visualizations
  - Pacing Style (word pulse/ character caret):
    - Pulse mode: the active word will have an underline pulse, which helps improve the speed typing habit.
    - Caret mode: a pacing caret, advancing character by character, which aligns normal typing habit.

#### 2. Coffee Mode

 - Free typing mode for testing anything you want to type

#### 3. QWERTY Keyboard Touch-Typing Trainer 

 - A QWERTY keyboard layout UI with random key generation for touch typing practice with stats

#### 4. Spotify Player

 - Integrated Spotify player for background music while typing

#### 5. Vocabulary Cards (for English learners)

 - Flashcard-based vocabulary learning system
 - Vocabulary sources: GRE, TOEFL, CET4, CET6
 - Chapter-based organization for structured learning
 - Hide word mode for self-testing
 - Practice typing with vocabulary words
 
#### 6. Themes Collection

- Static Themes

  - Dark
  - Tokyo night
  - Piano
  - Aluminum
  - Terminal (matrix inspired)
  - Cyber (cyberpunk inspired)
  - Steam (steampunk inspired)
  - Light
  - Nintendo
  - Araki Nobuyoshi
  - Hero
  - Budapest
  - Cool Kid
  - EdgeRunner (cyberpunk 2077 edgerunners episodes inspired)

- Dynamic Themes (WebGL based, may degrade performance. experimental feature. Component Library used from [UV canvas](https://uvcanvas.com/))

  - Tranquiluxe,
  - Lumiflex,
  - Opulento,
  - Velustro

![dynamicThemesDemo](https://github.com/gamer-ai/eletypes-frontend/assets/39578778/d716a287-6f59-4568-8276-1ee6b5f5850a)

  
#### 7. LocalStorage Persistence

  - Browser refresh will restore your last settings
  - All essential preferences are saved automatically

#### 8. Focus Mode

  - Move header to footer
  - Hide the settings menu, leaving only timer and WPM stats
  - If music is enabled, a compact Spotify player will appear in the footer

#### 9. Ultra Zen Mode

![image](https://github.com/user-attachments/assets/ab3e7c94-4f38-4607-86aa-1cd3d8296381)

Toggle zen mode to enable ultra zen mode in words mode. This mode automatically highlights and dims text as you type for a distraction-free experience. 

 
#### 10. Typing Sound Effect

  - default: cherry blue switch
  - optional: keyboard (hard)
  - optional: typewriter (soft)
  
  <img width="120" alt="Screen Shot 2022-09-29 at 2 01 51 AM" src="https://user-images.githubusercontent.com/39578778/192989337-637e1154-fbca-420b-babb-22846d5dbdb1.png">
  
#### 11. [Tab] key to Fast redo/reset

  - [Tab] + [Space] for quickly redo
  - [Tab] + [Enter] / [Tab] + [Tab] for quickly reset
  - [Tab] + [Any Key] to exit the dialog


### Some Themes

<img width="600" alt="DeepType Themes" src="https://user-images.githubusercontent.com/39578778/187084245-364b6c5f-97e4-42c9-a0c6-010505ad3283.png">

### Caps Lock Detection

<img width="400" alt="Screen Shot 2022-04-20 at 4 52 24 PM" src="https://user-images.githubusercontent.com/39578778/164343051-2de97570-fcec-49a4-893a-903afe94e5f4.png">

### Simplist typing stats is all you need

<img width="800" alt="Screen Shot 2022-08-28 at 9 24 55 AM" src="https://user-images.githubusercontent.com/39578778/187084372-a4d18d33-286e-4e7b-97d0-d069c7fd1d53.png">

### Words Card Demo

Regular Mode and Recite Mode

<img width="400" alt="Screen Shot 2022-08-23 at 12 47 53 AM" src="https://user-images.githubusercontent.com/39578778/186102023-7db8bfc2-f481-4a90-98c2-f47ad66c12cd.png"><img width="400" alt="Screen Shot 2022-08-23 at 12 48 22 AM" src="https://user-images.githubusercontent.com/39578778/186102059-cb7d43a4-a9d3-4728-90f9-2965038ed24c.png">

### QWERTY Touch-Typing Trainer Demo

<img width="800" alt="Screen Shot 2022-08-23 at 12 52 17 AM" src="https://user-images.githubusercontent.com/39578778/186102830-4c664e9a-adfa-48dc-ba8c-e03df4e22ade.png">


## For Devs

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm run build`

Builds the app for production to the `build` folder.\

## 🌐 Deployment

### Deploy to Netlify (Recommended - Fastest Global Performance)

DeepType is optimized for Netlify deployment with automatic configuration via `netlify.toml`.

#### **Option 1: Deploy via Git (Automatic - Best)**

1. Push your code to GitHub, GitLab, or Bitbucket
2. Go to [Netlify](https://netlify.com) and sign up/login
3. Click **"Add new site"** → **"Import an existing project"**
4. Connect your Git repository
5. Netlify will auto-detect settings from `netlify.toml`
6. Click **"Deploy site"**
7. Your site will be live at `https://your-site-name.netlify.app` 🎉

**Benefits:**
- ✅ Automatic deployments on every Git push
- ✅ Preview deployments for pull requests
- ✅ Instant rollback support
- ✅ Free SSL certificate
- ✅ Global CDN with 100+ edge locations

#### **Option 2: Deploy via Netlify CLI**

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Login to your Netlify account
netlify login

# Initialize and deploy
netlify init

# Or deploy directly to production
netlify deploy --prod
```

#### **Option 3: Drag & Drop Deploy**

1. Build your app: `npm run build`
2. Go to [Netlify Drop](https://app.netlify.com/drop)
3. Drag and drop the `build` folder
4. Done! 🎉

### Deploy to Other Platforms

#### **Vercel**
```bash
npm i -g vercel
vercel
```

#### **GitHub Pages**
Add to `package.json`:
```json
"homepage": "https://yourusername.github.io/deeptype",
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d build"
}
```
Then: `npm install gh-pages && npm run deploy`

#### **Cloudflare Pages**
Push to Git and connect via Cloudflare Pages dashboard

#### **Firebase Hosting**
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### 🚀 Performance Tips

- Netlify automatically enables Brotli compression for smaller file sizes
- Static assets are cached for 1 year (configured in `netlify.toml`)
- SPA redirects are handled automatically
- Security headers are pre-configured


### Pull Requests

Create a branch with proper name example 'feat/your-cool-feature', create the pull request and add authors for reviews. Please include description with details.


## License

MIT License






