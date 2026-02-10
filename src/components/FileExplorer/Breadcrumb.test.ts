import { describe, test, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import Breadcrumb from './Breadcrumb.vue'
import { useFileExplorerStore } from 'src/stores/fileExplorer'

describe('Breadcrumb.vue', () => {
  let pinia: any

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
  })

  const globalConfig = {
    plugins: [pinia],
    stubs: {
      'q-breadcrumbs': {
        template: '<div class="q-breadcrumbs"><slot /></div>',
      },
      'q-breadcrumbs-el': {
        props: ['label'],
        template:
          '<div class="q-breadcrumbs-el" @click="$emit(\'click\')">{{ label }}</div>',
      },
      'q-btn-dropdown': {
        template: '<div class="q-btn-dropdown"><slot /></div>',
      },
      'q-list': { template: '<div class="q-list"><slot /></div>' },
      'q-item': {
        template:
          '<div class="q-item" @click="$emit(\'click\')"><slot /></div>',
      },
      'q-item-section': {
        template: '<div class="q-item-section"><slot /></div>',
      },
      'q-icon': { template: '<div class="q-icon"><slot /></div>' },
      'q-item-label': { template: '<div class="q-item-label"><slot /></div>' },
    },
  }

  test('renders segments correctly for root path', () => {
    const store = useFileExplorerStore()
    store.currentPath = '/'

    const wrapper = mount(Breadcrumb, { global: globalConfig })

    const elements = wrapper.findAll('.q-breadcrumbs-el')
    expect(elements).toHaveLength(1)
    expect(elements[0].text()).toBe('/')
  })

  test('renders segments correctly for deep path', () => {
    const store = useFileExplorerStore()
    store.currentPath = '/home/user/documents'

    const wrapper = mount(Breadcrumb, { global: globalConfig })

    const elements = wrapper.findAll('.q-breadcrumbs-el')
    expect(elements).toHaveLength(4)
    expect(elements[0].text()).toBe('/')
    expect(elements[1].text()).toBe('home')
    expect(elements[2].text()).toBe('user')
    expect(elements[3].text()).toBe('documents')
  })

  test('navigates to segment when clicked', async () => {
    const store = useFileExplorerStore()
    store.currentPath = '/home/user'
    vi.spyOn(store, 'navigateToDirectory').mockResolvedValue(undefined as any)

    const wrapper = mount(Breadcrumb, { global: globalConfig })

    const elements = wrapper.findAll('.q-breadcrumbs-el')
    await elements[0].trigger('click') // root
    expect(store.navigateToDirectory).toHaveBeenCalledWith('/')

    await elements[1].trigger('click') // home
    expect(store.navigateToDirectory).toHaveBeenCalledWith('/home')
  })

  test('quick access buttons call correct store methods', async () => {
    const store = useFileExplorerStore()
    vi.spyOn(store, 'navigateToHome').mockResolvedValue(undefined as any)
    vi.spyOn(store, 'navigateToDesktop').mockResolvedValue(undefined as any)
    vi.spyOn(store, 'navigateToDocuments').mockResolvedValue(undefined as any)
    vi.spyOn(store, 'navigateToDownloads').mockResolvedValue(undefined as any)

    const wrapper = mount(Breadcrumb, { global: globalConfig })

    const items = wrapper.findAll('.q-item')
    expect(items).toHaveLength(4)

    await items[0].trigger('click')
    expect(store.navigateToHome).toHaveBeenCalled()

    await items[1].trigger('click')
    expect(store.navigateToDesktop).toHaveBeenCalled()

    await items[2].trigger('click')
    expect(store.navigateToDocuments).toHaveBeenCalled()

    await items[3].trigger('click')
    expect(store.navigateToDownloads).toHaveBeenCalled()
  })

  test('returns empty segments if path is empty', () => {
    const store = useFileExplorerStore()
    store.currentPath = ''
    const wrapper = mount(Breadcrumb, { global: { plugins: [pinia] } })
    expect((wrapper.vm as any).pathSegments).toHaveLength(0)
  })
})
