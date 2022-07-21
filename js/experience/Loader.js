class _Loader {
  constructor() {
    this.loading = true
    this.total = 1
    this.itemsLoaded = 0
  }

  enableStarAR() {
    const loading = document.querySelector('.loading')
    loading.style.opacity = '0'

    setTimeout(() => {
      const arbutton = document.getElementById('ARButton')
      arbutton.disabled = false
      arbutton.style.opacity = '1'
      loading.remove()
    }, 700)
  }

  loaded(item) {
    console.log('✅', item)

    this.itemsLoaded++

    if (this.itemsLoaded === this.total) {
      this.loading = false
      this.enableStarAR()
    }
  }
}

const Loader = new _Loader()
export default Loader
