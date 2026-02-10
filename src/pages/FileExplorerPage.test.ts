import { describe, test, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FileExplorerPage from './FileExplorerPage.vue'

describe('FileExplorerPage.vue', () => {
  const globalConfig = {
    stubs: {
      'q-page': { template: '<div class="q-page"><slot /></div>' },
      FileExplorer: { template: '<div class="stub-file-explorer"></div>' },
    },
  }

  test('renders correctly', () => {
    const wrapper = mount(FileExplorerPage, { global: globalConfig })
    expect(wrapper.find('.stub-file-explorer').exists()).toBe(true)
  })
})
