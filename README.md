# Protein Secondary Structure Prediction: Web App

**Live app:** <https://protein-secondary-structure-fronten.vercel.app/>

Interactive front end for a deep-learning model that predicts, for every amino acid in a protein, whether it
folds into a **helix**, **strand** or **coil**. It talks to the
[prediction API](https://github.com/BhanuPrasadPalella-01/protein-ss-backend), which serves three trained models:

| Model | Q3 accuracy on CB513 |
|---|---:|
| Baseline BiLSTM (sequence only) | 68.73% |
| + PSSM evolutionary profile | 79.30% |
| + PSSM + self-attention | **80.09%** |

## Pages

| Page | What it shows |
|---|---|
| **Overview** | The project at a glance: the three models and the pipeline |
| **Predict** | Paste an amino-acid sequence and get a per-residue H/E/C prediction, its composition, and an animated 3D schematic of the predicted structure |
| **Compare** | Q3 accuracy and per-class F1 of the three models side by side |
| **Explorer** | CB513 test proteins: true structure against the PSSM and attention models' predictions, with match rates |
| **Architecture** | 3D walkthrough of the PSSM + attention network, layer by layer |
| **About** | Methodology and the architecture pipeline |

Pasted sequences run the sequence-only baseline, because the stronger models need a PSSM profile, which can't
be computed for an arbitrary sequence; the Explorer shows the stronger models on benchmark proteins that come
with one.

## Built with

React 19, Vite, Tailwind CSS 4, React Router, and Three.js via React Three Fiber (loaded only on the pages
that use 3D). Light and dark themes, reduced-motion support, and a mobile navigation bar.

## Run locally

```bash
npm install
```

```bash
npm run dev
```

The app uses the deployed API by default. To use a local backend instead, create `.env.local` with:

```bash
VITE_API_URL=http://localhost:8000
```

Other scripts: `npm run build` (production build into `dist/`), `npm run preview`, `npm run lint`.

## Notes

The API runs on Render's free tier, which sleeps when idle. The app pings it as soon as the Predict page
opens, and the first request after a quiet period can take up to a minute.
