export const isWaveForm = () => {
  const queryString = window.location.search
  return queryString === '?waveform'
}
