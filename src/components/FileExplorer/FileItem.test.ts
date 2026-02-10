import { describe, test, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import FileItem from './FileItem.vue'
import type { FileItem as FileItemType } from 'src/types/fileExplorer'

describe('FileItem.vue', () => {
  const mockItem: FileItemType = {
    name: 'test.txt',
    path: '/test.txt',
    isDirectory: false,
    size: 1024,
    modified: new Date(),
    created: new Date(),
    extension: 'txt',
  }

  const mockFolder: FileItemType = {
    name: 'folder',
    path: '/folder',
    isDirectory: true,
    size: 0,
    modified: new Date(),
    created: new Date(),
  }

  const globalConfig = {
    stubs: {
      'q-icon': {
        props: ['name', 'color', 'size'],
        template: '<div class="q-icon" :name="name" :color="color"></div>',
      },
    },
  }

  test('renders file name and size', () => {
    const wrapper = mount(FileItem, {
      props: { item: mockItem },
      global: globalConfig,
    })

    expect(wrapper.find('.file-item__name').text()).toBe('test.txt')
    expect(wrapper.find('.file-item__size').text()).toBe('1 KB')
    expect(wrapper.classes()).not.toContain('file-item--selected')
  })

  test('renders folder without size', () => {
    const wrapper = mount(FileItem, {
      props: { item: mockFolder },
      global: globalConfig,
    })

    expect(wrapper.find('.file-item__name').text()).toBe('folder')
    expect(wrapper.find('.file-item__size').exists()).toBe(false)
  })

  test('highlights when selected', () => {
    const wrapper = mount(FileItem, {
      props: { item: mockItem, selected: true },
      global: globalConfig,
    })

    expect(wrapper.classes()).toContain('file-item--selected')
  })

  test('emits click event', async () => {
    const wrapper = mount(FileItem, {
      props: { item: mockItem },
      global: globalConfig,
    })

    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  test('emits dblclick event', async () => {
    const wrapper = mount(FileItem, {
      props: { item: mockItem },
      global: globalConfig,
    })

    await wrapper.trigger('dblclick')
    expect(wrapper.emitted('dblclick')).toBeTruthy()
  })

  test('emits contextmenu event', async () => {
    const wrapper = mount(FileItem, {
      props: { item: mockItem },
      global: globalConfig,
    })

    await wrapper.trigger('contextmenu')
    expect(wrapper.emitted('contextmenu')).toBeTruthy()
  })
})
