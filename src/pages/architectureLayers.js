// Layers of BiLSTMAttentionPSSM (the ~80% Q3 model), as stored in best_model_attention.pt.
// B = batch size, L = sequence length. `pos` is the block's [x, y] position in the 3D scene.
// `label` is the short name drawn in the scene; `dim` is the per-residue feature size, used to scale block height.
export const LAYERS = [
  {
    id: 'indices', kind: 'input', label: 'Residue indices', name: 'Residue indices', shape: '(B, L)', params: null, dim: 1,
    detail: 'Integers 0–21: 20 amino acids, X (unknown) and padding', pos: [-15, 1.6],
  },
  {
    id: 'pssm', kind: 'input', label: 'PSSM profile', name: 'PSSM profile', shape: '(B, L, 22)', params: null, dim: 22,
    detail: '22 evolutionary-profile values per residue, used as-is', pos: [-15, -1.6],
  },
  {
    id: 'embedding', kind: 'layer', label: 'Embedding', name: 'Embedding', shape: '(B, L, 32)', params: 704, dim: 32,
    detail: '22 × 32 lookup table; padding index stays zero', pos: [-10.5, 1.6],
  },
  {
    id: 'concat', kind: 'op', label: 'Concat', symbol: '‖', name: 'Concatenate', shape: '(B, L, 54)', params: 0, dim: 54,
    detail: 'Embedding (32) + PSSM (22) joined per residue', pos: [-6.5, 0],
  },
  {
    id: 'bilstm', kind: 'layer', label: 'BiLSTM', name: 'BiLSTM', shape: '(B, L, 128)', params: 61440, dim: 128,
    detail: '1 layer, hidden 64 × 2 directions', pos: [-2.5, 0],
  },
  {
    id: 'attention', kind: 'attention', label: 'Self-attention', name: 'Multi-head self-attention', shape: '(B, L, 128)', params: 66048, dim: 128,
    detail: '4 heads × 32 dims; padded positions masked', pos: [2.5, 0],
  },
  {
    id: 'add', kind: 'op', label: 'Add', symbol: '+', name: 'Residual add', shape: '(B, L, 128)', params: 0, dim: 128,
    detail: 'BiLSTM output + attention output (skip connection)', pos: [6.5, 0],
  },
  {
    id: 'layernorm', kind: 'layer', label: 'LayerNorm', name: 'LayerNorm', shape: '(B, L, 128)', params: 256, dim: 128,
    detail: 'Normalizes over the 128 features', pos: [10, 0],
  },
  {
    id: 'classifier', kind: 'classifier', label: 'Linear', name: 'Linear classifier', shape: '(B, L, 3)', params: 387, dim: 3,
    detail: '128 → 3 scores per residue', pos: [13.5, 0],
  },
  {
    id: 'argmax', kind: 'output', label: 'Argmax → H/E/C', name: 'Argmax → H / E / C', shape: '(B, L)', params: null, dim: 3,
    detail: 'One label per residue: helix, strand or coil', pos: [17.5, 0],
  },
]

// Data flow between layers. `skip` marks the residual connection drawn around the attention block.
export const EDGES = [
  { from: 'indices', to: 'embedding' },
  { from: 'embedding', to: 'concat' },
  { from: 'pssm', to: 'concat' },
  { from: 'concat', to: 'bilstm' },
  { from: 'bilstm', to: 'attention' },
  { from: 'attention', to: 'add' },
  { from: 'bilstm', to: 'add', skip: true },
  { from: 'add', to: 'layernorm' },
  { from: 'layernorm', to: 'classifier' },
  { from: 'classifier', to: 'argmax' },
]

export const TOTAL_PARAMS = LAYERS.reduce((sum, l) => sum + (l.params ?? 0), 0)

export const formatParams = (params) =>
  params === null ? 'no weights (input/output)' : params === 0 ? 'no weights' : `${params.toLocaleString('en-US')} params`
