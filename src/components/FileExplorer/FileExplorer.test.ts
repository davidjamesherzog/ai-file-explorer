import { describe, test, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import FileExplorer from './FileExplorer.vue'
import { useFileExplorerStore } from 'src/stores/fileExplorer'

describe('FileExplorer.vue', () => {
  let pinia: any

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    vi.clearAllMocks()
  })

  const globalConfig = {
    plugins: [pinia],
    stubs: {
      Toolbar: { template: '<div class="stub-toolbar"></div>' },
      Breadcrumb: { template: '<div class="stub-breadcrumb"></div>' },
      FileList: { template: '<div class="stub-file-list"></div>' },
      'q-inner-loading': {
        props: ['showing'],
        template: '<div v-if="showing" class="q-inner-loading"><slot /></div>',
      },
      'q-spinner-dots': true,
      'q-banner': {
        template:
          '<div class="q-banner"><slot /><slot name="avatar" /><slot name="action" /></div>',
      },
      'q-icon': true,
      'q-btn': {
        props: ['label'],
        template:
          '<button class="q-btn" @click="$emit(\'click\')">{{ label }}</button>',
      },
    },
  }

  test('calls initialize on mounted', async () => {
    const store = useFileExplorerStore()
    const initSpy = vi
      .spyOn(store, 'initialize')
      .mockResolvedValue(undefined as any)

    mount(FileExplorer, { global: globalConfig })

    expect(initSpy).toHaveBeenCalled()
  })

  test('renders status bar with no selection (singular)', () => {
    const store = useFileExplorerStore()
    store.items = [{ name: 'file1', path: '/file1' }] as any
    store.selectedItems = []

    const wrapper = mount(FileExplorer, { global: globalConfig })
    expect(wrapper.find('.statusbar-left').text()).toContain('1 item')
    expect(wrapper.find('.statusbar-left').text()).not.toContain('items')
  })

  test('renders status bar with no selection (plural)', () => {
    const store = useFileExplorerStore()
    store.items = [
      { name: 'file1', path: '/file1' },
      { name: 'file2', path: '/file2' },
    ] as any
    store.selectedItems = []

    const wrapper = mount(FileExplorer, { global: globalConfig })
    expect(wrapper.find('.statusbar-left').text()).toContain('2 items')
  })

  test('renders status bar with selection (singular)', () => {
    const store = useFileExplorerStore()
    store.items = [{ name: 'file1', path: '/file1' }] as any
    store.selectedItems = [{ name: 'file1', path: '/file1' }] as any

    const wrapper = mount(FileExplorer, { global: globalConfig })
    expect(wrapper.find('.statusbar-left').text()).toContain('1 item selected')
    expect(wrapper.find('.statusbar-left').text()).not.toContain(
      'items selected'
    )
  })

  test('renders status bar with selection (plural)', () => {
    const store = useFileExplorerStore()
    store.items = [
      { name: 'file1', path: '/file1' },
      { name: 'file2', path: '/file2' },
    ] as any
    store.selectedItems = [
      { name: 'file1', path: '/file1' },
      { name: 'file2', path: '/file2' },
    ] as any

    const wrapper = mount(FileExplorer, { global: globalConfig })
    expect(wrapper.find('.statusbar-left').text()).toContain('2 items selected')
  })

  test('shows loading indicator', () => {
    const store = useFileExplorerStore()
    store.loading = true

    const wrapper = mount(FileExplorer, { global: globalConfig })
    expect(wrapper.find('.q-inner-loading').exists()).toBe(true)
  })

  test('shows error message and allows dismissal', async () => {
    const store = useFileExplorerStore()
    store.error = 'Critical Error'

    const wrapper = mount(FileExplorer, { global: globalConfig })
    expect(wrapper.find('.error-message').text()).toContain('Critical Error')

    const dismissBtn = wrapper.find('button.q-btn')
    await dismissBtn.trigger('click')

    expect(store.error).toBeNull()
  })
})
