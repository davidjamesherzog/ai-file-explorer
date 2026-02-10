import { describe, test, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import IndexPage from './IndexPage.vue'

describe('IndexPage.vue', () => {
  const globalConfig = {
    stubs: {
      'q-page': { template: '<div class="q-page"><slot /></div>' },
      'example-component': {
        props: ['title', 'active', 'todos', 'meta'],
        template: '<div class="stub-example">{{ title }}</div>',
      },
    },
  }

  test('renders example component', () => {
    const wrapper = mount(IndexPage, { global: globalConfig })
    expect(wrapper.find('.stub-example').text()).toBe('Example component')
  })
})
