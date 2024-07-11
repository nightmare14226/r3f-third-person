import create from 'zustand'

const store = create(() => ({
  components: {
    player: null,
    camera: null
  }
}))

export const useStore = store

export default store
