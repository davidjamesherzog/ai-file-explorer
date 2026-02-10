import { describe, test, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import FileList from './FileList.vue'
import { useFileExplorerStore } from 'src/stores/fileExplorer'
import type { FileItem as FileItemType } from 'src/types/fileExplorer'
import { h, defineComponent } from 'vue'

// Mock useQuasar
const mockNotify = vi.fn()
const mockDialog = vi.fn().mockReturnValue({
  onOk: (callback: Function) => {
    callback()
    return { onCancel: () => ({ onDismiss: () => {} }) }
  },
})

vi.mock('quasar', async () => {
  const actual = (await vi.importActual('quasar')) as any
  return {
    ...actual,
    useQuasar: () => ({
      notify: mockNotify,
      dialog: mockDialog,
    }),
  }
})

describe('FileList.vue', () => {
  let pinia: any

  const mockItems: FileItemType[] = [
    {
      name: 'file1.txt',
      path: '/file1.txt',
      isDirectory: false,
      size: 1024,
      modified: new Date('2024-01-01T12:00:00Z'),
      created: new Date('2024-01-01T12:00:00Z'),
      extension: 'txt',
    },
    {
      name: 'folder1',
      path: '/folder1',
      isDirectory: true,
      size: 0,
      modified: new Date('2024-01-02T12:00:00Z'),
      created: new Date('2024-01-02T12:00:00Z'),
    },
  ]

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    vi.clearAllMocks()
  })

  // Better QTable stub
  const QTableStub = defineComponent({
    name: 'QTable',
    props: ['rows', 'columns'],
    render() {
      const rows = this.rows || []
      return h(
        'div',
        { class: 'q-table' },
        rows.map((row: any) =>
          h('div', { class: 'q-tr', 'data-row': row.name }, [
            this.$slots['body-cell-name']?.({ row, props: { row } }),
            this.$slots['body-cell-size']?.({ row, props: { row } }),
            this.$slots['body-cell-modified']?.({ row, props: { row } }),
            this.$slots['body-cell-type']?.({ row, props: { row } }),
            this.$slots['body-cell-actions']?.({ row, props: { row } }),
          ])
        )
      )
    },
  })

  const globalConfig = {
    plugins: [pinia],
    stubs: {
      'q-table': QTableStub,
      'q-td': { template: '<div class="q-td"><slot /></div>' },
      'q-icon': {
        props: ['name'],
        template: '<div class="q-icon" :name="name"></div>',
      },
      'q-btn': {
        props: ['icon', 'label'],
        template:
          '<button class="q-btn" :icon="icon">{{ label || icon }}<slot /></button>',
      },
      'q-menu': { template: '<div class="q-menu"><slot /></div>' },
      'q-list': { template: '<div class="q-list"><slot /></div>' },
      'q-item': {
        template:
          '<div class="q-item" @click="$emit(\'click\')"><slot /></div>',
      },
      'q-item-section': {
        template: '<div class="q-item-section"><slot /></div>',
      },
      'q-separator': { template: '<div class="q-separator"></div>' },
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
      'q-input': {
        props: ['modelValue'],
        template:
          '<input class="q-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
      },
    },
  }

  test('renders empty state correctly', async () => {
    const store = useFileExplorerStore()
    store.items = []
    store.searchQuery = ''

    const wrapper = mount(FileList, { global: globalConfig })
    expect(wrapper.find('.file-list__empty').text()).toContain(
      'This folder is empty'
    )

    store.searchQuery = 'test'
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.file-list__empty').text()).toContain(
      'No items match your search'
    )
  })

  test('renders list view items correctly', async () => {
    const store = useFileExplorerStore()
    store.items = mockItems
    store.viewMode = 'list'

    const wrapper = mount(FileList, { global: globalConfig })
    expect(wrapper.find('[data-row="file1.txt"]').text()).toContain('file1.txt')
    expect(wrapper.find('[data-row="folder1"]').text()).toContain('folder1')
  })

  test('grid view item click with multi-select and dblclick', async () => {
    const store = useFileExplorerStore()
    store.items = mockItems
    store.viewMode = 'grid'
    // Sorting: folder1, then file1.txt
    const selectSpy = vi.fn()
    const openSpy = vi.fn()
    store.selectItem = selectSpy
    store.openItem = openSpy

    const wrapper = mount(FileList, {
      global: {
        ...globalConfig,
        stubs: {
          ...globalConfig.stubs,
          FileItem: {
            props: ['item', 'selected'],
            template:
              '<div class="mock-file-item" @click="$emit(\'click\', $event)" @dblclick="$emit(\'dblclick\')">{{ item.name }}</div>',
          },
        },
      },
    })

    const folderItem = wrapper.findAll('.mock-file-item')[0] // folder1
    const fileItem = wrapper.findAll('.mock-file-item')[1] // file1.txt

    // Normal click on file
    await fileItem.trigger('click', { ctrlKey: false, metaKey: false })
    expect(selectSpy).toHaveBeenCalledWith(mockItems[0], false)

    // Ctrl click on folder
    await folderItem.trigger('click', { ctrlKey: true })
    expect(selectSpy).toHaveBeenCalledWith(mockItems[1], true)

    // Meta click on file
    await fileItem.trigger('click', { metaKey: true })
    expect(selectSpy).toHaveBeenCalledWith(mockItems[0], true)

    // Double click on file
    await fileItem.trigger('dblclick')
    expect(openSpy).toHaveBeenCalledWith(mockItems[0])
  })

  test('grid view context menu', async () => {
    const store = useFileExplorerStore()
    store.items = mockItems
    store.viewMode = 'grid'

    const wrapper = mount(FileList, {
      global: {
        ...globalConfig,
        stubs: {
          ...globalConfig.stubs,
          FileItem: {
            props: ['item'],
            template:
              '<div class="mock-file-item" @contextmenu="$emit(\'contextmenu\', $event)">{{ item.name }}</div>',
          },
        },
      },
    })

    const firstItem = wrapper.find('.mock-file-item')
    const event = { preventDefault: vi.fn() }
    await firstItem.trigger('contextmenu', event)
    expect(event.preventDefault).toHaveBeenCalled()
  })

  test('handles rename and other actions via context menu', async () => {
    const store = useFileExplorerStore()
    store.items = mockItems
    store.viewMode = 'list'
    const renameSpy = vi.fn().mockResolvedValue(undefined)
    const openSpy = vi.fn()
    const showSpy = vi.fn()
    store.renameItem = renameSpy
    store.openItem = openSpy
    store.showInFolder = showSpy

    const wrapper = mount(FileList, { global: globalConfig })
    const file1Row = wrapper.find('[data-row="file1.txt"]')
    await file1Row.find('button[icon="more_vert"]').trigger('click')

    // Rename
    const renameItem = file1Row
      .findAll('.q-item')
      .find((i) => i.text().includes('Rename'))
    await renameItem?.trigger('click')
    const input = wrapper.find('.q-dialog .q-input')
    await input.setValue('new_name.txt')
    await wrapper
      .findAll('.q-dialog .q-btn')
      .find((b) => b.text().includes('Rename'))
      ?.trigger('click')
    expect(renameSpy).toHaveBeenCalled()

    // Open
    await file1Row.find('button[icon="more_vert"]').trigger('click')
    const openItem = file1Row
      .findAll('.q-item')
      .find((i) => i.text().includes('Open'))
    await openItem?.trigger('click')
    expect(openSpy).toHaveBeenCalled()

    // Show in Folder
    await file1Row.find('button[icon="more_vert"]').trigger('click')
    const showItem = file1Row
      .findAll('.q-item')
      .find((i) => i.text().includes('Show in Folder'))
    await showItem?.trigger('click')
    expect(showSpy).toHaveBeenCalled()
  })

  test('handles delete via context menu', async () => {
    const store = useFileExplorerStore()
    store.items = mockItems
    store.viewMode = 'list'
    const deleteSpy = vi.fn().mockResolvedValue(undefined)
    store.deleteSelected = deleteSpy
    const selectSpy = vi.fn()
    store.selectItem = selectSpy

    const wrapper = mount(FileList, { global: globalConfig })
    const file1Row = wrapper.find('[data-row="file1.txt"]')
    await file1Row.find('button[icon="more_vert"]').trigger('click')

    const deleteItem = file1Row
      .findAll('.q-item')
      .find((i) => i.text().includes('Delete'))
    await deleteItem?.trigger('click')

    expect(mockDialog).toHaveBeenCalled()
    expect(selectSpy).toHaveBeenCalled()
    expect(deleteSpy).toHaveBeenCalled()
    expect(mockNotify).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'positive' })
    )
  })
})
