import { describe, test, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import Toolbar from './Toolbar.vue'
import { useFileExplorerStore } from 'src/stores/fileExplorer'

// Mock useQuasar
const mockNotify = vi.fn()
vi.mock('quasar', async () => {
  const actual = (await vi.importActual('quasar')) as any
  return {
    ...actual,
    useQuasar: () => ({
      notify: mockNotify,
    }),
  }
})

describe('Toolbar.vue', () => {
  let pinia: any

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    vi.clearAllMocks()
  })

  const globalConfig = {
    plugins: [pinia],
    stubs: {
      'q-btn': {
        props: ['icon', 'disable', 'color', 'label'],
        template:
          '<button class="q-btn" :icon="icon" :disabled="disable" :class="color" @click="$emit(\'click\')">{{ label || icon || "" }}<slot /></button>',
      },
      'q-tooltip': { template: '<div class="q-tooltip"><slot /></div>' },
      'q-separator': { template: '<div class="q-separator"></div>' },
      'q-btn-group': { template: '<div class="q-btn-group"><slot /></div>' },
      'q-input': {
        props: ['modelValue', 'placeholder'],
        template:
          '<div class="q-input-wrapper"><slot name="prepend" /><input class="q-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" /><slot name="append" /></div>',
      },
      'q-dialog': {
        props: ['modelValue'],
        template: '<div v-if="modelValue" class="q-dialog"><slot /></div>',
      },
      'q-card': { template: '<div class="q-card"><slot /></div>' },
      'q-card-section': {
        template: '<div class="q-card-section"><slot /></div>',
      },
      'q-card-actions': {
        template: '<div class="q-card-actions"><slot /></div>',
      },
      'q-btn-dropdown': true,
      'q-list': true,
      'q-item': true,
      'q-item-section': true,
      'q-icon': {
        props: ['name'],
        template: '<div class="q-icon" :name="name"></div>',
      },
      'q-item-label': true,
    },
  }

  test('navigation buttons call store methods', async () => {
    const store = useFileExplorerStore()
    const backSpy = vi
      .spyOn(store, 'navigateBack')
      .mockResolvedValue(undefined as any)
    const forwardSpy = vi
      .spyOn(store, 'navigateForward')
      .mockResolvedValue(undefined as any)
    const upSpy = vi
      .spyOn(store, 'navigateUp')
      .mockResolvedValue(undefined as any)
    const refreshSpy = vi
      .spyOn(store, 'refreshDirectory')
      .mockResolvedValue(undefined as any)

    store.currentPath = '/test'
    store.history = ['/a', '/b']
    store.historyIndex = 1

    const wrapper = mount(Toolbar, { global: globalConfig })

    await wrapper.find('button[icon="arrow_back"]').trigger('click')
    expect(backSpy).toHaveBeenCalled()

    store.historyIndex = 0
    await wrapper.vm.$nextTick()
    const forwardBtn = wrapper.find('button[icon="arrow_forward"]')
    expect(forwardBtn.attributes('disabled')).toBeUndefined()
    await forwardBtn.trigger('click')
    expect(forwardSpy).toHaveBeenCalled()

    await wrapper.find('button[icon="arrow_upward"]').trigger('click')
    expect(upSpy).toHaveBeenCalled()

    await wrapper.find('button[icon="refresh"]').trigger('click')
    expect(refreshSpy).toHaveBeenCalled()
  })

  test('view mode buttons update store', async () => {
    const store = useFileExplorerStore()
    const wrapper = mount(Toolbar, { global: globalConfig })

    await wrapper.find('button[icon="view_list"]').trigger('click')
    expect(store.viewMode).toBe('list')

    await wrapper.find('button[icon="grid_view"]').trigger('click')
    expect(store.viewMode).toBe('grid')
  })

  test('search input updates store', async () => {
    const store = useFileExplorerStore()
    const wrapper = mount(Toolbar, { global: globalConfig })
    const input = wrapper.find('.q-input')

    await input.setValue('test search')
    expect(store.searchQuery).toBe('test search')
  })

  test('create folder dialog and handling', async () => {
    const store = useFileExplorerStore()
    const createSpy = vi
      .spyOn(store, 'createFolder')
      .mockResolvedValue(undefined as any)
    const wrapper = mount(Toolbar, { global: globalConfig })

    // Open dialog
    await wrapper.find('button[icon="create_new_folder"]').trigger('click')

    // Empty name should notify
    const createBtn = wrapper
      .findAll('.q-dialog .q-btn')
      .find((b) => b.text().includes('Create'))
    await createBtn?.trigger('click')
    expect(mockNotify).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'warning' })
    )

    // Success case
    const dialogInput = wrapper.find('.q-dialog .q-input')
    await dialogInput.setValue('New Folder')
    await createBtn?.trigger('click')
    expect(createSpy).toHaveBeenCalledWith('New Folder')
    expect(mockNotify).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'positive' })
    )
  })

  test('delete dialog and confirmation', async () => {
    const store = useFileExplorerStore()
    store.selectedItems = [{ name: 'a', path: '/a' }] as any
    const deleteSpy = vi
      .spyOn(store, 'deleteSelected')
      .mockResolvedValue(undefined as any)
    const wrapper = mount(Toolbar, { global: globalConfig })

    // Open delete dialog
    await wrapper.find('button[icon="delete"]').trigger('click')

    const confirmBtn = wrapper
      .findAll('.q-dialog .q-btn')
      .find((b) => b.text().includes('Delete'))
    await confirmBtn?.trigger('click')

    expect(deleteSpy).toHaveBeenCalled()
    expect(mockNotify).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'positive' })
    )
  })

  test('error handling in delete notification', async () => {
    const store = useFileExplorerStore()
    store.selectedItems = [{ name: 'a', path: '/a' }] as any
    const deleteSpy = vi
      .spyOn(store, 'deleteSelected')
      .mockImplementation(async () => {
        store.error = 'Something went wrong'
      })
    const wrapper = mount(Toolbar, { global: globalConfig })

    await wrapper.find('button[icon="delete"]').trigger('click')
    const confirmBtn = wrapper
      .findAll('.q-dialog .q-btn')
      .find((b) => b.text().includes('Delete'))
    await confirmBtn?.trigger('click')

    expect(deleteSpy).toHaveBeenCalled()
    expect(mockNotify).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: 'positive' })
    )
  })

  test('error handling in create folder notification', async () => {
    const store = useFileExplorerStore()
    const createSpy = vi
      .spyOn(store, 'createFolder')
      .mockImplementation(async () => {
        store.error = 'Something went wrong'
      })
    const wrapper = mount(Toolbar, { global: globalConfig })

    await wrapper.find('button[icon="create_new_folder"]').trigger('click')
    const dialogInput = wrapper.find('.q-dialog .q-input')
    await dialogInput.setValue('N')
    const createBtn = wrapper
      .findAll('.q-dialog .q-btn')
      .find((b) => b.text().includes('Create'))
    await createBtn?.trigger('click')

    expect(createSpy).toHaveBeenCalled()
    expect(mockNotify).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: 'positive' })
    )
  })
})
