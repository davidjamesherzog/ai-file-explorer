import { describe, test, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import App from './App.vue'

describe('App.vue', () => {
  const globalConfig = {
    stubs: {
      'router-view': { template: '<div class="router-view"></div>' },
    },
  }

  test('renders router view', () => {
    const wrapper = mount(App, { global: globalConfig })
    expect(wrapper.find('.router-view').exists()).toBe(true)
  })
})
