export const fractionate = (val, minVal, maxVal) => {
  return (val - minVal) / (maxVal - minVal)
}

export const map = (val, minVal, maxVal, outMin, outMax) => {
  var fr = fractionate(val, minVal, maxVal)
  var delta = outMax - outMin
  return outMin + fr * delta
}

export const avg = (arr) => {
  if (arr?.length) {
    const total = arr?.reduce(function (sum, b) {
      return sum + b
    })
    return total / arr?.length
  }
  return 0
}

export const max = (arr) => {
  if (arr?.length) {
    return arr?.reduce(function (a, b) {
      return Math.max(a, b)
    })
  }
  return 0
}
